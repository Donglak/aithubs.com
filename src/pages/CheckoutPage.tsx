// src/pages/CheckoutPage.tsx
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckoutEbook } from '../components/payment/CheckoutEbook';
import { CheckoutVIP } from '../components/payment/CheckoutVIP';

export default function CheckoutPage() {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const ebookId = searchParams.get('ebookId');

  // Fetch ebook data if needed
  const [ebook, setEbook] = useState<any>(null);

  useEffect(() => {
    if (type === 'ebook' && ebookId) {
      // In real app, fetch from API
      // For now, use mock data
      setEbook({
        id: ebookId,
        title: 'Sample Ebook',
        description: 'This is a sample ebook description',
        price_usd: 999,
        price_vnd: 249000,
        cover_url: 'https://via.placeholder.com/400x600',
      });
    }
  }, [type, ebookId]);

  if (type === 'ebook') {
    if (!ebook) return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
    return <CheckoutEbook ebook={ebook} />;
  }

  if (type === 'vip') {
    return <CheckoutVIP />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loại thanh toán không hợp lệ</h1>
        <p className="text-gray-500 dark:text-gray-400">Vui lòng chọn gói hoặc sản phẩm để thanh toán.</p>
      </div>
    </div>
  );
}