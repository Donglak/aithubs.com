import { CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { LISTING_TIERS, PAID_LISTING_TRAFFIC_THRESHOLD } from "../../data/listingTiers";

export function ListingTiers({ cta }: { cta?: { label: string; to: string } }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LISTING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-5 bg-white dark:bg-gray-800 ${
              tier.highlighted
                ? "border-primary-500 ring-2 ring-primary-500/20"
                : "border-gray-200 dark:border-gray-700"
            } ${tier.available ? "" : "opacity-70"}`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                Best value
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{tier.price}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tier.note}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            {!tier.available && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                Opens at {PAID_LISTING_TRAFFIC_THRESHOLD.toLocaleString()} visits/month
              </p>
            )}
            {tier.available && cta && (
              <Link
                to={cta.to}
                className={`mt-4 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {cta.label}
              </Link>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        We don't sell rankings: featured listings are always labeled and review verdicts never change for money.
        Paid tiers open only once our{" "}
        <Link to="/stats" className="underline">
          public traffic stats
        </Link>{" "}
        justify them.
      </p>
    </div>
  );
}
