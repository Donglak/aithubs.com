import { CheckCircle2, Loader2, XCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/vendor/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";
import { vendorDb } from "../../lib/supabase";
import type { Vendor } from "../../types/vendor";

export default function AdminVendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    let query = vendorDb
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") {
      query = query.eq("status", filter);
    }
    query.then(({ data }) => {
      setVendors((data || []) as Vendor[]);
      setLoading(false);
    });
  }, [filter]);

  const updateStatus = async (id: string, status: string, reason?: string) => {
    const payload: any = {
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };
    if (reason) payload.rejection_reason = reason;
    await vendorDb.from("vendors").update(payload).eq("id", id);
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...payload } : v)),
    );
  };

  const filtered = vendors.filter(
    (v) =>
      !search ||
      v.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.slug?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusBadge = (status: string) => {
    const lightColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800",
    };
    const darkColors: Record<string, string> = {
      pending: "bg-yellow-900/30 text-yellow-400",
      under_review: "bg-blue-900/30 text-blue-400",
      approved: "bg-green-900/30 text-green-400",
      rejected: "bg-red-900/30 text-red-400",
      suspended: "bg-red-900/30 text-red-400",
    };
    return (
      lightColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    );
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin - Vendors
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Review and manage vendor applications
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              {["all", "pending", "under_review", "approved", "rejected"].map(
                (f) => (
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
                ),
              )}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-900 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Search vendors..."
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
              <p className="text-gray-500 dark:text-gray-400">
                No vendors found.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Vendor
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Brand
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Products
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
                    {filtered.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {v.logo_url ? (
                              <img
                                src={v.logo_url}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                {v.brand_name?.[0]}
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {v.brand_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                          /vendors/{v.slug}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(v.status)}`}
                          >
                            {v.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                          {v.total_products}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-400">
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {(v.status === "pending" ||
                              v.status === "under_review" ||
                              v.status === "rejected") && (
                              <>
                                <button
                                  onClick={() => updateStatus(v.id, "approved")}
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
                                      v.id,
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
                            {v.status === "approved" && (
                              <button
                                onClick={() => updateStatus(v.id, "suspended")}
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
    </ProtectedRoute>
  );
}
