// src/components/payment/CheckoutVIP.tsx
import { useState } from 'react';
import { PaymentGatewaySelector } from './PaymentGatewaySelector';
import { useCheckout } from '../../hooks/useCheckout';
import { formatCurrencyDisplay, VIP_PLANS } from '../../lib/geo';

export function CheckoutVIP() {
  const [plan, setPlan] = useState<'vip_monthly' | 'vip_yearly'>('vip_monthly');
  const [currency, setCurrency] = useState<'usd' | 'vnd'>('usd');
  const [gateway, setGateway] = useState<'stripe' | 'vnpay' | 'momo' | 'paypal'>('stripe');
  const { checkout, loading, error } = useCheckout();

  const selectedPlan = VIP_PLANS.find(p => p.id === plan)!;
  const amount = currency === 'usd' ? selectedPlan.price_usd : selectedPlan.price_vnd;

  const handleSubscribe = async () => {
    await checkout({
      type: 'vip_subscription',
      gateway,
      amount,
      currency,
      metadata: { plan },
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Nâng cấp Member VIP</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Mở khóa tất cả công cụ AI, khóa học & Ebook độc quyền
        </p>
      </div>

      {/* Plan Selector */}
      <div className="grid md:grid-cols-2 gap-4">
        {VIP_PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`p-6 rounded-2xl border-2 transition-all relative ${
              plan === p.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                Phổ biến nhất
              </span>
            )}
            <div className="font-semibold">{p.label}</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrencyDisplay(currency === 'usd' ? p.price_usd : p.price_vnd, currency)}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                /{p.interval === 'month' ? 'tháng' : 'năm'}
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> {f}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Currency Selector */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Tiền tệ:</span>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as 'usd' | 'vnd')}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="usd">USD ($)</option>
            <option value="vnd">VND (₫)</option>
          </select>
        </div>
      </div>

      <PaymentGatewaySelector
        type="vip_subscription"
        amount={amount}
        currency={currency}
        onSelect={setGateway}
        selectedGateway={gateway}
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
      >
        {loading
          ? 'Đang chuyển hướng...'
          : `Đăng ký ${formatCurrencyDisplay(amount, currency)}/${selectedPlan.interval === 'month' ? 'tháng' : 'năm'} • Dùng thử 7 ngày`}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Huỷ bất cứ lúc nào. Không bị tính phí sau dùng thử nếu huỷ trước ngày thứ 7.
      </p>
    </div>
  );
}