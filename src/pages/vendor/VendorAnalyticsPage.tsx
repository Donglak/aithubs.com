import {
  BarChart3,
  Eye,
  MousePointerClick,
  Bookmark,
  Download,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import type { AnalyticsDaily, DigitalProduct } from "../../types/vendor";

type Period = "7d" | "30d" | "90d";

export default function VendorAnalyticsPage() {
  const { vendor } = useVendorContext();
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    if (!vendor) return;
    setLoading(true);

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const since = new Date(Date.now() - days * 86400000)
      .toISOString()
      .split("T")[0];

    Promise.all([
      vendorDb.from("digital_products").select("*").eq("vendor_id", vendor.id),
      vendorDb
        .from("product_analytics_daily")
        .select("*")
        .eq("vendor_id", vendor.id)
        .gte("date", since),
    ]).then(([prodRes, anRes]) => {
      setProducts((prodRes.data || []) as DigitalProduct[]);
      setAnalytics((anRes.data || []) as AnalyticsDaily[]);
      setLoading(false);
    });
  }, [vendor, period]);

  const totals = {
    impressions: analytics.reduce((s, a) => s + a.impressions, 0),
    clicks: analytics.reduce((s, a) => s + a.clicks, 0),
    bookmarks: analytics.reduce((s, a) => s + a.bookmarks, 0),
    saves: analytics.reduce((s, a) => s + a.saves, 0),
    outbound_clicks: analytics.reduce((s, a) => s + a.outbound_clicks, 0),
    leads: analytics.reduce((s, a) => s + a.leads, 0),
  };

  const kpis = [
    {
      label: "Impressions",
      value: totals.impressions,
      icon: Eye,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Clicks",
      value: totals.clicks,
      icon: MousePointerClick,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "CTR",
      value:
        totals.impressions > 0
          ? `${((totals.clicks / totals.impressions) * 100).toFixed(1)}%`
          : "0%",
      icon: BarChart3,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Bookmarks",
      value: totals.bookmarks,
      icon: Bookmark,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "Saves",
      value: totals.saves,
      icon: Download,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      label: "Leads",
      value: totals.leads,
      icon: MessageSquare,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  const productAnalytics = products.map((p) => {
    const pa = analytics.filter((a) => a.product_id === p.id);
    return {
      product: p,
      impressions: pa.reduce((s, a) => s + a.impressions, 0),
      clicks: pa.reduce((s, a) => s + a.clicks, 0),
      saves: pa.reduce((s, a) => s + a.saves, 0),
      leads: pa.reduce((s, a) => s + a.leads, 0),
    };
  });

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track your product performance
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className={`rounded-xl p-4 border ${kpi.bg} ${kpi.bg.includes("blue") ? "border-blue-200 dark:border-blue-800" : ""} ${kpi.bg.includes("purple") ? "border-purple-200 dark:border-purple-800" : ""} ${kpi.bg.includes("green") ? "border-green-200 dark:border-green-800" : ""} ${kpi.bg.includes("yellow") ? "border-yellow-200 dark:border-yellow-800" : ""} ${kpi.bg.includes("indigo") ? "border-indigo-200 dark:border-indigo-800" : ""} ${kpi.bg.includes("red") ? "border-red-200 dark:border-red-800" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpi.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-product table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Per-Product Breakdown
              </h2>
            </div>
            {productAnalytics.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No analytics data available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Product
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Impressions
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Clicks
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Saves
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Leads
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productAnalytics.map((pa) => (
                      <tr
                        key={pa.product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                          {pa.product.title}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pa.impressions}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pa.clicks}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pa.saves}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pa.leads}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}