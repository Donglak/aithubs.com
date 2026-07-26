// supabase/functions/webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, paypal-transmission-id, paypal-transmission-time, paypal-cert-url, paypal-auth-algo',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const vnpHashSecret = Deno.env.get('VNP_HASH_SECRET')!;
const momoSecretKey = Deno.env.get('MOMO_SECRET_KEY')!;
const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')!;
const siteUrl = Deno.env.get('SITE_URL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });

async function updateOrderStatus(orderId: string, status: 'COMPLETED' | 'FAILED', extra: any = {}) {
  const updates: any = { status, updated_at: new Date().toISOString(), ...extra };
  if (status === 'COMPLETED') updates.paid_at = new Date().toISOString();
  if (status === 'FAILED') updates.failed_at = new Date().toISOString();
  await supabase.from('orders').update(updates).eq('id', orderId);
}

async function grantVipAccess(userId: string, subscriptionData: any) {
  await supabase.from('profiles').update({ role: 'vip' }).eq('id', userId);
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: subscriptionData.stripe_customer_id,
    stripe_subscription_id: subscriptionData.stripe_subscription_id,
    stripe_price_id: subscriptionData.stripe_price_id,
    stripe_current_period_end: subscriptionData.current_period_end,
    plan: subscriptionData.plan,
    status: subscriptionData.status,
    currency: subscriptionData.currency,
    amount: subscriptionData.amount,
    interval: subscriptionData.interval,
    trial_end: subscriptionData.trial_end,
    cancel_at_period_end: subscriptionData.cancel_at_period_end,
    metadata: subscriptionData.metadata,
  }, { onConflict: 'user_id' });
}

async function revokeVipAccess(userId: string) {
  await supabase.from('profiles').update({ role: 'free' }).eq('id', userId);
  await supabase.from('subscriptions').update({ status: 'canceled', canceled_at: new Date().toISOString() }).eq('user_id', userId);
}

async function sendDownloadEmail(orderId: string) {
  await fetch(`${siteUrl}/functions/v1/send-download-link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${supabaseServiceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
}

function verifyVnpayHash(params: Record<string, string>, secret: string) {
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

  const gateway = req.headers.get('x-gateway') || 'stripe';

  try {
    // ===== STRIPE WEBHOOK =====
    if (gateway === 'stripe') {
      const sig = req.headers.get('stripe-signature')!;
      const body = await req.text();
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
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
      const eventType = json.event_type;
      const resource = json.resource;

      if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId = resource.custom_id;
        if (orderId) {
          await updateOrderStatus(orderId, 'COMPLETED', { payment_intent_id: resource.id });
          const { data: order } = await supabase.from('orders').select('type').eq('id', orderId).single();
          if (order?.type === 'ebook') await sendDownloadEmail(orderId);
        }
      } else if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' || eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
        const subId = resource.id;
        const userId = resource.custom_id;
        const planId = resource.plan_id;
        if (userId) {
          await grantVipAccess(userId, {
            stripe_customer_id: '',
            stripe_subscription_id: subId,
            stripe_price_id: planId,
            current_period_end: new Date(resource.billing_info?.next_billing_time).toISOString(),
            plan: planId?.includes('monthly') ? 'vip_monthly' : 'vip_yearly',
            status: 'active',
            currency: resource.billing_info?.last_payment?.amount?.currency_code?.toLowerCase() || 'usd',
            amount: Math.round(parseFloat(resource.billing_info?.last_payment?.amount?.value || '0') * 100),
            interval: resource.billing_info?.cycle_frequency?.interval_unit === 'MONTH' ? 'month' : 'year',
            trial_end: null,
            cancel_at_period_end: false,
            metadata: { paypal_subscription_id: subId },
          });
        }
      } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
        const subId = resource.id;
        const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', subId).single();
        if (sub?.user_id) await revokeVipAccess(sub.user_id);
      }

      return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response('Unknown gateway', { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});