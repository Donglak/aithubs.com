// Pricing & currency helpers for checkout.
// Payments go through PayPal only (USD) — real prices are enforced server-side
// in supabase/functions/_shared/pricing.ts; values here are for display.

/**
 * Format an amount: USD in cents, VND in whole dong (legacy subscriptions).
 */
export function formatCurrency(amount: number, currency: 'usd' | 'vnd' = 'usd'): string {
  if (currency === 'vnd') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

// Export alias for backward compatibility
export const formatCurrencyDisplay = formatCurrency;

/**
 * VIP plans — labels/benefits live in src/locales/{en,vi}/payment.json (vip.plans.<id>)
 */
export const VIP_PLANS = [
  {
    id: 'vip_monthly' as const,
    price_usd: 999, // $9.99
    interval: 'month' as const,
    popular: false,
  },
  {
    id: 'vip_yearly' as const,
    price_usd: 9900, // $99
    interval: 'year' as const,
    popular: true,
  },
] as const;

export type VIPPlan = typeof VIP_PLANS[number];
