// supabase/functions/cancel-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { paypalFetch } from '../_shared/paypal.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

let stripeClient: Stripe | null = null;
function getStripe() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Stripe is not configured');
  stripeClient ??= new Stripe(key, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });
  return stripeClient;
}

// PayPal không có "hủy cuối kỳ": luôn hủy ngay để dừng trừ tiền,
// còn quyền VIP được giữ tới hết kỳ đã trả (xử lý ở DB bên dưới).
async function cancelPaypalSubscription(subscriptionId: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: 'User requested cancellation' }),
  });
  // 422 SUBSCRIPTION_STATUS_INVALID = đã hủy trước đó
  if (!res.ok && res.status !== 422) throw new Error(`PayPal cancel failed: ${res.data?.message || res.status}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Unauthorized');

    // Chỉ hủy subscription của chính user (không nhận subscriptionId từ client)
    const { cancelAtPeriodEnd = true } = await req.json();

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, stripe_current_period_end, metadata')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub) throw new Error('No active subscription found');

    const subId = sub.stripe_subscription_id;
    const paypalSubId = sub.metadata?.paypal_subscription_id;

    if (!subId && !paypalSubId) throw new Error('No subscription ID found');

    if (paypalSubId || sub.metadata?.gateway === 'paypal') {
      await cancelPaypalSubscription(paypalSubId || subId);

      const periodEnd = sub.stripe_current_period_end ? new Date(sub.stripe_current_period_end) : null;
      const keepUntilPeriodEnd = cancelAtPeriodEnd && periodEnd !== null && periodEnd > new Date();

      await supabase
        .from('subscriptions')
        .update({
          status: keepUntilPeriodEnd ? 'active' : 'canceled',
          cancel_at_period_end: keepUntilPeriodEnd,
          canceled_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      // Handle Stripe subscription (existing logic)
      const stripe = getStripe();
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
      } else {
        await stripe.subscriptions.cancel(subId);
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});