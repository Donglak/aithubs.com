import { Check, Copy, ExternalLink, Loader2, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import { DailyBarChart, type DailyPoint } from "../../components/vendor/DailyBarChart";
import type { DigitalProduct } from "../../types/vendor";

const DAYS = 30;

type Metric = "views" | "clicks" | "leads";
const METRICS: { key: Metric; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "clicks", label: "Clicks" },
  { key: "leads", label: "Leads" },
];

interface DailyRow {
  product_id: string;
  date: string;
  impressions: number;
  outbound_clicks: number;
  leads: number;
}

type ProductRow = Pick<DigitalProduct, "id" | "title" | "slug" | "status" | "cover_image" | "created_at">;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function pctChange(curr: number, prev: number): string | null {
  if (prev === 0) return curr > 0 ? "new" : null;
  const p = Math.round(((curr - prev) / prev) * 100);
  return `${p > 0 ? "+" : ""}${p}%`;
}

export default function VendorDashboardPage() {
  const { vendor, plan, subscription, listingActive, usedListings } = useVendorContext();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<Metric>("views");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!vendor) return;
    const since = isoDay(new Date(Date.now() - (DAYS * 2 - 1) * 86400000));
    Promise.all([
      vendorDb
        .from("digital_products")
        .select("id, title, slug, status, cover_image, created_at")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false }),
      vendorDb
        .from("product_analytics_daily")
        .select("product_id, date, impressions, outbound_clicks, leads")
        .eq("vendor_id", vendor.id)
        .gte("date", since),
    ]).then(([p, a]) => {
      setProducts((p.data || []) as ProductRow[]);
      setRows((a.data || []) as DailyRow[]);
      setLoading(false);
    });
  }, [vendor]);

  const stats = useMemo(() => {
    const today = new Date();
    const days: string[] = [];
    for (let i = DAYS - 1; i >= 0; i--) days.push(isoDay(new Date(today.getTime() - i * 86400000)));
    const currentStart = days[0];

    const sum = (filter: (r: DailyRow) => boolean) =>
      rows.filter(filter).reduce(
        (acc, r) => ({ views: acc.views + r.impressions, clicks: acc.clicks + r.outbound_clicks, leads: acc.leads + r.leads }),
        { views: 0, clicks: 0, leads: 0 },
      );
    const curr = sum((r) => r.date >= currentStart);
    const prev = sum((r) => r.date < currentStart);

    const byDay = new Map<string, { views: number; clicks: number; leads: number }>();
    for (const r of rows) {
      if (r.date < currentStart) continue;
      const d = byDay.get(r.date) ?? { views: 0, clicks: 0, leads: 0 };
      d.views += r.impressions;
      d.clicks += r.outbound_clicks;
      d.leads += r.leads;
      byDay.set(r.date, d);
    }
    const series = (m: Metric): DailyPoint[] => days.map((date) => ({ date, value: byDay.get(date)?.[m] ?? 0 }));

    const perProduct = new Map<string, { views: number; clicks: number; leads: number }>();
    for (const r of rows) {
      if (r.date < currentStart) continue;
      const p = perProduct.get(r.product_id) ?? { views: 0, clicks: 0, leads: 0 };
      p.views += r.impressions;
      p.clicks += r.outbound_clicks;
      p.leads += r.leads;
      perProduct.set(r.product_id, p);
    }

    return { curr, prev, series, perProduct };
  }, [rows]);

  if (!vendor) return null;

  const isTrial = subscription?.gateway === "trial";
  const daysLeft = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000))
    : 0;
  const storefrontUrl = `${window.location.origin}/vendors/${vendor.slug}`;

  const steps = [
    { done: !!(vendor.logo_url && vendor.bio), label: "Complete your store profile (logo & bio)", to: "/vendor/profile" },
    { done: products.length > 0, label: "Add your first product", to: "/vendor/products/new" },
    { done: products.some((p) => ["submitted", "approved"].includes(p.status)), label: "Submit a product for review", to: "/vendor/products" },
    { done: products.some((p) => p.status === "approved"), label: "Get your first product approved (usually within 24h)", to: "/vendor/products" },
  ];
  const showChecklist = !loading && steps.some((s) => !s.done);

  const ctr = stats.curr.views > 0 ? (stats.curr.clicks / stats.curr.views) * 100 : 0;
  const prevCtr = stats.prev.views > 0 ? (stats.prev.clicks / stats.prev.views) * 100 : 0;
  const kpis = [
    { label: "Views", value: stats.curr.views.toLocaleString(), delta: pctChange(stats.curr.views, stats.prev.views), hint: "Product page visits" },
    { label: "Clicks to your site", value: stats.curr.clicks.toLocaleString(), delta: pctChange(stats.curr.clicks, stats.prev.clicks), hint: "Buyers sent to your checkout" },
    { label: "Click-through rate", value: `${ctr.toFixed(1)}%`, delta: stats.prev.views ? `${ctr - prevCtr >= 0 ? "+" : ""}${(ctr - prevCtr).toFixed(1)} pts` : null, hint: "Clicks ÷ views" },
    { label: "Leads", value: stats.curr.leads.toLocaleString(), delta: pctChange(stats.curr.leads, stats.prev.leads), hint: plan?.leads_enabled ? "Inquiries received" : "Available on Pro+" },
  ];

  const topProducts = products
    .map((p) => ({ ...p, ...(stats.perProduct.get(p.id) ?? { views: 0, clicks: 0, leads: 0 }) }))
    .filter((p) => p.status === "approved" || p.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your storefront link:", storefrontUrl);
    }
  };

  const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {vendor.brand_name}</p>
        </div>
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center gap-2 self-start bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      {/* Plan / trial status */}
      <div className={`${card} p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          {listingActive && isTrial ? (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Free trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {usedListings} of {plan?.max_listings ?? 3} listings used. Subscribe before your trial ends to keep your products visible.
              </p>
            </>
          ) : listingActive && plan ? (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.name} plan</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {usedListings} of {plan.max_listings >= 999 ? "unlimited" : plan.max_listings} listings used
                {subscription?.cancel_at_period_end && subscription.current_period_end
                  ? ` · ends ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isTrial ? "Your free trial has ended" : "No active plan"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your products are hidden from the marketplace. Subscribe to publish them again — approved products go live instantly.
              </p>
            </>
          )}
        </div>
        {(!listingActive || isTrial) && (
          <Link
            to="/vendor/subscription"
            className="shrink-0 text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
          >
            {listingActive ? "Choose a plan" : "Subscribe"}
          </Link>
        )}
      </div>

      {/* Getting started */}
      {showChecklist && (
        <div className={`${card} p-5 mb-6`}>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Get your first visitors</h2>
          <ol className="space-y-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${
                    s.done ? "bg-green-600 text-white" : "border border-gray-300 dark:border-gray-600"
                  }`}
                  aria-hidden="true"
                >
                  {s.done && <Check className="w-3 h-3" />}
                </span>
                {s.done ? (
                  <span className="text-gray-500 dark:text-gray-400 line-through">{s.label}</span>
                ) : (
                  <Link to={s.to} className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                    {s.label}
                  </Link>
                )}
                <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Storefront share — nguồn traffic đầu tiên đến từ chính audience của vendor */}
      <div className={`${card} p-5 mb-6`}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Share your storefront</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
          Post this link on your social profiles, newsletter or website — every visit counts toward your stats.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={storefrontUrl}
            aria-label="Storefront link"
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4" /> Open
            </a>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* KPIs — 30 ngày gần nhất so với 30 ngày trước đó */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className={`${card} p-4`}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{k.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{k.value}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {k.delta ? <span className="text-gray-700 dark:text-gray-300 tabular-nums">{k.delta} </span> : null}
                  {k.delta ? "vs previous 30 days" : k.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className={`${card} p-5 mb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {METRICS.find((m) => m.key === metric)?.label} · last {DAYS} days
              </h2>
              <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg" role="radiogroup" aria-label="Metric">
                {METRICS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={metric === m.key}
                    onClick={() => setMetric(m.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      metric === m.key
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            {stats.curr.views + stats.curr.clicks + stats.curr.leads === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No activity yet. Once a product is approved, share your storefront link to bring in your first visitors.
              </p>
            ) : (
              <DailyBarChart data={stats.series(metric)} metricLabel={METRICS.find((m) => m.key === metric)!.label} />
            )}
          </div>

          {/* Top products */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Products · last {DAYS} days</h2>
              <Link to="/vendor/products" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Manage
              </Link>
            </div>
            {products.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No products yet. <Link to="/vendor/products/new" className="text-primary-600 dark:text-primary-400 hover:underline">Add your first product</Link>.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                      <th scope="col" className="px-5 py-3 font-medium">Product</th>
                      <th scope="col" className="px-5 py-3 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3 font-medium text-right">Views</th>
                      <th scope="col" className="px-5 py-3 font-medium text-right">Clicks</th>
                      <th scope="col" className="px-5 py-3 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(topProducts.length ? topProducts : products.slice(0, 5).map((p) => ({ ...p, views: 0, clicks: 0, leads: 0 }))).map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-3">
                          <Link to={`/vendor/products/${p.id}/edit`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[p.status] ?? STATUS_STYLES.draft}`}>
                            {p.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{p.views.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{p.clicks.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                          {p.views ? `${((p.clicks / p.views) * 100).toFixed(1)}%` : "—"}
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
