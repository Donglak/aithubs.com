// supabase/functions/_shared/gateways.ts
// Chỉ các cổng được liệt kê trong secret PAYMENT_GATEWAYS mới được nhận thanh toán / callback.
// Mặc định chỉ PayPal. Cổng chưa cấu hình mà vẫn mở thì secret = undefined và chữ ký
// HMAC có thể bị giả mạo bằng khóa "undefined" — vì vậy phải tắt hẳn.
export type Gateway = 'paypal' | 'stripe' | 'vnpay' | 'momo';

export function enabledGateways(): Gateway[] {
  return (Deno.env.get('PAYMENT_GATEWAYS') || 'paypal')
    .split(',')
    .map((g) => g.trim())
    .filter((g): g is Gateway => ['paypal', 'stripe', 'vnpay', 'momo'].includes(g));
}

export function isGatewayEnabled(gateway: string): boolean {
  return enabledGateways().includes(gateway as Gateway);
}
