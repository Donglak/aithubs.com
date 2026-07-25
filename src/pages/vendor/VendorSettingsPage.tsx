import { AlertTriangle, Bell, User, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function VendorSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white">{user?.email || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Name</span>
              <span className="text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 dark:text-gray-400">Account Type</span>
              <span className="text-primary-600 dark:text-primary-400 font-medium">Vendor</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Coming soon. You&apos;ll be able to configure email notifications
            for new leads, product approvals, and account updates.
          </p>
          <div className="space-y-3">
            {[
              "New lead captured",
              "Product approved/rejected",
              "Subscription changes",
              "Platform announcements",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full relative opacity-50 cursor-not-allowed">
                  <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-0.5 right-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Once you close your vendor account, your profile and products will
            no longer be visible. This action cannot be undone.
          </p>
          <button
            disabled
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 opacity-50 cursor-not-allowed"
          >
            Close Vendor Account
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This feature is not yet available. Please contact support.
          </p>
        </section>
      </div>
    </div>
  );
}