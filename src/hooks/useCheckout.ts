// src/hooks/useCheckout.ts
import { useState } from 'react';
import { CheckoutRequest, CheckoutResponse } from '../types/payment';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (params: CheckoutRequest): Promise<CheckoutResponse['data'] | null> => {
    setLoading(true);
    setError(null);
    try {
      // Get auth token
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Bạn cần đăng nhập để thanh toán');
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
      if (!data.success) throw new Error(data.error || 'Checkout failed');

      // Redirect to payment gateway
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
      return data.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}