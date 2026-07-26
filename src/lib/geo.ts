// AUTO-DETECT VIETNAM BY IP (fallback nếu user không chọn)
export type CountryCode = 'VN' | 'INTL';
export type PaymentGateway = 'stripe' | 'vnpay' | 'momo' | 'paypal';

/**
 * Detect user country by IP
 * Uses ipapi.co (free 1000 req/day)
 */
export async function detectCountry(): Promise<CountryCode> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.country_code === 'VN' ? 'VN' : 'INTL';
  } catch {
    // Fallback: dùng language của browser
    return navigator.language.startsWith('vi') ? 'VN' : 'INTL';
  }
}

/**
 * Get suggested gateways for country & currency
 */
export function getSuggestedGateways(
  country: CountryCode,
  currency: 'usd' | 'vnd'
): PaymentGateway[] {
  if (currency === 'vnd') {
    return country === 'VN'
      ? ['vnpay', 'momo', 'stripe', 'paypal']
      : ['stripe', 'paypal'];
  }
  // USD
  return ['stripe', 'paypal'];
}

/**
 * Gateway info for UI
 */
export const GATEWAY_INFO: Record<
  PaymentGateway,
  {
    label: string;
    icon: string;
    description: string;
    currencies: ('usd' | 'vnd')[];
  }
> = {
  stripe: {
    label: 'Stripe',
    icon: '💳',
    description: 'Visa, Mastercard, Amex',
    currencies: ['usd', 'vnd'],
  },
  paypal: {
    label: 'PayPal',
    icon: '🅿️',
    description: 'Tài khoản PayPal',
    currencies: ['usd', 'vnd'],
  },
  vnpay: {
    label: 'VNPay',
    icon: '🏦',
    description: 'ATM, Internet Banking VN',
    currencies: ['vnd'],
  },
  momo: {
    label: 'MoMo',
    icon: '📱',
    description: 'Ví MoMo, thẻ ATM',
    currencies: ['vnd'],
  },
};

/**
 * Format currency (alias for formatCurrencyDisplay)
 */
export function formatCurrency(amount: number, currency: 'usd' | 'vnd'): string {
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
 * Get VIP plans
 */
export const VIP_PLANS = [
  {
    id: 'vip_monthly' as const,
    label: 'Hàng tháng',
    price_usd: 999,    // $9.99
    price_vnd: 249000, // 249,000₫
    interval: 'month' as const,
    popular: false,
  },
  {
    id: 'vip_yearly' as const,
    label: 'Hàng năm (tiết kiệm 17%)',
    price_usd: 9900,      // $99
    price_vnd: 2490000,   // 2,490,000₫
    interval: 'year' as const,
    popular: true,
  },
] as const;

export type VIPPlan = typeof VIP_PLANS[number];