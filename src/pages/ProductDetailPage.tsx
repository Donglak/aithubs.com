import {
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  Package,
  ChevronLeft,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { vendorDb } from "../lib/supabase";
import type { DigitalProduct, ProductCategory, Vendor } from "../types/vendor";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [product, setProduct] = useState<
    (DigitalProduct & { category?: ProductCategory }) | null
  >(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Lead form
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSending, setLeadSending] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const { t } = useTranslation(["product"]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    vendorDb
      .from("digital_products")
      .select("*, category:category_id(*)")
      .eq("slug", slug)
      .eq("is_approved", true)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const p = data as DigitalProduct & { category?: ProductCategory };
        setProduct(p);

        // Fire impression analytics
        try {
          await vendorDb.from("product_analytics_events").insert({
            product_id: p.id,
            vendor_id: p.vendor_id,
            event_type: "impression",
            metadata: { referrer: document.referrer || "direct" },
          });
        } catch {}

        // Fetch vendor
        const { data: vendorData } = await vendorDb
          .from("vendors")
          .select("*")
          .eq("id", p.vendor_id)
          .single();
        setVendor(vendorData as Vendor);

        setLoading(false);
      });
  }, [slug]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !vendor || !leadName || !leadEmail) return;
    setLeadSending(true);
    try {
      await vendorDb.from("vendor_leads").insert({
        product_id: product.id,
        vendor_id: vendor.id,
        name: leadName,
        email: leadEmail,
        message: leadMessage || null,
      });
      await vendorDb.from("product_analytics_events").insert({
        product_id: product.id,
        vendor_id: vendor.id,
        event_type: "lead_capture",
        metadata: {},
      });
      setLeadSent(true);
    } catch (err) {
      console.error("Failed to send lead:", err);
    } finally {
      setLeadSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            t("notFoundTitle")
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            t("notFoundDescription").
          </p>
          <Link
            to="/tools"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
      <Helmet>
        <title>{product.seo_title || `${product.title} - AIThub`}</title>
        <meta
          name="description"
          content={product.seo_description || product.short_description || ""}
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          to={vendor ? `/vendors/${vendor.slug}` : "/tools"}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {vendor ? `${vendor.brand_name} Storefront` : "Back"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              {product.cover_image ? (
                <img
                  src={product.cover_image}
                  alt={product.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary-100 dark:from-primary-900/30 to-gray-100 dark:to-gray-800 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400 dark:text-gray-900" />
                </div>
              )}
              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {product.price_model === "free"
                      ? "Free"
                      : product.price
                        ? `$${product.price}`
                        : "Contact for Price"}
                  </span>
                  {product.category && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs">
                      {product.category.name}
                    </span>
                  )}
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-gray-500 dark:text-gray-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {product.short_description && (
                  <p className="text-gray-900 dark:text-gray-300">
                    {product.short_description}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {product.full_description && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h2>
                <div className="text-gray-900 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.full_description}
                </div>
              </div>
            )}

            {/* Gallery */}
            {product.media && product.media.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  t("galleryTitle")
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {product.media.map((m, i) => (
                    <img
                      key={m.id || i}
                      src={m.url}
                      alt={m.alt_text || ""}
                      className="rounded-lg object-cover w-full h-40"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Demo Link */}
            {product.demo_url && (
              <a
                href={product.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4" />
                t("viewDemo")
              </a>
            )}

            {/* Lead Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                t("leadFormTitle")
              </h2>
              {leadSent ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-green-700 dark:text-green-400 text-sm">
                  t("leadFormSuccess").
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-900 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="t(leadForm:nameLabel) *"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      required
                    />
                    <input
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-900 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                      type="email"
                      placeholder="Your email *"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      required
                    />
                  </div>
                  <textarea
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-900 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none"
                    placeholder="Your message (optional)"
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={leadSending || !leadName || !leadEmail}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {leadSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    t("sendInquiry")
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vendor Card */}
            {vendor && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Vendor
                </h3>
                <Link
                  to={`/vendors/${vendor.slug}`}
                  className="flex items-center gap-3 group"
                >
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.brand_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                      {vendor.brand_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {vendor.brand_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {vendor.bio?.slice(0, 60)}
                    </p>
                  </div>
                </Link>
                <div className="mt-3 space-y-2 text-sm">
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Globe className="w-4 h-4" />
                      t("website")
                    </a>
                  )}
                  {vendor.support_email && (
                    <a
                      href={`mailto:${vendor.support_email}`}
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Mail className="w-4 h-4" />
                      t("contact")
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Purchase CTA */}
            {product.external_sales_link && (
              <a
                href={product.external_sales_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  try {
                    await supabase.from("product_analytics_events").insert({
                      product_id: product.id,
                      vendor_id: product.vendor_id,
                      event_type: "outbound_click",
                      metadata: { url: product.external_sales_link },
                    });
                  } catch (error) {
                    console.error("Failed to track outbound click", error);
                  }
                }}
                className="flex items-center justify-center gap-2 bg-primary-600 text-white w-full px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                t("getThisProduct")
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
