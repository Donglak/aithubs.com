// src/lib/vnpay.ts
// VNPay: chỉ cần redirect, không có SDK client-side

/**
 * Chuyển hướng sang VNPay payment page
 */
export function redirectToVnpay(paymentUrl: string): void {
  window.location.href = paymentUrl;
}

/**
 * Xử lý return từ VNPay (gọi ở PaymentSuccess page)
 * VNPay sẽ redirect về với query params: vnp_ResponseCode, vnp_TxnRef, vnp_OrderInfo...
 */
export function parseVnpayReturn(searchParams: URLSearchParams): {
  success: boolean;
  txnRef: string;
  responseCode: string;
  message: string;
} {
  const responseCode = searchParams.get('vnp_ResponseCode') || '99';
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const orderInfo = searchParams.get('vnp_OrderInfo') || '';

  const messages: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công, giao dịch bị nghi ngờ',
    '09': 'Thẻ chưa đăng ký Internet Banking',
    '10': 'Thông tin thẻ không đúng',
    '11': 'Hết hạn thẻ',
    '12': 'Thẻ bị khóa',
    '13': 'Sai OTP',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Vượt hạn giao dịch',
    '75': 'Sai OTP quá 5 lần',
    '79': 'Thẻ chưa kích hoạt Internet Banking',
    '99': 'Lỗi không xác định',
  };

  return {
    success: responseCode === '00',
    txnRef,
    responseCode,
    message: messages[responseCode] || 'Lỗi không xác định',
  };
}