// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { resolveEbook, resolveVipPlan, VIP_PRICES } from '../_shared/pricing.ts';
import { isGatewayEnabled } from '../_shared/gateways.ts';
import { approveLink, centsToPaypal, paypalFetch, paypalPlanId } from '../_shared/paypal.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vnpTmnCode = Deno.env.get('VNP_TMN_CODE')!;
const vnpHashSecret = Deno.env.get('VNP_HASH_SECRET')!;
const vnpUrl = Deno.env.get('VNP_URL')!;
const momoPartnerCode = Deno.env.get('MOMO_PARTNER_CODE')!;
const momoAccessKey = Deno.env.get('MOMO_ACCESS_KEY')!;
const momoSecretKey = Deno.env.get('MOMO_SECRET_KEY')!;
const momoEndpoint = Deno.env.get('MOMO_ENDPOINT')!;
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Khởi tạo Stripe khi cần — tránh làm hỏng cả function khi chưa có STRIPE_SECRET_KEY
let stripeClient: Stripe | null = null;
function getStripe() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Stripe is not configured');
  stripeClient ??= new Stripe(key, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });
  return stripeClient;
}

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
    const { type, gateway } = body;
    const currency: 'usd' | 'vnd' = body.currency === 'vnd' ? 'vnd' : 'usd';

    if (!['ebook', 'vip_subscription'].includes(type)) throw new Error('Invalid type');
    if (!isGatewayEnabled(gateway)) throw new Error('Payment method is not available');
    if (gateway === 'paypal' && currency !== 'usd') throw new Error('PayPal only supports USD');
    if ((gateway === 'vnpay' || gateway === 'momo') && currency !== 'vnd') throw new Error(`${gateway} only supports VND`);

    // Số tiền luôn lấy từ bảng giá server, bỏ qua body.amount do client gửi
    let amount: number;
    let metadata: Record<string, string>;
    if (type === 'ebook') {
      const ebook = resolveEbook(body.metadata?.ebook_id);
      if (currency !== 'usd') throw new Error('Ebooks are sold in USD only');
      amount = ebook.price_usd;
      metadata = { ebook_id: ebook.id, ebook_title: ebook.title };
    } else {
      const plan = resolveVipPlan(body.metadata?.plan);
      amount = VIP_PRICES[plan][currency];
      metadata = { plan };
    }

    const successUrl = (orderId: string) => `${siteUrl}/payment/success?orderId=${orderId}&type=${type === 'ebook' ? 'ebook' : 'vip'}`;
    const cancelUrl = (orderId: string) => `${siteUrl}/payment/cancel?orderId=${orderId}`;

    const orderId = await supabase.rpc('create_pending_order', {
      p_user_id: user.id,
      p_type: type,
      p_amount: amount,
      p_currency: currency,
      p_gateway: gateway,
      p_metadata: metadata,
    }).then(r => { if (r.error) throw r.error; return r.data; });

    let result: any = { orderId };

    if (gateway === 'stripe') {
      const stripe = getStripe();
      // Get or create Stripe customer
      const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
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
            price_data: { currency: currency.toLowerCase(), unit_amount: amount, product_data: { name: metadata.ebook_title } },
            quantity: 1,
          }],
          success_url: `${successUrl(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl(orderId),
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
          success_url: `${successUrl(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl(orderId),
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
      const appContext = {
        brand_name: 'AIThubs',
        shipping_preference: 'NO_SHIPPING',
        return_url: successUrl(orderId),
        cancel_url: cancelUrl(orderId),
      };

      if (type === 'vip_subscription') {
        const sub = await paypalFetch('/v1/billing/subscriptions', {
          method: 'POST',
          requestId: `sub-${orderId}`,
          body: JSON.stringify({
            plan_id: paypalPlanId(metadata.plan as 'vip_monthly' | 'vip_yearly'),
            custom_id: orderId, // webhook/confirm tra ngược về order -> user, plan
            subscriber: { email_address: user.email },
            application_context: { ...appContext, user_action: 'SUBSCRIBE_NOW' },
          }),
        });
        if (!sub.ok) throw new Error(`PayPal: ${sub.data?.message || sub.status}`);

        await supabase.from('orders').update({ payment_session_id: sub.data.id }).eq('id', orderId);
        result = { ...result, subscriptionId: sub.data.id, url: approveLink(sub.data) };
      } else {
        const paypalOrder = await paypalFetch('/v2/checkout/orders', {
          method: 'POST',
          requestId: `order-${orderId}`,
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              reference_id: orderId,
              custom_id: orderId,
              description: metadata.ebook_title.slice(0, 127),
              amount: { currency_code: 'USD', value: centsToPaypal(amount) },
            }],
            payment_source: {
              paypal: { experience_context: { ...appContext, user_action: 'PAY_NOW' } },
            },
          }),
        });
        if (!paypalOrder.ok) throw new Error(`PayPal: ${paypalOrder.data?.message || paypalOrder.status}`);

        await supabase.from('orders').update({ payment_session_id: paypalOrder.data.id }).eq('id', orderId);
        result = { ...result, paypalOrderId: paypalOrder.data.id, url: approveLink(paypalOrder.data) };
      }

      if (!result.url) throw new Error('PayPal did not return an approval link');
    }

    return new Response(JSON.stringify({ success: true, data: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});