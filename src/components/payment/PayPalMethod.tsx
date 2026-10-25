// src/components/payment/PayPalMethod.tsx
import { useTranslation } from 'react-i18next';

/** Phương thức thanh toán duy nhất: PayPal (gồm cả thẻ qua PayPal guest checkout) */
export function PayPalMethod() {
  const { t } = useTranslation('payment');

  return (
    <div className="flex items-start gap-3 p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <div className="text-2xl leading-none" aria-hidden="true">🅿️</div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{t('paypal.name')}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{t('paypal.description')}</div>
      </div>
    </div>
  );
}
