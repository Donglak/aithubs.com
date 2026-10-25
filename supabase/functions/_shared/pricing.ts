// supabase/functions/_shared/pricing.ts
// Bảng giá phía server — nguồn sự thật duy nhất cho số tiền thanh toán.
// KHÔNG BAO GIỜ tin `amount` do client gửi lên.
// Khi đổi giá/thêm ebook: cập nhật cả file này và src/data/ebooks.ts (phần hiển thị).

export type Currency = 'usd' | 'vnd';
export type VipPlan = 'vip_monthly' | 'vip_yearly';

export interface PaidEbook {
  title: string;
  price_usd: number; // cents
  // Link giao hàng sau khi thanh toán — chỉ nằm ở server, không đưa ra bundle frontend
  deliveryUrl: string;
}

export const PAID_EBOOKS: Record<string, PaidEbook> = {
  // Ebook 1–6 hiện miễn phí (xem src/data/ebooks.ts).
  // TODO: thay link thật cho các ebook dưới đây trước khi mở bán
  '7': { title: 'UX Design Principles', price_usd: 2499, deliveryUrl: '' },
  '8': { title: 'Financial Planning Guide', price_usd: 3999, deliveryUrl: '' },
};

export const VIP_PRICES: Record<VipPlan, { usd: number; vnd: number; interval: 'month' | 'year' }> = {
  vip_monthly: { usd: 999, vnd: 249000, interval: 'month' },
  vip_yearly: { usd: 9900, vnd: 2490000, interval: 'year' },
};

export function resolveEbook(ebookId: unknown): PaidEbook & { id: string } {
  const id = String(ebookId ?? '');
  const ebook = PAID_EBOOKS[id];
  if (!ebook) throw new Error('This ebook is not available for purchase');
  if (!ebook.deliveryUrl) throw new Error('This ebook is not on sale yet');
  return { id, ...ebook };
}

export function resolveVipPlan(plan: unknown): VipPlan {
  if (plan !== 'vip_monthly' && plan !== 'vip_yearly') throw new Error('Invalid VIP plan');
  return plan;
}
