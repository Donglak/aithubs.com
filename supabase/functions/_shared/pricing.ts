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
  // Link giao hàng đặt trong Supabase Secrets (EBOOK_<id>_URL), KHÔNG ghi vào đây vì repo GitHub công khai.
  // Giá đang để thấp (12/13 cent) để test sandbox — tăng lại trước khi bán thật.
  '7': { title: 'UX Design Principles', price_usd: 12, deliveryUrl: Deno.env.get('EBOOK_7_URL') ?? '' },
  '8': { title: 'Financial Planning Guide', price_usd: 13, deliveryUrl: Deno.env.get('EBOOK_8_URL') ?? '' },
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
