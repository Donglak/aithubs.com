import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useVendorContext } from "../../contexts/VendorContext";
import type { VendorPlan } from "../../types/vendor";

const PLACEHOLDER_PLANS: VendorPlan[] = [
  {
    id: "1",
    name: "Free",
    slug: "free",
    description: "List up to 1 product. Basic visibility.",
    price_monthly: 0,
    price_yearly: 0,
    max_listings: 1,
    max_team_members: 1,
    analytics_enabled: false,
    leads_enabled: false,
    featured_listing: false,
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
    is_active: true,
    sort_order: 1,
    created_at: "",
  },
  {
    id: "2",
    name: "Starter",
    slug: "starter",
    description: "List up to 5 products with analytics.",
    price_monthly: 9.99,
    price_yearly: 99.99,
    max_listings: 5,
    max_team_members: 1,
    analytics_enabled: true,
    leads_enabled: false,
    featured_listing: false,
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
    is_active: true,
    sort_order: 2,
    created_at: "",
  },
  {
    id: "3",
    name: "Pro",
    slug: "pro",
    description: "List up to 25 products with analytics and leads.",
    price_monthly: 29.99,
    price_yearly: 299.99,
    max_listings: 25,
    max_team_members: 3,
    analytics_enabled: true,
    leads_enabled: true,
    featured_listing: false,
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
    is_active: true,
    sort_order: 3,
    created_at: "",
  },
  {
    id: "4",
    name: "Enterprise",
    slug: "enterprise",
    description: "Unlimited listings, priority support, team members.",
    price_monthly: 99.99,
    price_yearly: 999.99,
    max_listings: 999,
    max_team_members: 10,
    analytics_enabled: true,
    leads_enabled: true,
    featured_listing: true,
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
    is_active: true,
    sort_order: 4,
    created_at: "",
  },
];

export default function VendorSubscriptionPage() {
  const { subscription, plan, loading, vendor } = useVendorContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const statusColor = (status: string) => {
    const lightColors: Record<string, string> = {
      active: "bg-green-100 text-green-800 border border-green-200",
      trialing: "bg-blue-100 text-blue-800 border border-blue-200",
      past_due: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      canceled: "bg-red-100 text-red-800 border border-red-200",
      incomplete: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return lightColors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your vendor plan and billing
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h2>
        {plan ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColor(subscription?.status || "active")}`}
                >
                  {subscription?.status || "active"}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{plan.description}</p>
              {subscription?.current_period_end && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current period ends:{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {plan.analytics_enabled && (
                  <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Analytics
                  </span>
                )}
                {plan.leads_enabled && (
                  <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Lead Capture
                  </span>
                )}
                {!plan.analytics_enabled && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-3 h-3" /> No Analytics
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${plan.price_monthly}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">/month</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CreditCard className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">You are on the Free plan.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Upgrade to unlock more features.
            </p>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Plans</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          {PLACEHOLDER_PLANS.map((p) => {
            const isCurrent = plan?.id === p.id;
            return (
              <div
                key={p.id}
                className={`p-6 ${isCurrent ? "bg-primary-50 dark:bg-primary-900/10" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {p.price_monthly === 0 ? "Free" : `$${p.price_monthly}`}
                  {p.price_monthly > 0 && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /mo
                    </span>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    {p.max_listings >= 999 ? "Unlimited" : p.max_listings}{" "}
                    listings
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {p.analytics_enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                    Analytics
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    {p.leads_enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                    Lead Capture
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle2
                      className={`w-4 h-4 ${p.max_team_members > 1 ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
                    />
                    {p.max_team_members} team{" "}
                    {p.max_team_members > 1 ? "members" : "member"}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}