import { Loader2, Mail, MessageSquare, Download, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import type { VendorLead } from "../../types/vendor";

export default function VendorLeadsPage() {
  const { vendor } = useVendorContext();
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<VendorLead | null>(null);

  useEffect(() => {
    if (!vendor) return;
    vendorDb
      .from("vendor_leads")
      .select("*, digital_products!inner(title)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const mapped = ((data || []) as any[]).map((l) => ({
          ...l,
          product_title: l.digital_products?.title || "Unknown",
        }));
        setLeads(mapped as VendorLead[]);
        setLoading(false);
      });
  }, [vendor]);

  const markAsRead = async (id: string) => {
    await vendorDb.from("vendor_leads").update({ read: true }).eq("id", id);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, read: true } : l)),
    );
  };

  const exportCsv = () => {
    const header = "Date,Name,Email,Product,Message,Read\n";
    const rows = leads.map(
      (l) =>
        `${new Date(l.created_at).toLocaleDateString()},"${l.name}","${l.email}","${l.product_title}","${(l.message || "").replace(/"/g, '""')}",${l.read}`,
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Inquiries from potential customers
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No leads yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Leads will appear when customers contact you about your products.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Name
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Message
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${!lead.read ? "bg-primary-50 dark:bg-primary-900/10" : ""}`}
                    onClick={() => {
                      setSelectedLead(lead);
                      if (!lead.read) markAsRead(lead.id);
                    }}
                  >
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!lead.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {lead.product_title || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                      {lead.message || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          lead.read
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                            : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                        }`}
                      >
                        {lead.read ? "Read" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>{" "}
                <span className="text-gray-900 dark:text-white ml-2">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>{" "}
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="text-primary-600 dark:text-primary-400 ml-2"
                >
                  <Mail className="w-3 h-3 inline" />
                  {selectedLead.email}
                </a>
              </div>
              {selectedLead.phone && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Phone:</span>{" "}
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="text-primary-600 dark:text-primary-400 ml-2"
                  >
                    <Phone className="w-3 h-3 inline" />
                    {selectedLead.phone}
                  </a>
                </div>
              )}
              {selectedLead.product_title && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Product:</span>{" "}
                  <span className="text-gray-900 dark:text-white ml-2">
                    {selectedLead.product_title}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date:</span>{" "}
                <span className="text-gray-900 dark:text-white ml-2">
                  {new Date(selectedLead.created_at).toLocaleString()}
                </span>
              </div>
              {selectedLead.message && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Message:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {selectedLead.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}