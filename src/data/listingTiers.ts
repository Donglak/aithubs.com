// Bảng giá listing công khai (chiến lược: miễn phí trước, thu phí khi có traffic thật)
import { DEAL_PARTNER_MIN_DISCOUNT } from "../types/vendor";

/** Lượt truy cập/tháng cần đạt trước khi mở bán gói Basic (xem trang /stats) */
export const PAID_LISTING_TRAFFIC_THRESHOLD = 5000;

export type ListingTier = {
  name: string;
  price: string;
  note: string;
  features: string[];
  available: boolean;
  highlighted?: boolean;
};

export const LISTING_TIERS: ListingTier[] = [
  {
    name: "Free",
    price: "$0",
    note: "Reviewed in 2–4 weeks",
    available: true,
    features: [
      "Permanent listing",
      'Requires the "Featured on AIThubs" badge on your site',
      "Views & outbound-click analytics",
    ],
  },
  {
    name: "Deal Partner",
    price: "$0",
    note: "Priority review",
    available: true,
    highlighted: true,
    features: [
      `Exclusive discount of ${DEAL_PARTNER_MIN_DISCOUNT}%+ for AIThubs readers`,
      "Your affiliate link on the listing",
      "Featured placement (always labeled)",
      "Included in our weekly deal newsletter",
    ],
  },
  {
    name: "Basic",
    price: "$19",
    note: "One-time · launch price",
    available: false,
    features: ["Live within 48 hours", "Dofollow link", "Permanent listing", "Refund if rejected"],
  },
  {
    name: "Featured",
    price: "$59",
    note: "One-time",
    available: false,
    features: ["Everything in Basic", "30 days featured placement", "In-depth review", "One newsletter mention"],
  },
];
