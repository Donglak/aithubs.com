// src/hooks/useCheckout.ts
import { useState } from 'react';
import i18n from '../i18n';
import { CheckoutRequest, CheckoutResponse, ConfirmResult } from '../types/payment';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
const CONFIRM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-confirm`;

async function getAccessToken() {
  const { supabase } = await import('../lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Xác nhận đơn PayPal sau khi user quay lại từ PayPal (capture tiền / kiểm tra subscription).
 * Server đối chiếu số tiền nên kết quả trả về là trạng thái thật.
 */
export async function confirmPaypalPayment(orderId: string): Promise<ConfirmResult> {
  const token = await getAccessToken();
  if (!token) throw new Error(i18n.t('payment:checkout.signInRequired'));

  const res = await fetch(CONFIRM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || i18n.t('payment:success.errorTitle'));
  return data.data;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (params: CheckoutRequest): Promise<CheckoutResponse['data'] | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error(i18n.t('payment:checkout.signInRequired'));
      }

      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || i18n.t('payment:checkout.failed'));

      // Redirect to payment gateway
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t('payment:checkout.failed'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}