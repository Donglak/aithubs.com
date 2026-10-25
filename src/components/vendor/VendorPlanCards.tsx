import { CheckCircle2, Loader2 } from "lucide-react";
import { planFeatures } from "../../hooks/useVendorPlans";
import type { BillingInterval, VendorPlan } from "../../types/vendor";

export function IntervalToggle({
  value,
  onChange,
  maxSavings,
}: {
  value: BillingInterval;
  onChange: (v: BillingInterval) => void;
  maxSavings: number;
}) {
  return (
    <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg" role="radiogroup" aria-label="Billing interval">
      {(["month", "year"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            value === v
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {v === "month" ? "Monthly" : "Yearly"}
          {v === "year" && maxSavings > 0 && (
            <span className="ml-1.5 text-xs text-green-600 dark:text-green-400">save {maxSavings}%</span>
          )}
        </button>
      ))}
    </div>
  );
}

interface PlanCardsProps {
  plans: VendorPlan[];
  interval: BillingInterval;
  currentPlanId?: string | null;
  currentInterval?: BillingInterval | null;
  busySlug?: string | null;
  ctaLabel: (plan: VendorPlan, isCurrent: boolean) => string;
  onSelect: (plan: VendorPlan) => void;
}

export function VendorPlanCards({ plans, interval, currentPlanId, currentInterval, busySlug, ctaLabel, onSelect }: PlanCardsProps) {
  // Gói giữa (Pro) là gói nổi bật
  const highlighted = plans[Math.floor(plans.length / 2)]?.id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((p) => {
        const isCurrent = p.id === currentPlanId && interval === currentInterval;
        const price = interval === "month" ? p.price_monthly : p.price_yearly;
        const isHighlighted = p.id === highlighted;
        return (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border p-6 bg-white dark:bg-gray-800 ${
              isHighlighted ? "border-primary-500 ring-2 ring-primary-500/20" : "border-gray-200 dark:border-gray-700"
            }`}
          >
            {isHighlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</h3>
            {p.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.description}</p>}
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</span>
              <span className="text-gray-500 dark:text-gray-400">/{interval === "month" ? "month" : "year"}</span>
              {interval === "year" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ${(p.price_yearly / 12).toFixed(2)}/month billed yearly
                </p>
              )}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {planFeatures(p).map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onSelect(p)}
              disabled={isCurrent || !!busySlug}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                isCurrent
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : isHighlighted
                    ? "bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
                    : "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
              }`}
            >
              {busySlug === p.slug && <Loader2 className="w-4 h-4 animate-spin" />}
              {ctaLabel(p, isCurrent)}
            </button>
          </div>
        );
      })}
    </div>
  );
}
