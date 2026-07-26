// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { SubscriptionInfo } from '../types/payment';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`;
const CANCEL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`;
const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`;

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const res = await fetch(FUNCTION_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSubscription(data.data);
      else setSubscription(null);
    } catch (err: any) {
      console.error(err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const cancelSubscription = async (cancelAtPeriodEnd = true): Promise<boolean> => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Chưa đăng nhập');

      const res = await fetch(CANCEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSubscription();
        return true;
      }
      throw new Error(data.error || 'Huỷ thất bại');
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const openBillingPortal = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Chưa đăng nhập');

      const res = await fetch(PORTAL_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    subscription,
    loading,
    error,
    cancelSubscription,
    openBillingPortal,
    refetch: fetchSubscription,
  };
}