// src/lib/momo.ts
// MoMo: chỉ cần redirect, không có SDK client-side

/**
 * Chuyển hướng sang MoMo payment page
 */
export function redirectToMomo(payUrl: string): void {
  window.location.href = payUrl;
}

/**
 * Xử lý return từ MoMo (gọi ở PaymentSuccess page)
 * MoMo redirect về với query params: resultCode, orderId, message...
 */
export function parseMomoReturn(searchParams: URLSearchParams): {
  success: boolean;
  orderId: string;
  resultCode: string;
  message: string;
} {
  const resultCode = searchParams.get('resultCode') || '99';
  const orderId = searchParams.get('orderId') || '';
  const message = searchParams.get('message') || '';

  return {
    success: resultCode === '0',
    orderId,
    resultCode,
    message: message || getMomoMessage(resultCode),
  };
}

function getMomoMessage(code: string): string {
  const messages: Record<string, string> = {
    '0': 'Thành công',
    '1000': 'Thành công',
    '1001': 'Lỗi xử lý',
    '1002': 'Tham số không hợp lệ',
    '1003': 'Thư viện không tồn tại',
    '1004': 'Chữ ký không hợp lệ',
    '1005': 'App không tồn tại',
    '1006': 'Thẻ/Thẻ không tồn tại',
    '1007': 'Số dư không đủ',
    '1008': 'Hết hạn thẻ',
    '1009': 'Thẻ bị khóa',
    '1010': 'Thông tin thẻ không chính xác',
    '1011': 'Mã OTP không chính xác',
    '1012': 'Giao dịch bị hủy',
    '1013': 'Giao dịch thất bại',
    '1014': 'Giao dịch bị từ chối',
    '1015': 'Giao dịch timeout',
    '9000': 'Lỗi hệ thống',
  };
  return messages[code] || `Lỗi mã ${code}`;
}