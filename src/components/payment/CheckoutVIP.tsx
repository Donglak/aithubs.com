// src/components/payment/CheckoutVIP.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PayPalMethod } from './PayPalMethod';
import { useCheckout } from '../../hooks/useCheckout';
import { formatCurrency, VIP_PLANS } from '../../lib/geo';

export function CheckoutVIP() {
  const { t } = useTranslation('payment');
  const [plan, setPlan] = useState<'vip_monthly' | 'vip_yearly'>('vip_monthly');
  const { checkout, loading, error } = useCheckout();

  const selectedPlan = VIP_PLANS.find(p => p.id === plan)!;

  const handleSubscribe = () =>
    checkout({ type: 'vip_subscription', gateway: 'paypal', currency: 'usd', metadata: { plan } });

  return (
    <div className="max-w-2xl mx-auto px-6 pt-24 pb-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('vip.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t('vip.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {VIP_PLANS.map(p => {
          const features = t(`vip.plans.${p.id}.features`, { returnObjects: true }) as string[];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              aria-pressed={plan === p.id}
              className={`p-6 rounded-2xl border-2 transition-all relative text-left ${
                plan === p.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {t('vip.mostPopular')}
                </span>
              )}
              <div className="font-semibold text-gray-900 dark:text-white">{t(`vip.plans.${p.id}.label`)}</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(p.price_usd)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {t(`vip.perInterval.${p.interval}`)}
                </span>
              </div>
              {Array.isArray(features) && features.length > 0 && (
                <ul className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-1.5">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <PayPalMethod />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
      >
        {loading
          ? t('checkout.redirecting')
          : t('vip.subscribeButton', {
              price: formatCurrency(selectedPlan.price_usd),
              interval: t(`vip.perInterval.${selectedPlan.interval}`),
            })}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('vip.trialNote')}</p>
    </div>
  );
}
