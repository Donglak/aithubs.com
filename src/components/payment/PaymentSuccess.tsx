// src/components/payment/PaymentSuccess.tsx
import { useSearchParams } from 'react-router-dom';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('session_id');
  const type = searchParams.get('type'); // 'ebook' | 'vip'

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Thanh toán thành công! 🎉</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {orderId ? `Đơn hàng: <strong>${orderId}</strong>` : 'Cảm ơn bạn đã mua hàng.'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {type === 'ebook'
          ? 'Link download ebook đã được gửi đến email của bạn. Kiểm tra hộp thư (kể cả spam).'
          : type === 'vip'
          ? 'Gói VIP đã được kích hoạt. Bạn có thể truy cập tất cả tính năng độc quyền ngay bây giờ.'
          : 'Bạn sẽ được chuyển về trang chính trong giây lát.'}
      </p>
      <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
        Về trang chủ
      </a>
    </div>
  );
}