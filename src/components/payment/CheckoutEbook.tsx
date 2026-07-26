// src/components/payment/CheckoutEbook.tsx
import { useState } from 'react';
import { PaymentGatewaySelector } from './PaymentGatewaySelector';
import { useCheckout } from '../../hooks/useCheckout';
import { formatCurrencyDisplay } from '../../lib/geo';

export interface EbookData {
  id: string;
  title: string;
  description: string;
  price_usd: number; // cents
  price_vnd: number;
  cover_url?: string;
}

export function CheckoutEbook({ ebook }: { ebook: EbookData }) {
  const [currency, setCurrency] = useState<'usd' | 'vnd'>('usd');
  const [gateway, setGateway] = useState<'stripe' | 'vnpay' | 'momo' | 'paypal'>('stripe');
  const { checkout, loading, error } = useCheckout();

  const handlePay = async () => {
    const amount = currency === 'usd' ? ebook.price_usd : ebook.price_vnd;
    const currencyCode = currency;

    await checkout({
      type: 'ebook',
      gateway,
      amount,
      currency: currencyCode,
      metadata: {
        ebook_id: ebook.id,
        ebook_title: ebook.title,
        ebook_description: ebook.description,
      },
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {ebook.cover_url && (
        <img
          src={ebook.cover_url}
          alt={ebook.title}
          className="w-full h-48 object-cover rounded-xl mb-4"
        />
      )}

      <h2 className="text-xl font-bold mb-1">{ebook.title}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{ebook.description}</p>

      {/* Currency selector + price */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Tổng cộng</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrencyDisplay(currency === 'usd' ? ebook.price_usd : ebook.price_vnd, currency)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrency('usd')}
            className={`px-3 py-1 rounded ${
              currency === 'usd'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('vnd')}
            className={`px-3 py-1 rounded ${
              currency === 'vnd'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            VND
          </button>
        </div>
      </div>

      <PaymentGatewaySelector
        type="ebook"
        amount={currency === 'usd' ? ebook.price_usd : ebook.price_vnd}
        currency={currency}
        onSelect={setGateway}
        selectedGateway={gateway}
      />

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
      >
        {loading ? 'Đang chuyển hướng...' : `Thanh toán ${formatCurrencyDisplay(currency === 'usd' ? ebook.price_usd : ebook.price_vnd, currency)}`}
      </button>
    </div>
  );
}

function formatCurrencyDisplay(amount: number, currency: 'usd' | 'vnd'): string {
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