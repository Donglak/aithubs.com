// src/components/payment/PaymentGatewaySelector.tsx
import { useState, useEffect } from 'react';
import { PaymentGateway } from '../../types/payment';
import { detectCountry, getSuggestedGateways, GATEWAY_INFO, CountryCode } from '../../lib/geo';

interface Props {
  type: 'ebook' | 'vip_subscription';
  amount: number;
  currency: 'usd' | 'vnd';
  onSelect: (gateway: PaymentGateway) => void;
  selectedGateway?: PaymentGateway;
}

export function PaymentGatewaySelector({ type, amount, currency, onSelect, selectedGateway }: Props) {
  const [country, setCountry] = useState<CountryCode>('INTL');
  const [gateways, setGateways] = useState<PaymentGateway[]>(['stripe', 'paypal']);

  useEffect(() => {
    detectCountry().then(c => {
      setCountry(c);
      setGateways(getSuggestedGateways(c, currency).filter(g => GATEWAY_INFO[g].currencies.includes(currency)));
    });
  }, [currency]);

  const isAvailable = (g: PaymentGateway) => GATEWAY_INFO[g].currencies.includes(currency);

  return (
    <div className="space-y-3">
      {/* Country selector */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>🌍</span>
        <span>Quốc gia: <strong>{country === 'VN' ? 'Việt Nam' : 'Quốc tế'}</strong></span>
        <select
          value={country}
          onChange={e => setCountry(e.target.value as CountryCode)}
          className="ml-2 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
        >
          <option value="VN">🇻🇳 Việt Nam</option>
          <option value="INTL">🌐 Quốc tế</option>
        </select>
      </div>

      {/* Gateway options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gateways.map(g => {
          const info = GATEWAY_INFO[g];
          const available = isAvailable(g);
          return (
            <button
              key={g}
              type="button"
              onClick={() => available && onSelect(g)}
              disabled={!available || selectedGateway === g}
              className={`relative p-4 border-2 rounded-xl transition-all ${
                selectedGateway === g
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                  : available
                  ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-2xl mb-1">{info.icon}</div>
              <div className="font-medium text-sm">{info.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{info.description}</div>
              {selectedGateway === g && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Amount display */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Số tiền: <strong>{formatCurrencyDisplay(amount, currency)}</strong>
        {type === 'vip_subscription' && ' • Bao gồm dùng thử 7 ngày'}
      </p>
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