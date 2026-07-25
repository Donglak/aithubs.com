import {
  Package,
  Eye,
  MousePointerClick,
  MessageSquare,
  Plus,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import type { DigitalProduct } from "../../types/vendor";

export default function VendorDashboardPage() {
  const { vendor, loading } = useVendorContext();
  const [recentProducts, setRecentProducts] = useState<DigitalProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!vendor) return;
    vendorDb
      .from("digital_products")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecentProducts((data || []) as DigitalProduct[]);
        setProductsLoading(false);
      });
  }, [vendor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Products",
      value: vendor?.total_products ?? 0,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Views",
      value: vendor?.total_views ?? 0,
      icon: Eye,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Total Clicks",
      value: 0,
      icon: MousePointerClick,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Total Leads",
      value: 0,
      icon: MessageSquare,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  const statusBadge = (status: string) => {
    const lightColors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 border border-gray-200",
      submitted: "bg-blue-100 text-blue-800 border border-blue-200",
      under_review: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      approved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
      archived: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return (
      lightColors[status] ||
      "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Welcome back, {vendor?.brand_name}
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-xl p-5 border ${stat.bg} ${stat.bg.includes("blue") ? "border-blue-200 dark:border-blue-800" : ""} ${stat.bg.includes("green") ? "border-green-200 dark:border-green-800" : ""} ${stat.bg.includes("purple") ? "border-purple-200 dark:border-purple-800" : ""} ${stat.bg.includes("yellow") ? "border-yellow-200 dark:border-yellow-800" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
          <Link
            to="/vendor/products"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
          >
            View All
          </Link>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No products yet</p>
            <Link
              to="/vendor/products/new"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {product.cover_image ? (
                    <img
                      src={product.cover_image}
                      alt={product.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.price_model === "free"
                        ? "Free"
                        : product.price
                          ? `$${product.price}`
                          : "Paid"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${statusBadge(product.status)}`}
                  >
                    {product.status.replace("_", " ")}
                  </span>
                  {product.status === "approved" && (
                    <a
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}