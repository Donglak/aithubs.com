// supabase/functions/_shared/vendor.ts
// Đồng bộ thuê bao listing của vendor (PayPal) vào bảng vendor_subscriptions.
// PayPal là nguồn sự thật: gói được xác định từ sub.plan_id (không tin dữ liệu client).
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { paypalFetch } from './paypal.ts';

const CUSTOM_ID_PREFIX = 'vendor:';

export function vendorCustomId(userId: string) {
  return `${CUSTOM_ID_PREFIX}${userId}`;
}

/** Trả về user id nếu subscription PayPal thuộc về vendor, ngược lại null (VIP) */
export function vendorUserFromCustomId(customId: string | undefined): string | null {
  return customId?.startsWith(CUSTOM_ID_PREFIX) ? customId.slice(CUSTOM_ID_PREFIX.length) : null;
}

export interface VendorPlanRow {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  paypal_plan_id_monthly: string | null;
  paypal_plan_id_yearly: string | null;
}

export async function findPlanByPaypalPlanId(supabase: SupabaseClient, paypalPlanId: string) {
  const { data } = await supabase
    .from('vendor_plans')
    .select('id, slug, name, is_active, paypal_plan_id_monthly, paypal_plan_id_yearly')
    .or(`paypal_plan_id_monthly.eq.${paypalPlanId},paypal_plan_id_yearly.eq.${paypalPlanId}`)
    .maybeSingle();
  if (!data) return null;
  const plan = data as VendorPlanRow;
  return { plan, interval: plan.paypal_plan_id_monthly === paypalPlanId ? 'month' as const : 'year' as const };
}

export async function cancelPaypalSubscriptionById(subscriptionId: string, reason: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  // 422 = đã hủy / không ở trạng thái hủy được
  if (!res.ok && res.status !== 422) throw new Error(`PayPal cancel failed: ${res.data?.message || res.status}`);
}

export type VendorSyncResult = {
  status: 'active' | 'pending' | 'canceled' | 'past_due' | 'ignored';
  plan?: string;
};

/**
 * Áp trạng thái một PayPal subscription của vendor vào DB.
 * Mỗi vendor chỉ có 1 dòng vendor_subscriptions; khi đổi gói, subscription mới hơn thắng
 * và subscription cũ bị hủy trên PayPal để không bị trừ tiền 2 lần.
 */
export async function syncVendorSubscription(supabase: SupabaseClient, sub: Record<string, any>): Promise<VendorSyncResult> {
  const userId = vendorUserFromCustomId(sub.custom_id);
  if (!userId) return { status: 'ignored' };

  const { data: current } = await supabase
    .from('vendor_subscriptions')
    .select('id, status, paypal_subscription_id, current_period_start, current_period_end')
    .eq('vendor_id', userId)
    .maybeSingle();

  const isCurrent = current?.paypal_subscription_id === sub.id;
  const now = new Date().toISOString();

  switch (sub.status as string) {
    case 'ACTIVE': {
      const match = await findPlanByPaypalPlanId(supabase, sub.plan_id);
      if (!match) {
        console.error(`Vendor subscription ${sub.id} uses unknown PayPal plan ${sub.plan_id}`);
        return { status: 'ignored' };
      }

      // Đang có một subscription khác còn hiệu lực -> giữ cái mới hơn, hủy cái cũ
      if (current?.paypal_subscription_id && !isCurrent && ['active', 'trialing'].includes(current.status)) {
        const currentStart = current.current_period_start ? Date.parse(current.current_period_start) : 0;
        const incomingStart = sub.start_time ? Date.parse(sub.start_time) : Date.now();
        if (incomingStart < currentStart) {
          await cancelPaypalSubscriptionById(sub.id, 'Superseded by a newer subscription').catch(console.error);
          return { status: 'ignored' };
        }
        await cancelPaypalSubscriptionById(current.paypal_subscription_id, 'Switched to another plan').catch(console.error);
      }

      await supabase.from('vendor_subscriptions').upsert({
        vendor_id: userId,
        plan_id: match.plan.id,
        status: 'active',
        gateway: 'paypal',
        paypal_subscription_id: sub.id,
        billing_interval: match.interval,
        current_period_start: sub.start_time ?? now,
        current_period_end: sub.billing_info?.next_billing_time ?? null,
        cancel_at_period_end: false,
        updated_at: now,
      }, { onConflict: 'vendor_id' });

      return { status: 'active', plan: match.plan.slug };
    }

    case 'CANCELLED': {
      if (!isCurrent) return { status: 'ignored' };
      const periodEnd = current?.current_period_end ? Date.parse(current.current_period_end) : 0;
      // Đã trả tới hết kỳ -> listing vẫn hiển thị tới current_period_end (xem vendor_active_plan)
      await supabase.from('vendor_subscriptions').update(
        periodEnd > Date.now()
          ? { cancel_at_period_end: true, updated_at: now }
          : { status: 'canceled', updated_at: now },
      ).eq('vendor_id', userId);
      return { status: 'canceled' };
    }

    case 'SUSPENDED': {
      if (!isCurrent) return { status: 'ignored' };
      // Thanh toán thất bại -> ẩn listing cho tới khi PayPal thu được tiền
      await supabase.from('vendor_subscriptions').update({ status: 'past_due', updated_at: now }).eq('vendor_id', userId);
      return { status: 'past_due' };
    }

    case 'EXPIRED': {
      if (!isCurrent) return { status: 'ignored' };
      await supabase.from('vendor_subscriptions').update({ status: 'canceled', updated_at: now }).eq('vendor_id', userId);
      return { status: 'canceled' };
    }

    default:
      // APPROVAL_PENDING / APPROVED: người mua chưa hoàn tất
      return { status: 'pending' };
  }
}
