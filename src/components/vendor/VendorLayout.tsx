import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useVendor } from "../../hooks/useVendor";
import { VendorProvider } from "../../contexts/VendorContext";
import VendorSidebar from "./VendorSidebar";

function VendorLayoutInner() {
  const { user, loading: authLoading } = useAuth();
  const { vendor, loading: vendorLoading } = useVendor();

  if (authLoading || vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Become a Vendor
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven&apos;t set up your vendor profile yet. Create one to start
            listing your products.
          </p>
          <a
            href="/become-vendor"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    );
  }

  if (vendor.status === "pending" || vendor.status === "under_review") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Application Under Review
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your vendor application is being reviewed. You&apos;ll be able to
            access your dashboard once it&apos;s approved.
          </p>
        </div>
      </div>
    );
  }

  if (vendor.status === "rejected") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Application Not Approved
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {vendor.rejection_reason ||
              "Your vendor application was not approved at this time."}
          </p>
          <a
            href="/contact"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline"
          >
            Contact us
          </a>
        </div>
      </div>
    );
  }

  if (vendor.status === "suspended") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Account Suspended
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your vendor account has been suspended. Please contact support.
          </p>
          <a
            href="/contact"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Approved: show the workspace layout
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 pt-16">
      <VendorSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function VendorLayout() {
  return (
    <VendorProvider>
      <VendorLayoutInner />
    </VendorProvider>
  );
}
