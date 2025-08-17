// src/types/tool.ts

export type VideoItem = {
  title: string;
  url: string;        // chấp nhận watch?v=, youtu.be/, shorts/, embed/
  channel?: string;
  publishedAt?: string;
};
export type PricingTier = {
  name: string;
  price: string;
  billing?: 'monthly' | 'yearly';
  features: string[];
};

export type ToolBase = {
  id: number;                          // SỐ nguyên                     // duy nhất
  name: string;
  image: string;
  website: string;
  company?: string;
  category: string | string[];         // có thể là mảng
  subcategory?: string | string[];
  rating?: number;
  reviews?: number;
  featured: boolean;
  price?: string;                      // 'Free', 'Free - $10', 'Contact price'
  freeTrial?: boolean;
  description?: string;
  tags?: string[];
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
