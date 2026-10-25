import { useEffect, useState } from "react";
import { vendorDb } from "../lib/supabase";
import type { VendorPlan } from "../types/vendor";

/** Các gói vendor đang bán (bảng vendor_plans, is_active = true) */
export function useVendorPlans() {
  const [plans, setPlans] = useState<VendorPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorDb
      .from("vendor_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setPlans((data || []) as VendorPlan[]);
        setLoading(false);
      });
  }, []);

  return { plans, loading };
}

export function planFeatures(p: VendorPlan): string[] {
  return [
    p.max_listings >= 999 ? "Unlimited product listings" : `Up to ${p.max_listings} product listings`,
    "Public vendor storefront",
    "Link to your own checkout",
    ...(p.analytics_enabled ? ["Views & click analytics"] : []),
    ...(p.leads_enabled ? ["Lead capture form"] : []),
    ...(p.featured_listing ? ["Eligible for featured placement"] : []),
  ];
}

export function yearlySavings(p: VendorPlan): number {
  const full = p.price_monthly * 12;
  return full > 0 ? Math.round((1 - p.price_yearly / full) * 100) : 0;
}
