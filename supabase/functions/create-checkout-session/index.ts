// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const vnpTmnCode = Deno.env.get('VNP_TMN_CODE')!;
const vnpHashSecret = Deno.env.get('VNP_HASH_SECRET')!;
const vnpUrl = Deno.env.get('VNP_URL')!;
const momoPartnerCode = Deno.env.get('MOMO_PARTNER_CODE')!;
const momoAccessKey = Deno.env.get('MOMO_ACCESS_KEY')!;
const momoSecretKey = Deno.env.get('MOMO_SECRET_KEY')!;
const momoEndpoint = Deno.env.get('MOMO_ENDPOINT')!;
const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
const paypalSecret = Deno.env.get('PAYPAL_SECRET')!;
const paypalBase = Deno.env.get('PAYPAL_BASE')!;
const siteUrl = Deno.env.get('SITE_URL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });

function generateId(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

async function createVnpayHash(params: Record<string, string>, secret: string) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(sorted));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createMomoSignature(raw: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(raw));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getPaypalAccessToken() {
  const auth = btoa(`${paypalClientId}:${paypalSecret}`);
  const res = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return (await res.json()).access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('Invalid token');

    const body = await req.json();
    const { type, gateway, amount, currency, metadata, returnUrl, cancelUrl } = body;

    if (!['ebook', 'vip_subscription'].includes(type)) throw new Error('Invalid type');
    if (!['stripe', 'vnpay', 'momo', 'paypal'].includes(gateway)) throw new Error('Invalid gateway');
    if (!amount || amount <= 0) throw new Error('Invalid amount');

    const orderId = await supabase.rpc('create_pending_order', {
      p_user_id: user.id,
      p_type: type,
      p_amount: amount,
      p_currency: currency,
      p_gateway: gateway,
      p_metadata: metadata || {},
    }).then(r => { if (r.error) throw r.error; return r.data; });

    let result: any = { orderId };

    if (gateway === 'stripe') {
      // Get or create Stripe customer
      let { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
      let customerId = profile?.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_uid: user.id } });
        customerId = customer.id;
        await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
      }

      if (type === 'ebook') {
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: { currency: currency.toLowerCase(), unit_amount: amount, product_data: { name: metadata.ebook_title || 'Ebook', description: metadata.ebook_description } },
            quantity: 1,
          }],
          success_url: `${returnUrl || siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${cancelUrl || siteUrl}/payment/cancel`,
          metadata: { order_id: orderId, type, user_id: user.id },
        });
        result = { ...result, sessionId: session.id, url: session.url };
      } else {
        const priceId = currency === 'vnd'
          ? (amount === 249000 ? Deno.env.get('STRIPE_PRICE_VIP_MONTHLY_VND') : Deno.env.get('STRIPE_PRICE_VIP_YEARLY_VND'))
          : (amount === 999 ? Deno.env.get('STRIPE_PRICE_VIP_MONTHLY_USD') : Deno.env.get('STRIPE_PRICE_VIP_YEARLY_USD'));
        if (!priceId) throw new Error('Missing Stripe Price ID for VIP plan');

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${returnUrl || siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${cancelUrl || siteUrl}/payment/cancel`,
          subscription_data: { trial_period_days: 7, metadata: { order_id: orderId, plan: metadata.plan, user_id: user.id } },
          metadata: { order_id: orderId, type, user_id: user.id },
        });
        result = { ...result, sessionId: session.id, url: session.url };
      }
    }

    else if (gateway === 'vnpay') {
      const vnp_TxnRef = generateId('VNP');
      const vnp_OrderInfo = `Thanh toan ${type === 'ebook' ? 'Ebook' : 'VIP'} - Order ${orderId}`;
      const vnp_Amount = amount * 100;

      const params: Record<string, string> = {
        vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: vnpTmnCode,
        vnp_Amount: String(vnp_Amount), vnp_CurrCode: 'VND', vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo, vnp_OrderType: 'other', vnp_Locale: 'vn',
        vnp_ReturnUrl: `${siteUrl}/api/vnpay-return?orderId=${orderId}`,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: new Date().toISOString().slice(0, 19).replace(/[-:T]/g, ''),
      };

      const hash = await createVnpayHash(params, vnpHashSecret);
      params.vnp_SecureHash = hash;

      const query = new URLSearchParams(params).toString();
      const paymentUrl = `${vnpUrl}?${query}`;

      await supabase.from('orders').update({ payment_intent_id: vnp_TxnRef }).eq('id', orderId);
      result = { ...result, url: paymentUrl, vnpTxnRef: vnp_TxnRef };
    }

    else if (gateway === 'momo') {
      const orderIdMomo = generateId('MOMO');
      const requestId = generateId('REQ');
      const orderInfo = `Thanh toan ${type === 'ebook' ? 'Ebook' : 'VIP'}`;
      const redirectUrl = `${siteUrl}/api/momo-return?orderId=${orderId}`;
      const ipnUrl = `${siteUrl}/api/momo-ipn?orderId=${orderId}`;

      const rawSignature = `accessKey=${momoAccessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderIdMomo}&orderInfo=${orderInfo}&partnerCode=${momoPartnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
      const signature = await createMomoSignature(rawSignature, momoSecretKey);

      const momoBody = {
        partnerCode: momoPartnerCode, partnerName: 'AIThubs', storeId: 'AIThubsStore',
        requestId, amount: String(amount), orderId: orderIdMomo, orderInfo,
        redirectUrl, ipnUrl, lang: 'vi', requestType: 'captureWallet', extraData: '', signature,
      };

      const momoRes = await fetch(momoEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(momoBody),
      }).then(r => r.json());

      if (momoRes.resultCode !== 0) throw new Error(`MoMo error: ${momoRes.message}`);

      await supabase.from('orders').update({ payment_intent_id: orderIdMomo, payment_session_id: momoRes.requestId }).eq('id', orderId);
      result = { ...result, url: momoRes.payUrl, momoOrderId: orderIdMomo };
    }

    else if (gateway === 'paypal') {
      const accessToken = await getPaypalAccessToken();
      const isSubscription = type === 'vip_subscription';

      const planId = currency === 'vnd'
        ? (amount === 249000 ? Deno.env.get('PAYPAL_PLAN_VIP_MONTHLY_VND') : Deno.env.get('PAYPAL_PLAN_VIP_YEARLY_VND'))
        : (amount === 999 ? Deno.env.get('PAYPAL_PLAN_VIP_MONTHLY_USD') : Deno.env.get('PAYPAL_PLAN_VIP_YEARLY_USD'));

      if (isSubscription && !planId) throw new Error('Missing PayPal Plan ID for VIP');

      if (isSubscription) {
        const subRes = await fetch(`${paypalBase}/v1/billing/subscriptions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: planId,
            application_context: {
              brand_name: 'AIThubs', locale: 'vi-VN', shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              return_url: `${returnUrl || siteUrl}/payment/success?orderId=${orderId}`,
              cancel_url: `${cancelUrl || siteUrl}/payment/cancel`,
            },
          }),
        }).then(r => r.json());

        result = { ...result, subscriptionId: subRes.id, url: subRes.links?.find((l: any) => l.rel === 'approve')?.href };
      } else {
        const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: currency.toUpperCase(), value: (amount / (currency === 'vnd' ? 1 : 100)).toFixed(currency === 'vnd' ? 0 : 2) }, description: metadata.ebook_title || 'Ebook', custom_id: orderId }],
            application_context: {
              brand_name: 'AIThubs', locale: 'vi-VN', shipping_preference: 'NO_SHIPPING',
              return_url: `${returnUrl || siteUrl}/payment/success?orderId=${orderId}`,
              cancel_url: `${cancelUrl || siteUrl}/payment/cancel`,
            },
          }),
        }).then(r => r.json());

        result = { ...result, orderId: orderRes.id, url: orderRes.links?.find((l: any) => l.rel === 'approve')?.href };
      }
    }

    return new Response(JSON.stringify({ success: true, data: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});