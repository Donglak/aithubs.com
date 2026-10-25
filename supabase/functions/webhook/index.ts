// supabase/functions/webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { getPaypalSubscription, verifyPaypalWebhook } from '../_shared/paypal.ts';
import { syncVendorSubscription, vendorUserFromCustomId } from '../_shared/vendor.ts';
import { isGatewayEnabled } from '../_shared/gateways.ts';
import {
  confirmPaypalOrder,
  getOrder,
  grantVipAccess as grantVip,
  markFailed,
  revokeVipAccess as revokeVip,
  sendDownloadEmail,
  syncPaypalSubscription,
} from '../_shared/orders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, paypal-transmission-id, paypal-transmission-time, paypal-cert-url, paypal-auth-algo',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vnpHashSecret = Deno.env.get('VNP_HASH_SECRET')!;
const momoSecretKey = Deno.env.get('MOMO_SECRET_KEY')!;
const siteUrl = Deno.env.get('SITE_URL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Khởi tạo Stripe khi cần — tránh làm hỏng webhook PayPal khi chưa cấu hình Stripe
let stripeClient: Stripe | null = null;
function getStripe() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Stripe is not configured');
  stripeClient ??= new Stripe(key, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });
  return stripeClient;
}

async function updateOrderStatus(orderId: string, status: 'COMPLETED' | 'FAILED', extra: any = {}) {
  const updates: any = { status, updated_at: new Date().toISOString(), ...extra };
  if (status === 'COMPLETED') updates.paid_at = new Date().toISOString();
  if (status === 'FAILED') updates.failed_at = new Date().toISOString();
  await supabase.from('orders').update(updates).eq('id', orderId);
}

/** custom_id "vendor:<uid>" -> thuê bao listing của vendor, còn lại là VIP */
async function syncSubscription(subscriptionId: string) {
  const sub = await getPaypalSubscription(subscriptionId);
  if (vendorUserFromCustomId(sub.custom_id)) await syncVendorSubscription(supabase, sub);
  else await syncPaypalSubscription(supabase, sub);
}

const grantVipAccess = (userId: string, sub: Record<string, unknown>) => grantVip(supabase, userId, sub);
const revokeVipAccess = (userId: string) => revokeVip(supabase, userId);

async function verifyVnpayHash(params: Record<string, string>, secret: string) {
  const { vnp_SecureHash, ...rest } = params;
  const sorted = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(sorted));
  const calcHash = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return calcHash === vnp_SecureHash;
}

async function verifyMomoSignature(data: any, secret: string) {
  const { signature, ...rest } = data;
  const raw = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(raw));
  const calcSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return calcSig === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // PayPal không gửi header x-gateway -> nhận diện qua header chữ ký của PayPal hoặc ?gateway=paypal
  const gateway = req.headers.get('x-gateway')
    || new URL(req.url).searchParams.get('gateway')
    || (req.headers.get('paypal-transmission-id') ? 'paypal' : 'stripe');

  // vnpay_return / vnpay_ipn -> vnpay, momo_ipn -> momo ...
  if (!isGatewayEnabled(gateway.split('_')[0])) {
    return new Response('Gateway disabled', { status: 404, headers: corsHeaders });
  }

  try {
    // ===== STRIPE WEBHOOK =====
    if (gateway === 'stripe') {
      const stripe = getStripe();
      const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
      const sig = req.headers.get('stripe-signature')!;
      const body = await req.text();
      let event: Stripe.Event;
      try {
        event = await stripe.webhooks.constructEventAsync(body, sig, stripeWebhookSecret);
      } catch (err) {
        console.error('Stripe webhook verify failed:', err);
        return new Response('Webhook signature verification failed', { status: 400, headers: corsHeaders });
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.order_id;
          const type = session.metadata?.type;
          const userId = session.metadata?.user_id;

          if (!orderId) break;

          if (type === 'ebook') {
            await updateOrderStatus(orderId, 'COMPLETED', { payment_intent_id: session.payment_intent as string });
            await sendDownloadEmail(orderId);
          } else if (type === 'vip_subscription') {
            await updateOrderStatus(orderId, 'COMPLETED', { payment_session_id: session.id });
          }
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = invoice.subscription as string;
          if (!subId) break;

          const subscription = await stripe.subscriptions.retrieve(subId);
          const userId = subscription.metadata?.user_id;
          const orderId = subscription.metadata?.order_id;
          const plan = subscription.metadata?.plan;

          if (userId) {
            await grantVipAccess(userId, {
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subId,
              stripe_price_id: subscription.items.data[0]?.price.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              plan,
              status: subscription.status,
              currency: subscription.currency,
              amount: subscription.items.data[0]?.price.unit_amount || 0,
              interval: subscription.items.data[0]?.price.recurring?.interval,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              metadata: subscription.metadata,
            });
          }
          if (orderId) await updateOrderStatus(orderId, 'COMPLETED');
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.user_id;
          if (!userId) break;

          if (subscription.status === 'canceled' || subscription.status === 'unpaid' || event.type === 'customer.subscription.deleted') {
            await revokeVipAccess(userId);
          } else {
            await grantVipAccess(userId, {
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              plan: subscription.metadata?.plan,
              status: subscription.status,
              currency: subscription.currency,
              amount: subscription.items.data[0]?.price.unit_amount || 0,
              interval: subscription.items.data[0]?.price.recurring?.interval,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              metadata: subscription.metadata,
            });
          }
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.order_id;
          if (orderId) await updateOrderStatus(orderId, 'FAILED', { failure_reason: 'Session expired' });
          break;
        }
      }

      return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== VNPAY RETURN (GET redirect) =====
    if (gateway === 'vnpay_return') {
      const url = new URL(req.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => params[k] = v);

      const valid = await verifyVnpayHash(params, vnpHashSecret);
      const orderId = params.vnp_TxnRef;
      const responseCode = params.vnp_ResponseCode;

      if (valid && responseCode === '00') {
        await updateOrderStatus(orderId, 'COMPLETED', { payment_intent_id: params.vnp_TxnRef });
        const { data: order } = await supabase.from('orders').select('type, metadata').eq('id', orderId).single();
        if (order?.type === 'ebook') await sendDownloadEmail(orderId);
        return new Response(null, { status: 302, headers: { Location: `${siteUrl}/payment/success?orderId=${orderId}` } });
      } else {
        await updateOrderStatus(orderId, 'FAILED', { failure_reason: `VNPay: ${params.vnp_ResponseCode}` });
        return new Response(null, { status: 302, headers: { Location: `${siteUrl}/payment/cancel?orderId=${orderId}` } });
      }
    }

    // ===== VNPAY IPN (Server-to-server) =====
    if (gateway === 'vnpay_ipn') {
      const url = new URL(req.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => params[k] = v);

      const valid = await verifyVnpayHash(params, vnpHashSecret);
      const orderId = params.vnp_TxnRef;
      const responseCode = params.vnp_ResponseCode;

      if (valid && responseCode === '00') {
        await updateOrderStatus(orderId, 'COMPLETED', { payment_intent_id: params.vnp_TxnRef });
        return new Response(JSON.stringify({ RspCode: '00', Message: 'Confirm Success' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ RspCode: '99', Message: 'Invalid signature' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== MOMO IPN =====
    if (gateway === 'momo_ipn') {
      const json = await req.json();
      const valid = await verifyMomoSignature(json, momoSecretKey);
      const orderId = json.orderId;
      const resultCode = json.resultCode;
      const momoOrderId = json.orderId;

      if (valid && resultCode === 0) {
        await updateOrderStatus(orderId, 'COMPLETED', { payment_intent_id: momoOrderId });
        const { data: order } = await supabase.from('orders').select('type').eq('id', orderId).single();
        if (order?.type === 'ebook') await sendDownloadEmail(orderId);
        return new Response(JSON.stringify({ resultCode: 0, message: 'Success' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      await updateOrderStatus(orderId, 'FAILED', { failure_reason: `MoMo: ${json.message}` });
      return new Response(JSON.stringify({ resultCode: 1, message: 'Failed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== MOMO RETURN =====
    if (gateway === 'momo_return') {
      const url = new URL(req.url);
      const orderId = url.searchParams.get('orderId');
      const resultCode = url.searchParams.get('resultCode');
      if (resultCode === '0') {
        return new Response(null, { status: 302, headers: { Location: `${siteUrl}/payment/success?orderId=${orderId}` } });
      }
      return new Response(null, { status: 302, headers: { Location: `${siteUrl}/payment/cancel?orderId=${orderId}` } });
    }

    // ===== PAYPAL WEBHOOK =====
    if (gateway === 'paypal') {
      const rawBody = await req.text();

      // Bắt buộc xác thực chữ ký — nếu không, ai cũng có thể giả event "đã thanh toán"
      if (!(await verifyPaypalWebhook(req.headers, rawBody))) {
        console.warn('PayPal webhook signature verification failed');
        return new Response('Invalid signature', { status: 401, headers: corsHeaders });
      }

      const event = JSON.parse(rawBody);
      const eventType: string = event.event_type;
      const resource = event.resource ?? {};

      switch (eventType) {
        // Ebook: người mua đã approve / tiền đã về. confirmPaypalOrder tự capture
        // nếu cần và đối chiếu số tiền; gọi lặp lại vẫn an toàn.
        case 'CHECKOUT.ORDER.APPROVED':
        case 'PAYMENT.CAPTURE.COMPLETED': {
          const orderId = resource.custom_id ?? resource.purchase_units?.[0]?.custom_id;
          const order = orderId ? await getOrder(supabase, orderId) : null;
          if (order?.payment_gateway === 'paypal' && order.type === 'ebook') await confirmPaypalOrder(supabase, order);
          break;
        }

        case 'PAYMENT.CAPTURE.DENIED': {
          if (resource.custom_id) await markFailed(supabase, resource.custom_id, 'PayPal capture denied');
          break;
        }

        // Subscription (VIP hoặc thuê bao listing của vendor): luôn đọc lại trạng thái từ PayPal
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
        case 'BILLING.SUBSCRIPTION.UPDATED':
        case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          await syncSubscription(resource.id);
          break;

        // Thanh toán gia hạn hàng tháng/năm
        case 'PAYMENT.SALE.COMPLETED':
          if (resource.billing_agreement_id) await syncSubscription(resource.billing_agreement_id);
          break;
      }

      return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response('Unknown gateway', { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});