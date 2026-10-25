// Client cho Edge Function vendor-billing (thuê bao listing của vendor qua PayPal)
import { supabase } from './supabase';
import type { BillingInterval } from '../types/vendor';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vendor-billing`;

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in');

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

/** Tạo subscription PayPal và chuyển người dùng sang trang approve của PayPal */
export async function startVendorSubscription(planSlug: string, interval: BillingInterval) {
  const { url } = await call<{ url: string }>({ action: 'subscribe', planSlug, interval });
  window.location.href = url;
}

export type VendorConfirmResult = { status: 'active' | 'pending' | 'canceled' | 'past_due' | 'ignored'; plan?: string };

/** Gọi khi PayPal redirect về /vendor/subscription?paypal=return&subscription_id=... */
export function confirmVendorSubscription(subscriptionId: string) {
  return call<VendorConfirmResult>({ action: 'confirm', subscriptionId });
}

export function cancelVendorSubscription() {
  return call<{ status: string; activeUntil: string | null }>({ action: 'cancel' });
}
