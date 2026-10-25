// src/pages/PaymentSuccessPage.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { confirmPaypalPayment } from '../hooks/useCheckout';
import type { ConfirmResult } from '../types/payment';

// A subscription can take a few seconds to go from APPROVED to ACTIVE after the redirect
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2500;

type ViewState =
  | { kind: 'loading' }
  | { kind: 'done'; result: ConfirmResult }
  | { kind: 'error'; message: string };

export default function PaymentSuccessPage() {
  const { t } = useTranslation('payment');
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [view, setView] = useState<ViewState>(
    orderId ? { kind: 'loading' } : { kind: 'error', message: t('checkout.invalidBody') },
  );

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const attempt = async (n: number) => {
      try {
        const result = await confirmPaypalPayment(orderId);
        if (cancelled) return;
        if (result.status === 'PENDING' && n < MAX_ATTEMPTS) {
          timer = setTimeout(() => attempt(n + 1), RETRY_DELAY_MS);
          return;
        }
        setView({ kind: 'done', result });
      } catch (err) {
        if (!cancelled) setView({ kind: 'error', message: err instanceof Error ? err.message : '' });
      }
    };
    attempt(1);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  const orderLine = orderId && (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t('success.orderId')}: <strong>{orderId}</strong>
    </p>
  );

  if (view.kind === 'loading') {
    return (
      <Shell icon="loading" title={t('success.confirming')} homeLabel={t('success.home')}>
        <p className="text-gray-600 dark:text-gray-300">{t('success.doNotClose')}</p>
      </Shell>
    );
  }

  if (view.kind === 'error') {
    return (
      <Shell icon="warning" title={t('success.errorTitle')} homeLabel={t('success.home')}>
        {view.message && <p className="text-gray-600 dark:text-gray-300 mb-2">{view.message}</p>}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('success.errorBody')}</p>
        {orderLine}
      </Shell>
    );
  }

  const { result } = view;

  if (result.status === 'COMPLETED' && result.type === 'ebook') {
    return (
      <Shell icon="success" title={t('success.ebookTitle')} homeLabel={t('success.home')}>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          <Trans t={t} i18nKey="success.ebookBody" values={{ title: result.title }} components={{ strong: <strong /> }} />
        </p>
        {result.deliveryUrl && (
          <a
            href={result.deliveryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            📥 {t('success.download')}
          </a>
        )}
      </Shell>
    );
  }

  if (result.status === 'COMPLETED') {
    return (
      <Shell icon="success" title={t('success.vipTitle')} homeLabel={t('success.home')}>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{t('success.vipBody')}</p>
      </Shell>
    );
  }

  const pending = result.status === 'PENDING';
  return (
    <Shell icon="warning" title={t(pending ? 'success.pendingTitle' : 'success.failedTitle')} homeLabel={t('success.home')}>
      <p className="text-gray-600 dark:text-gray-300 mb-2">{t(pending ? 'success.pendingBody' : 'success.failedBody')}</p>
      {orderLine}
    </Shell>
  );
}

function Shell({
  icon,
  title,
  homeLabel,
  children,
}: {
  icon: 'success' | 'warning' | 'loading';
  title: string;
  homeLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div
          className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            icon === 'success' ? 'bg-green-100 dark:bg-green-900/30' : icon === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
          }`}
        >
          {icon === 'loading' ? (
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className={`w-10 h-10 ${icon === 'success' ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icon === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              )}
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h1>
        {children}
        {icon !== 'loading' && (
          <Link to="/" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            {homeLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
