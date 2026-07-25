import { CheckCircle2, Loader2, Package, XCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { vendorDb } from "../../lib/supabase";
import type { DigitalProduct, Vendor } from "../../types/vendor";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<
    (DigitalProduct & { vendor?: Vendor })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("submitted");

  useEffect(() => {
    setLoading(true);
    let query = vendorDb
      .from("digital_products")
      .select("*, vendor:vendors!inner(brand_name, slug)")
      .order("created_at", { ascending: false });
    if (filter !== "all") {
      query = query.eq("status", filter);
    }
    query.then(({ data }) => {
      const mapped = ((data || []) as any[]).map((p) => ({
        ...p,
        vendor: p.vendor || undefined,
      }));
      setProducts(mapped as (DigitalProduct & { vendor?: Vendor })[]);
      setLoading(false);
    });
  }, [filter]);

  const updateStatus = async (id: string, status: string, reason?: string) => {
    const payload: any = {
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };
    if (status === "approved") payload.is_approved = true;
    if (reason) payload.rejection_reason = reason;
    await vendorDb.from("digital_products").update(payload).eq("id", id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p)),
    );
  };

  const filtered = products.filter(
    (p) => !search || p.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusBadge = (status: string) => {
    const lightColors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800",
      archived: "bg-gray-100 text-gray-800",
    };
    const darkColors: Record<string, string> = {
      draft: "bg-gray-800 text-gray-400",
      submitted: "bg-blue-900/30 text-blue-400",
      under_review: "bg-yellow-900/30 text-yellow-400",
      approved: "bg-green-900/30 text-green-400",
      rejected: "bg-red-900/30 text-red-400",
      suspended: "bg-red-900/30 text-red-400",
      archived: "bg-gray-800 text-gray-400",
    };
    return (
      lightColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin - Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review and manage product listings
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex-wrap">
            {[
              "all",
              "submitted",
              "under_review",
              "approved",
              "rejected",
              "draft",
              "suspended",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-900 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No products found.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Product
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Vendor
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Created
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {p.cover_image ? (
                            <img
                              src={p.cover_image}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                        {p.vendor?.brand_name || "Unknown"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(p.status)}`}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                        {p.price_model === "free"
                          ? "Free"
                          : p.price
                            ? `$${p.price}`
                            : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {(p.status === "submitted" ||
                            p.status === "under_review" ||
                            p.status === "rejected") && (
                            <>
                              <button
                                onClick={() => updateStatus(p.id, "approved")}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = window.prompt(
                                    "Rejection reason (optional):",
                                  );
                                  updateStatus(
                                    p.id,
                                    "rejected",
                                    reason || undefined,
                                  );
                                }}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          {p.status === "approved" && (
                            <button
                              onClick={() => updateStatus(p.id, "suspended")}
                              className="text-xs px-2.5 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
