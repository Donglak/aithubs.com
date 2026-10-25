// supabase/functions/vendor-billing/index.ts
// Thuê bao listing cho vendor qua PayPal.
//   POST { action: 'subscribe', planSlug, interval: 'month' | 'year' } -> { url }  (link approve của PayPal)
//   POST { action: 'confirm', subscriptionId }                          -> trạng thái sau khi quay về từ PayPal
//   POST { action: 'cancel' }                                           -> hủy gia hạn, listing còn tới hết kỳ
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { approveLink, getPaypalSubscription, paypalFetch } from '../_shared/paypal.ts';
import { cancelPaypalSubscriptionById, syncVendorSubscription, vendorCustomId } from '../_shared/vendor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function subscribe(userId: string, email: string | undefined, planSlug: unknown, interval: unknown) {
  if (interval !== 'month' && interval !== 'year') throw new HttpError(400, 'Invalid billing interval');

  const { data: vendor } = await supabase.from('vendors').select('id, status').eq('user_id', userId).maybeSingle();
  if (!vendor) throw new HttpError(400, 'Create your vendor profile first');
  if (vendor.status !== 'approved') throw new HttpError(403, 'Your vendor account is not active');

  const { data: plan } = await supabase
    .from('vendor_plans')
    .select('id, slug, is_active, paypal_plan_id_monthly, paypal_plan_id_yearly')
    .eq('slug', String(planSlug))
    .maybeSingle();
  if (!plan || !plan.is_active) throw new HttpError(400, 'This plan is not available');

  const paypalPlanId = interval === 'month' ? plan.paypal_plan_id_monthly : plan.paypal_plan_id_yearly;
  if (!paypalPlanId) throw new HttpError(503, 'This plan is not available for purchase yet');

  const { data: current } = await supabase
    .from('vendor_subscriptions')
    .select('plan_id, billing_interval, status, cancel_at_period_end')
    .eq('vendor_id', userId)
    .maybeSingle();
  if (current && current.plan_id === plan.id && current.billing_interval === interval
      && ['active', 'trialing'].includes(current.status) && !current.cancel_at_period_end) {
    throw new HttpError(409, 'You are already subscribed to this plan');
  }

  const res = await paypalFetch('/v1/billing/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: paypalPlanId,
      custom_id: vendorCustomId(userId),
      ...(email && { subscriber: { email_address: email } }),
      application_context: {
        brand_name: 'AIThubs',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${siteUrl}/vendor/subscription?paypal=return`,
        cancel_url: `${siteUrl}/vendor/subscription?paypal=cancel`,
      },
    }),
  });
  if (!res.ok) throw new HttpError(502, `PayPal: ${res.data?.message || res.status}`);

  const url = approveLink(res.data);
  if (!url) throw new HttpError(502, 'PayPal did not return an approval link');
  return { url };
}

async function confirm(userId: string, subscriptionId: unknown) {
  if (typeof subscriptionId !== 'string' || !subscriptionId) throw new HttpError(400, 'Missing subscriptionId');

  const sub = await getPaypalSubscription(subscriptionId);
  // Không cho xác nhận subscription của người khác
  if (sub.custom_id !== vendorCustomId(userId)) throw new HttpError(404, 'Subscription not found');

  return syncVendorSubscription(supabase, sub);
}

async function cancel(userId: string) {
  const { data: current } = await supabase
    .from('vendor_subscriptions')
    .select('paypal_subscription_id, current_period_end, status')
    .eq('vendor_id', userId)
    .maybeSingle();
  if (!current?.paypal_subscription_id || !['active', 'trialing', 'past_due'].includes(current.status)) {
    throw new HttpError(400, 'No active subscription to cancel');
  }

  await cancelPaypalSubscriptionById(current.paypal_subscription_id, 'Cancelled by vendor');

  const keep = current.current_period_end && Date.parse(current.current_period_end) > Date.now() && current.status !== 'past_due';
  await supabase
    .from('vendor_subscriptions')
    .update(keep ? { cancel_at_period_end: true, updated_at: new Date().toISOString() } : { status: 'canceled', updated_at: new Date().toISOString() })
    .eq('vendor_id', userId);

  return { status: keep ? 'cancel_at_period_end' : 'canceled', activeUntil: keep ? current.current_period_end : null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ success: false, error: 'Please sign in' }, 401);

    const body = await req.json();
    let data: unknown;
    switch (body.action) {
      case 'subscribe':
        data = await subscribe(user.id, user.email, body.planSlug, body.interval);
        break;
      case 'confirm':
        data = await confirm(user.id, body.subscriptionId);
        break;
      case 'cancel':
        data = await cancel(user.id);
        break;
      default:
        return json({ success: false, error: 'Unknown action' }, 400);
    }
    return json({ success: true, data });
  } catch (err) {
    console.error('vendor-billing error:', err);
    const status = err instanceof HttpError ? err.status : 500;
    return json({ success: false, error: (err as Error).message }, status);
  }
});
