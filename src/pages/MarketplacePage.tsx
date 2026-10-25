import { Loader2, Package, Search, Sparkles, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { vendorDb } from "../lib/supabase";
import type { ProductCategory } from "../types/vendor";

const PAGE_SIZE = 24;

interface MarketplaceProduct {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  cover_image: string | null;
  price_model: "free" | "paid" | "freemium" | "contact";
  price: number | null;
  featured: boolean;
  category: Pick<ProductCategory, "name" | "slug"> | null;
  vendor: { brand_name: string; slug: string; logo_url: string | null } | null;
}

// Bỏ ký tự đặc biệt của cú pháp filter PostgREST
const sanitize = (q: string) => q.replace(/[,()%*\\]/g, " ").trim();

function priceLabel(p: MarketplaceProduct) {
  if (p.price_model === "free") return "Free";
  if (p.price_model === "contact") return "Contact for price";
  if (p.price == null) return p.price_model === "freemium" ? "Freemium" : "Paid";
  return `${p.price_model === "freemium" ? "From " : ""}$${Number(p.price).toFixed(2)}`;
}

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const [input, setInput] = useState(query);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    vendorDb
      .from("product_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCategories((data || []) as ProductCategory[]));
  }, []);

  // Debounce ô tìm kiếm -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (input === query) return;
      const next = new URLSearchParams(searchParams);
      if (input) next.set("q", input);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [input, query, searchParams, setSearchParams]);

  const fetchPage = async (offset: number) => {
    // RLS chỉ trả về sản phẩm đã duyệt của vendor còn gói hiệu lực
    let q = vendorDb
      .from("digital_products")
      .select(
        "id, slug, title, short_description, cover_image, price_model, price, featured, category:category_id(name, slug), vendor:vendor_id(brand_name, slug, logo_url)",
      )
      .eq("is_approved", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    const term = sanitize(query);
    if (term) q = q.or(`title.ilike.%${term}%,short_description.ilike.%${term}%`);
    const cat = categories.find((c) => c.slug === category);
    if (cat) q = q.eq("category_id", cat.id);

    const { data, error } = await q;
    if (error) {
      console.error("Marketplace query failed:", error);
      return [];
    }
    return (data || []) as unknown as MarketplaceProduct[];
  };

  useEffect(() => {
    // Chờ có danh sách category nếu URL đang lọc theo category
    if (category && !categories.length) return;
    let cancelled = false;
    setLoading(true);
    fetchPage(0).then((rows) => {
      if (cancelled) return;
      setProducts(rows);
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, categories]);

  const loadMore = async () => {
    setLoadingMore(true);
    const rows = await fetchPage(products.length);
    setProducts((prev) => [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Marketplace - Digital Products from Independent Creators | AIThubs</title>
        <meta
          name="description"
          content="Discover AI tools, courses, ebooks, templates and more from independent creators on the AIThubs marketplace."
        />
      </Helmet>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI tools, courses, ebooks and templates from independent creators.
            </p>
          </div>
          <Link
            to="/become-vendor"
            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
          >
            <Store className="w-4 h-4" />
            Sell your products
          </Link>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" role="tablist" aria-label="Categories">
          {[{ slug: "", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug || "all"}
              type="button"
              role="tab"
              aria-selected={category === c.slug}
              onClick={() => setCategory(c.slug)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c.slug
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                >
                  <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-700">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    {p.featured && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    {p.category && <span className="text-xs text-primary-600 dark:text-primary-400 mb-1">{p.category.name}</span>}
                    <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {p.title}
                    </h2>
                    {p.short_description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{p.short_description}</p>
                    )}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-gray-500 dark:text-gray-400">{p.vendor?.brand_name}</span>
                      <span className="shrink-0 font-semibold text-gray-900 dark:text-white">{priceLabel(p)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
