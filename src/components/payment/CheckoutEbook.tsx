// src/components/payment/CheckoutEbook.tsx
import { useTranslation } from 'react-i18next';
import { PayPalMethod } from './PayPalMethod';
import { useCheckout } from '../../hooks/useCheckout';
import { formatCurrency } from '../../lib/geo';

export interface EbookData {
  id: string;
  title: string;
  description: string;
  price_usd: number; // cents — display only, the server enforces the real price
  cover_url?: string;
}

export function CheckoutEbook({ ebook }: { ebook: EbookData }) {
  const { t } = useTranslation('payment');
  const { checkout, loading, error } = useCheckout();
  const price = formatCurrency(ebook.price_usd);

  const handlePay = () =>
    checkout({ type: 'ebook', gateway: 'paypal', currency: 'usd', metadata: { ebook_id: ebook.id } });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-4">
        {ebook.cover_url && (
          <img src={ebook.cover_url} alt={ebook.title} className="w-full h-48 object-cover rounded-xl" />
        )}

        <div>
          <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{ebook.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{ebook.description}</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('checkout.total')}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{price}</div>
        </div>

        <PayPalMethod />

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {loading ? t('checkout.redirecting') : t('checkout.payButton', { price })}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('paypal.secure')}</p>
      </div>
    </div>
  );
}
