// src/pages/PaymentCancelPage.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PaymentCancelPage() {
  const { t } = useTranslation('payment');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('cancel.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('cancel.body')}
        </p>
        <Link to="/" className="inline-block px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors">
          {t('cancel.back')}
        </Link>
      </div>
    </div>
  );
}