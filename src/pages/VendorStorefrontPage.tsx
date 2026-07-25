import {
  ExternalLink,
  Globe,
  Mail,
  Loader2,
  Package,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { vendorDb } from "../lib/supabase";
import type { DigitalProduct, Vendor } from "../types/vendor";

export default function VendorStorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    vendorDb
      .from("vendors")
      .select("*")
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle()
      .then(async ({ data: vendorData, error }) => {
        if (error || !vendorData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const v = vendorData as Vendor;
        setVendor(v);

        const { data: productData } = await vendorDb
          .from("digital_products")
          .select("*, category:category_id(*)")
          .eq("vendor_id", v.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        setProducts((productData || []) as DigitalProduct[]);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Vendor Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This vendor storefront does not exist or is not yet approved.
          </p>
          <Link
            to="/tools"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
          >
            Browse AI Tools
          </Link>
        </div>
      </div>
    );
  }

  const socialLinks: Record<string, string> = vendor.social_links || {};
  const hasSocial = Object.keys(socialLinks).length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16">
      <Helmet>
        <title>
          {vendor.seo_title || `${vendor.brand_name} - AIThub Vendor`}
        </title>
        <meta
          name="description"
          content={
            vendor.seo_description ||
            vendor.bio ||
            `${vendor.brand_name} on AIThub`
          }
        />
      </Helmet>

      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary-600 via-gray-100 dark:via-gray-800 to-secondary-600 relative">
        {vendor.cover_url && (
          <img
            src={vendor.cover_url}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        )}
      </div>

      {/* Vendor Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-8">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={vendor.brand_name}
              className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-900 object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-900 bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {vendor.brand_name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {vendor.brand_name}
            </h1>
            {vendor.bio && (
              <p className="text-gray-900 dark:text-gray-400 mt-1">
                {vendor.bio}
              </p>
            )}
          </div>
        </div>

        {/* Links Row */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-900 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {vendor.support_email && (
            <a
              href={`mailto:${vendor.support_email}`}
              className="flex items-center gap-1.5 text-gray-900 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {vendor.support_email}
            </a>
          )}
          {hasSocial &&
            Object.entries(socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 capitalize transition-colors"
              >
                {platform}
              </a>
            ))}
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
            <Package className="w-4 h-4" />
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-900 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No products listed yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all"
              >
                {product.cover_image ? (
                  <img
                    src={product.cover_image}
                    alt={product.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-gray-400 mt-1 line-clamp-2">
                    {product.short_description ||
                      product.full_description?.slice(0, 100) ||
                      ""}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {product.price_model === "free"
                        ? "Free"
                        : product.price
                          ? `$${product.price}`
                          : "Contact"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
