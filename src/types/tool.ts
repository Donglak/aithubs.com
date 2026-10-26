export type Tool = ToolBase;

export type VideoItem = {
  title: string;
  url: string;        // chấp nhận watch?v=, youtu.be/, shorts/, embed/
  channel?: string;
  publishedAt?: string;
};
export type PricingTier = {
  name: string;
  price: string;
  billing?: string;
  features: string[];
};

/** Kết luận review: mua / chờ / bỏ qua */
export type ReviewVerdict = "buy" | "wait" | "skip";

/** Review có chính kiến theo khung chuẩn của AIThubs */
export type ToolReview = {
  verdict: ReviewVerdict;
  /** Kết luận trong một dòng, kèm lý do */
  verdictReason: string;
  bestFor?: string[];
  notFor?: string[];
  /** Chi phí thực tế mỗi tháng ở mức dùng thật, ví dụ "$22–$45/mo for 2 videos a week" */
  realMonthlyCost?: string;
  /** Ngày dùng thử thật (ISO) */
  testedAt: string;
  /** Ảnh chụp kết quả thật từ lần dùng thử */
  resultScreenshots?: string[];
};

/** Deal đã được AIThubs kiểm tra */
export type ToolDeal = {
  /** id trong tools.json; bỏ trống nếu tool chưa có trong danh mục */
  toolId?: number;
  toolName: string;
  /** Ví dụ "30% off annual plans" */
  headline: string;
  code?: string;
  terms?: string;
  url: string;
  /** url là link affiliate -> gắn rel="sponsored" và hiện disclosure */
  affiliate?: boolean;
  lifetime?: boolean;
  /** Deal độc quyền cho độc giả AIThubs */
  exclusive?: boolean;
  /** Kết luận một dòng cho newsletter / trang deal */
  verdict?: string;
  expiresAt?: string;
  /** Ngày kiểm tra deal còn chạy (ISO) */
  checkedAt: string;
};

export type ToolBase = {
  id: number;                          // SỐ nguyên                     // duy nhất
  name: string;
  image: string;
  website?: string;
  company?: string;
  categories: string | string[];         // có thể là mảng
  functions?: string | string[];
  rating?: number;
  reviews?: number;
  featured?: boolean;                  // dữ liệu tools.ts mới không còn trường này
  price?: string;                      // 'Free', 'Free - $10', 'Contact price'
  freeTrial?: boolean;
  description?: string;
  tags?: string | string[];
};

export type ToolDetail = ToolBase & {
  // mở rộng cho trang chi tiết
  longDescription?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
  screenshots?: string[];
  useCases?: string[];
  idealFor?: string[];
  integrations?: string[];
  alternatives?: number[];
  badges?: string[];
  metrics?: { users?: string; founded?: string; lastUpdated?: string };
  pricingTiers?: PricingTier[];
  videoReviews?: VideoItem[];
  seo?: { title?: string; description?: string; canonical?: string };
};
