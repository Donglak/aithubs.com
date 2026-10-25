// supabase/functions/create-portal-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
const paypalSecret = Deno.env.get('PAYPAL_SECRET')!;
const paypalBase = Deno.env.get('PAYPAL_BASE')!;
const siteUrl = Deno.env.get('SITE_URL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });

async function getPaypalAccessToken() {
  const auth = btoa(`${paypalClientId}:${paypalSecret}`);
  const res = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  return (await res.json()).access_token;
}

async function getPaypalSubscriptionDetails(subscriptionId: string, accessToken: string) {
  const res = await fetch(`${paypalBase}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  return res.json();
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

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, metadata')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub) throw new Error('No subscription found');

    const paypalSubId = sub.metadata?.paypal_subscription_id;
    const gateway = paypalSubId ? 'paypal' : 'stripe';

    if (gateway === 'paypal') {
      const accessToken = await getPaypalAccessToken();
      const details = await getPaypalSubscriptionDetails(paypalSubId, accessToken);

      // PayPal doesn't have a billing portal like Stripe.
// Redirect user to PayPal subscription management page.
// URL format: https://www.{sandbox.}paypal.com/billing/subscriptions/manage?ba_token={subscription_id}
      const isSandbox = paypalBase.includes('sandbox');
      const paypalDomain = isSandbox ? 'www.sandbox.paypal.com' : 'www.paypal.com';
      const manageUrl = `https://${paypalDomain}/billing/subscriptions/manage?ba_token=${paypalSubId}`;

      return new Response(
        JSON.stringify({ url: manageUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Stripe billing portal (existing logic)
      if (!sub.stripe_customer_id) throw new Error('No Stripe customer');

      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${siteUrl}/dashboard/subscription`,
      });

      return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    console.error('Portal session error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});