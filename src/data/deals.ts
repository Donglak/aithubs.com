// Deal AI đã kiểm tra (Lifetime Deal Tracker). Cập nhật hàng tuần; luôn sửa checkedAt khi kiểm tra lại.
// Deal độc quyền từ vendor (digital_products.deal_code) được trang /deals tự lấy từ database.
//
// Mẫu (giá trị minh họa, KHÔNG phải deal thật) — copy vào TRONG mảng TOOL_DEALS bên dưới:
//   {
//     toolId: 1,
//     toolName: "ElevenLabs",
//     headline: "22% off the Creator plan for 3 months",
//     code: "AITHUBS22",
//     terms: "New subscribers only",
//     url: "https://elevenlabs.io/?via=aithubs",
//     affiliate: true,
//     exclusive: true,
//     verdict: "Worth it if you publish voiceovers weekly.",
//     expiresAt: "2026-11-30",
//     checkedAt: "2026-10-26",
//   },
import type { ToolDeal } from "../types/tool";

export const TOOL_DEALS: ToolDeal[] = [];

// AppSumo Black Friday 2026: 20–30/11. Trang deal cần lên trước 15/11 để kịp index.
export const BLACK_FRIDAY = {
  year: 2026,
  start: "2026-11-20",
  end: "2026-11-30",
};

export function isDealActive(deal: { expiresAt?: string | null }, now = new Date()) {
  return !deal.expiresAt || new Date(`${deal.expiresAt}T23:59:59`) >= now;
}

/** Deal đang chạy cho một tool trong danh mục */
export function activeDealForTool(toolId: number) {
  return TOOL_DEALS.find((d) => d.toolId === toolId && isDealActive(d));
}
