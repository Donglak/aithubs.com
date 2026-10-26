// Số liệu traffic CÔNG KHAI trên trang /stats. Cập nhật đầu mỗi tháng từ Google Analytics / Search Console.
// Chỉ ghi số thật (vendor kiểm tra được qua Similarweb/Ahrefs), kể cả khi còn nhỏ.
//
// Mẫu:
//   { month: "2026-11", visits: 1240, pageviews: 3100, subscribers: 85, backlinks: 18 },

export type MonthlyStats = {
  /** YYYY-MM */
  month: string;
  /** Lượt truy cập (sessions) trong tháng */
  visits: number;
  pageviews?: number;
  /** Người đăng ký newsletter cuối tháng */
  subscribers?: number;
  /** Số domain trỏ link về aithubs.com */
  backlinks?: number;
};

export const MONTHLY_STATS: MonthlyStats[] = [];

export const STATS_SOURCE = "Google Analytics 4 and Google Search Console";
