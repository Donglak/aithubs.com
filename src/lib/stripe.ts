// STRIPE CLIENT-SIDE (chỉ dùng publishable key)
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Missing VITE_STRIPE_PUBLISHABLE_KEY');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe not loaded');

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
}

export async function openBillingPortal(): Promise<string | null> {
  // Gọi Edge Function create-portal-session
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  }
  return data.url || null;
}