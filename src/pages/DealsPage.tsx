import { Loader2, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import BlackFridayBanner from "../components/BlackFridayBanner";
import DealCard from "../components/DealCard";
import NewsletterForm from "../components/NewsletterForm";
import { BLACK_FRIDAY, TOOL_DEALS, isDealActive } from "../data/deals";
import { tools } from "../data/tools";
import { vendorDb } from "../lib/supabase";
import type { ToolDeal } from "../types/tool";
import { toSlug } from "../utils/slug";

type DealRow = ToolDeal & { key: string; detailPath?: string };
type VendorDealProduct = {
  id: string;
  slug: string;
  title: string;
  deal_code: string;
  deal_discount_percent: number | null;
  deal_terms: string | null;
  deal_expires_at: string | null;
  affiliate_url: string | null;
  external_sales_link: string | null;
  reviewed_at: string | null;
  updated_at: string;
};
type Filter = "all" | "exclusive" | "lifetime";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All deals" },
  { key: "exclusive", label: "AIThubs exclusive" },
  { key: "lifetime", label: "Lifetime deals" },
];

export default function DealsPage() {
  const [vendorDeals, setVendorDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  // Deal độc quyền vendor gửi kèm listing (chỉ sản phẩm đã duyệt mới đọc được qua RLS)
  useEffect(() => {
    vendorDb
      .from("digital_products")
      .select(
        "id, slug, title, deal_code, deal_discount_percent, deal_terms, deal_expires_at, affiliate_url, external_sales_link, reviewed_at, updated_at",
      )
      .eq("is_approved", true)
      .not("deal_code", "is", null)
      .then(({ data }) => {
        setVendorDeals(
          ((data || []) as VendorDealProduct[]).map((p) => ({
            key: `p-${p.id}`,
            toolName: p.title,
            headline: p.deal_discount_percent ? `${p.deal_discount_percent}% off` : "Exclusive discount",
            code: p.deal_code,
            terms: p.deal_terms ?? undefined,
            url: p.affiliate_url || p.external_sales_link || "",
            affiliate: !!p.affiliate_url,
            exclusive: true,
            expiresAt: p.deal_expires_at ?? undefined,
            checkedAt: p.reviewed_at || p.updated_at,
            detailPath: `/products/${p.slug}`,
          })),
        );
        setLoading(false);
      });
  }, []);

  const deals = useMemo(() => {
    const editorial: DealRow[] = TOOL_DEALS.map((d, i) => {
      const tool = d.toolId ? tools.find((t) => t.id === d.toolId) : undefined;
      return { ...d, key: `e-${i}`, detailPath: tool ? `/tools/${toSlug(tool.name)}` : undefined };
    });
    return [...editorial, ...vendorDeals]
      .filter((d) => isDealActive(d))
      .filter((d) => (filter === "exclusive" ? d.exclusive : filter === "lifetime" ? d.lifetime : true))
      .sort((a, b) => Number(!!b.exclusive) - Number(!!a.exclusive) || b.checkedAt.localeCompare(a.checkedAt));
  }, [vendorDeals, filter]);

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>{`Best AI Deals & Lifetime Deals for Solopreneurs (${BLACK_FRIDAY.year}) | AIThubs`}</title>
        <meta
          name="description"
          content="Hand-checked AI tool deals, coupons and lifetime deals for side hustlers, creators and freelancers. Updated weekly, each with a one-line verdict."
        />
        <link rel="canonical" href="https://aithubs.com/deals" />
      </Helmet>

      <BlackFridayBanner />

      <section className="bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-white/90 mb-3">
            <Tag className="w-4 h-4" /> Lifetime Deal Tracker
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">AI deals worth your money</h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Every deal is checked by hand and comes with a one-line verdict. Get the 5 best deals in your inbox every
            week.
          </p>
          <NewsletterForm source="deal_tracker" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8" role="radiogroup" aria-label="Filter deals">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="radio"
              aria-checked={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && deals.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-lg font-medium text-gray-900 dark:text-white">New deals are being checked</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              We only list deals we have verified. Subscribe above to get them first, including our Black Friday{" "}
              {BLACK_FRIDAY.year} picks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((d) => (
              <div key={d.key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  {d.detailPath ? (
                    <Link
                      to={d.detailPath}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {d.toolName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white">{d.toolName}</span>
                  )}
                  {d.lifetime && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Lifetime
                    </span>
                  )}
                </div>
                {d.verdict && <p className="text-sm text-gray-600 dark:text-gray-400">{d.verdict}</p>}
                <DealCard
                  headline={d.headline}
                  code={d.code}
                  terms={d.terms}
                  expiresAt={d.expiresAt}
                  checkedAt={d.checkedAt}
                  url={d.url}
                  sponsored={d.affiliate}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-5 text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">How we pick deals.</strong> We check each deal still works
            and say who it is for. Some links are affiliate links, which never change our verdict.{" "}
            <Link to="/stats#how-we-make-money" className="underline">
              How we make money
            </Link>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-5 text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Run an AI tool?</strong> Offer our readers an exclusive
            deal of 20% or more and get a free featured listing.{" "}
            <Link to="/become-vendor" className="underline">
              Become a Deal Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
