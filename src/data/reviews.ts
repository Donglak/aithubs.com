// Review có kết luận mua / chờ / bỏ qua, key = id trong src/data/json/tools.json.
// Chỉ thêm review sau khi đã DÙNG THỬ THẬT: kết luận không đổi theo tiền (kể cả Deal Partner).
//
// Mẫu:
//   4: {
//     verdict: "buy",
//     verdictReason: "Fastest way to edit talking-head videos by editing the transcript.",
//     bestFor: ["Faceless YouTube channels", "Podcasters who repurpose clips"],
//     notFor: ["Heavy motion-graphics work"],
//     realMonthlyCost: "$24/mo for ~10 hours of footage (Creator plan, billed monthly)",
//     testedAt: "2026-10-20",
//     resultScreenshots: ["/images/reviews/descript-1.webp"],
//   },
import type { ToolReview } from "../types/tool";

export const TOOL_REVIEWS: Record<number, ToolReview> = {};

export const VERDICT_LABELS: Record<ToolReview["verdict"], string> = {
  buy: "Buy",
  wait: "Wait",
  skip: "Skip",
};
