// supabase/functions/_shared/orders.ts
// Hoàn tất đơn hàng PayPal — dùng chung cho paypal-confirm (khi user quay lại site)
// và webhook (khi user đóng trình duyệt trước khi quay lại).
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PAID_EBOOKS, VIP_PRICES, type VipPlan } from './pricing.ts';
import { capturePaypalOrder, firstCapture, getPaypalSubscription, planFromPaypalPlanId } from './paypal.ts';

export interface OrderRow {
  id: string;
  user_id: string;
  type: 'ebook' | 'vip_subscription';
  status: string;
  amount: number;
  currency: 'usd' | 'vnd';
  payment_gateway: string;
  payment_session_id: string | null;
  metadata: Record<string, any>;
}

export type ConfirmResult =
  | { status: 'COMPLETED'; type: 'ebook'; deliveryUrl: string; title: string }
  | { status: 'COMPLETED'; type: 'vip_subscription'; plan: VipPlan }
  | { status: 'PENDING' | 'FAILED'; type: OrderRow['type']; reason?: string };

export async function getOrder(supabase: SupabaseClient, orderId: string): Promise<OrderRow | null> {
  const { data } = await supabase
    .from('orders')
    .select('id, user_id, type, status, amount, currency, payment_gateway, payment_session_id, metadata')
    .eq('id', orderId)
    .maybeSingle();
  return data as OrderRow | null;
}

/**
 * Chuyển order sang COMPLETED đúng một lần.
 * Trả về true nếu lần gọi này là lần chuyển trạng thái (để chỉ gửi email 1 lần).
 */
async function markCompleted(supabase: SupabaseClient, orderId: string, extra: Record<string, unknown>) {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('orders')
    .update({ status: 'COMPLETED', paid_at: now, updated_at: now, ...extra })
    .eq('id', orderId)
    .neq('status', 'COMPLETED')
    .select('id');
  return (data?.length ?? 0) > 0;
}

export async function markFailed(supabase: SupabaseClient, orderId: string, reason: string) {
  const now = new Date().toISOString();
  await supabase
    .from('orders')
    .update({ status: 'FAILED', failed_at: now, updated_at: now, failure_reason: reason })
    .eq('id', orderId)
    .neq('status', 'COMPLETED');
}

export async function sendDownloadEmail(orderId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-download-link`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
  } catch (err) {
    // Email lỗi không được làm hỏng việc ghi nhận thanh toán; user vẫn lấy link ở trang success
    console.error('sendDownloadEmail failed:', err);
  }
}

// VIP được xác định bằng bảng subscriptions (profiles.role chỉ còn user/vendor/admin)
export async function grantVipAccess(supabase: SupabaseClient, userId: string, sub: Record<string, unknown>) {
  await supabase.from('subscriptions').upsert({ user_id: userId, ...sub, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

export async function revokeVipAccess(supabase: SupabaseClient, userId: string) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('user_id', userId);
}

function ebookResult(order: OrderRow): ConfirmResult {
  const ebook = PAID_EBOOKS[String(order.metadata?.ebook_id)];
  return { status: 'COMPLETED', type: 'ebook', deliveryUrl: ebook?.deliveryUrl ?? '', title: ebook?.title ?? 'Ebook' };
}

/** Capture + đối chiếu số tiền cho đơn ebook thanh toán bằng PayPal */
async function confirmPaypalEbook(supabase: SupabaseClient, order: OrderRow): Promise<ConfirmResult> {
  if (order.status === 'COMPLETED') return ebookResult(order);
  if (!order.payment_session_id) return { status: 'FAILED', type: 'ebook', reason: 'Missing PayPal order id' };

  let paypalOrder;
  try {
    paypalOrder = await capturePaypalOrder(order.payment_session_id);
  } catch (err) {
    // Người mua chưa approve (đóng popup) -> vẫn PENDING, có thể thử lại
    return { status: 'PENDING', type: 'ebook', reason: (err as Error).message };
  }

  const cap = firstCapture(paypalOrder);
  if (cap.status !== 'COMPLETED') {
    return { status: 'PENDING', type: 'ebook', reason: `PayPal capture status: ${cap.status}` };
  }
  // Chống giả mạo: số tiền/tiền tệ thực nhận phải khớp đơn đã tạo ở server
  if (cap.customId !== order.id || cap.amountCents !== order.amount || cap.currency !== order.currency) {
    await markFailed(supabase, order.id, `Amount mismatch: got ${cap.amountCents} ${cap.currency}`);
    return { status: 'FAILED', type: 'ebook', reason: 'Paid amount does not match the order' };
  }

  const transitioned = await markCompleted(supabase, order.id, { payment_intent_id: cap.captureId });
  if (transitioned) await sendDownloadEmail(order.id);
  return ebookResult(order);
}

/** Đồng bộ trạng thái subscription PayPal vào DB, trả về kết quả cho order gốc */
export async function syncPaypalSubscription(
  supabase: SupabaseClient,
  subscription: string | Record<string, any>,
): Promise<ConfirmResult | null> {
  const sub = typeof subscription === 'string' ? await getPaypalSubscription(subscription) : subscription;
  const order = sub.custom_id ? await getOrder(supabase, sub.custom_id) : null;
  if (!order || order.type !== 'vip_subscription') return null;

  const plan = planFromPaypalPlanId(sub.plan_id) ?? (order.metadata?.plan as VipPlan);
  const status: string = sub.status; // APPROVAL_PENDING | APPROVED | ACTIVE | SUSPENDED | CANCELLED | EXPIRED

  if (status === 'ACTIVE') {
    await grantVipAccess(supabase, order.user_id, {
      stripe_subscription_id: sub.id, // cột dùng chung cho id subscription của mọi cổng
      stripe_price_id: sub.plan_id,
      stripe_current_period_end: sub.billing_info?.next_billing_time ?? null,
      plan,
      status: 'active',
      currency: 'usd',
      amount: VIP_PRICES[plan].usd,
      interval: VIP_PRICES[plan].interval,
      cancel_at_period_end: false,
      metadata: { gateway: 'paypal', paypal_subscription_id: sub.id },
    });
    await markCompleted(supabase, order.id, { payment_intent_id: sub.id });
    return { status: 'COMPLETED', type: 'vip_subscription', plan };
  }

  if (status === 'CANCELLED' || status === 'EXPIRED' || status === 'SUSPENDED') {
    const { data: current } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_current_period_end')
      .eq('user_id', order.user_id)
      .maybeSingle();

    // Chỉ đụng tới subscription đang gắn với user
    if (current?.stripe_subscription_id === sub.id) {
      const periodEnd = current.stripe_current_period_end ? new Date(current.stripe_current_period_end) : null;
      if (status === 'CANCELLED' && periodEnd && periodEnd > new Date()) {
        // Đã trả tiền tới hết kỳ -> giữ VIP, get-subscription sẽ thu hồi khi hết hạn
        await supabase
          .from('subscriptions')
          .update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() })
          .eq('user_id', order.user_id);
      } else {
        await revokeVipAccess(supabase, order.user_id);
      }
    }
    if (order.status !== 'COMPLETED') await markFailed(supabase, order.id, `PayPal subscription ${status}`);
    return { status: 'FAILED', type: 'vip_subscription', reason: status };
  }

  return { status: 'PENDING', type: 'vip_subscription', reason: status };
}

export async function confirmPaypalOrder(supabase: SupabaseClient, order: OrderRow): Promise<ConfirmResult> {
  if (order.payment_gateway !== 'paypal') throw new Error('Order was not paid with PayPal');
  if (order.type === 'ebook') return confirmPaypalEbook(supabase, order);

  if (!order.payment_session_id) return { status: 'FAILED', type: order.type, reason: 'Missing PayPal subscription id' };
  return (await syncPaypalSubscription(supabase, order.payment_session_id)) ?? { status: 'PENDING', type: order.type };
}
