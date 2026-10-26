import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TOOL_DEALS, isDealActive } from "../data/deals";
import { PAID_LISTING_TRAFFIC_THRESHOLD } from "../data/listingTiers";
import { TOOL_REVIEWS } from "../data/reviews";
import { MONTHLY_STATS, STATS_SOURCE } from "../data/siteStats";
import { tools } from "../data/tools";
import { USE_CASES } from "../data/useCases";

function monthLabel(m: string) {
  return new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function StatsPage() {
  const months = [...MONTHLY_STATS].sort((a, b) => b.month.localeCompare(a.month));
  const latest = months[0];
  const progress = latest ? Math.min(100, Math.round((latest.visits / PAID_LISTING_TRAFFIC_THRESHOLD) * 100)) : 0;

  const catalog = [
    { label: "Tools listed", value: tools.length },
    { label: "Tested reviews", value: Object.keys(TOOL_REVIEWS).length },
    { label: "Active deals", value: TOOL_DEALS.filter((d) => isDealActive(d)).length },
    { label: "Tool stacks", value: USE_CASES.length },
  ];

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>Traffic Stats & How We Make Money | AIThubs</title>
        <meta
          name="description"
          content="AIThubs publishes its real monthly traffic and explains how it makes money. No inflated numbers."
        />
        <link rel="canonical" href="https://aithubs.com/stats" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Open stats</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          We publish our real traffic every month, even while the numbers are small. If you are deciding whether to
          list your tool here, this is what you get.
        </p>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {catalog.map((c) => (
            <div key={c.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{c.label}</div>
            </div>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Monthly traffic</h2>
          {months.length === 0 ? (
            <p className="rounded-xl bg-gray-50 dark:bg-gray-800 p-5 text-sm text-gray-600 dark:text-gray-400">
              Our first monthly report will be published here at the start of next month.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium text-right">Visits</th>
                    <th className="px-4 py-3 font-medium text-right">Pageviews</th>
                    <th className="px-4 py-3 font-medium text-right">Newsletter</th>
                    <th className="px-4 py-3 font-medium text-right">Linking domains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                  {months.map((m) => (
                    <tr key={m.month}>
                      <td className="px-4 py-3">{monthLabel(m.month)}</td>
                      <td className="px-4 py-3 text-right">{m.visits.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{m.pageviews?.toLocaleString() ?? "—"}</td>
                      <td className="px-4 py-3 text-right">{m.subscribers?.toLocaleString() ?? "—"}</td>
                      <td className="px-4 py-3 text-right">{m.backlinks?.toLocaleString() ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Source: {STATS_SOURCE}.</p>
        </section>

        <section className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">When paid listings open</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Listing is free until we reach {PAID_LISTING_TRAFFIC_THRESHOLD.toLocaleString()} visits a month. Then we
            open the $19 Basic listing at a launch price that rises with traffic.
          </p>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-primary-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {latest
              ? `${latest.visits.toLocaleString()} of ${PAID_LISTING_TRAFFIC_THRESHOLD.toLocaleString()} visits in ${monthLabel(latest.month)}`
              : "No traffic report yet"}
          </p>
          <Link to="/become-vendor" className="mt-4 inline-block text-sm font-medium text-primary-600 underline">
            List your tool for free
          </Link>
        </section>

        <section id="how-we-make-money" className="scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How we make money</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Affiliate commissions.</strong> Some links on AIThubs are affiliate links. If you buy through
              them we may earn a commission, at no extra cost to you. Affiliate links are marked as sponsored.
            </li>
            <li>
              <strong>Exclusive deals.</strong> Tool makers can give our readers a discount code. That gets them a
              featured spot, which is always labeled &quot;Featured&quot;.
            </li>
            <li>
              <strong>Listings and newsletter sponsorship</strong>, once our traffic justifies them. We will announce
              prices here first.
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Money never buys a better verdict or ranking. Reading AIThubs is free.
          </p>
        </section>
      </div>
    </div>
  );
}
