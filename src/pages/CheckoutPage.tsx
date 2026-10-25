// src/pages/CheckoutPage.tsx
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckoutEbook, EbookData } from '../components/payment/CheckoutEbook';
import { CheckoutVIP } from '../components/payment/CheckoutVIP';
import { ebooks } from '../data/ebooks';

function findPaidEbook(id: string | null): EbookData | null {
  const ebook = ebooks.find(e => String(e.id) === id);
  if (!ebook || ebook.price <= 0) return null;
  return {
    id: String(ebook.id),
    title: ebook.title,
    description: ebook.description,
    price_usd: Math.round(ebook.price * 100),
    cover_url: ebook.coverImage,
  };
}

export default function CheckoutPage() {
  const { t } = useTranslation('payment');
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();

  if (type === 'ebook') {
    const ebook = findPaidEbook(searchParams.get('ebookId'));
    if (ebook) return <CheckoutEbook ebook={ebook} />;
  }

  if (type === 'vip') {
    return <CheckoutVIP />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('checkout.invalidTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('checkout.invalidBody')}</p>
        <Link to="/ebooks" className="text-blue-600 hover:underline">{t('checkout.browseEbooks')}</Link>
      </div>
    </div>
  );
}
