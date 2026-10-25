import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVendorContext } from "../../contexts/VendorContext";
import { IntervalToggle, VendorPlanCards } from "../../components/vendor/VendorPlanCards";
import { useVendorPlans, yearlySavings } from "../../hooks/useVendorPlans";
import {
  cancelVendorSubscription,
  confirmVendorSubscription,
  startVendorSubscription,
} from "../../lib/vendorBilling";
import type { BillingInterval, VendorPlan } from "../../types/vendor";

// PayPal có thể mất vài giây để chuyển subscription sang ACTIVE sau khi redirect về
const CONFIRM_ATTEMPTS = 5;
const CONFIRM_DELAY_MS = 2500;

type Notice = { type: "success" | "error" | "info"; text: string } | null;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  past_due: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function VendorSubscriptionPage() {
  const { subscription, plan, listingActive, usedListings, loading, refresh } = useVendorContext();
  const { plans, loading: plansLoading } = useVendorPlans();
  const [searchParams, setSearchParams] = useSearchParams();
  const [interval, setBillingInterval] = useState<BillingInterval>("month");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Quay về từ PayPal
  useEffect(() => {
    const result = searchParams.get("paypal");
    const subscriptionId = searchParams.get("subscription_id");
    if (!result) return;
    setSearchParams({}, { replace: true });

    if (result === "cancel") {
      setNotice({ type: "info", text: "Checkout was cancelled. You have not been charged." });
      return;
    }
    if (!subscriptionId) return;

    let cancelled = false;
    setConfirming(true);
    (async () => {
      try {
        for (let i = 0; i < CONFIRM_ATTEMPTS && !cancelled; i++) {
          const res = await confirmVendorSubscription(subscriptionId);
          if (res.status === "active") {
            await refresh();
            if (!cancelled) setNotice({ type: "success", text: "Your subscription is active. You can now list products." });
            return;
          }
          if (res.status !== "pending") break;
          await new Promise((r) => setTimeout(r, CONFIRM_DELAY_MS));
        }
        if (!cancelled) {
          setNotice({ type: "info", text: "PayPal is still processing your subscription. This page will update once it's confirmed." });
        }
      } catch (err) {
        if (!cancelled) setNotice({ type: "error", text: err instanceof Error ? err.message : "Could not confirm subscription" });
      } finally {
        if (!cancelled) setConfirming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Chỉ chạy khi URL có tham số trả về từ PayPal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subscription?.billing_interval) setBillingInterval(subscription.billing_interval);
  }, [subscription?.billing_interval]);

  const isTrial = subscription?.gateway === "trial";
  const hasPaidPlan = listingActive && !isTrial;

  const handleSelect = async (p: VendorPlan) => {
    if (hasPaidPlan && !window.confirm(
      `Switch to ${p.name} (${interval === "month" ? "monthly" : "yearly"})? Your current PayPal subscription will be cancelled once the new one is active.`,
    )) return;

    setBusySlug(p.slug);
    setNotice(null);
    try {
      await startVendorSubscription(p.slug, interval);
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Could not start checkout" });
      setBusySlug(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription? Your listings stay visible until the end of the current billing period.")) return;
    setCanceling(true);
    setNotice(null);
    try {
      const res = await cancelVendorSubscription();
      await refresh();
      setNotice({
        type: "info",
        text: res.activeUntil
          ? `Subscription cancelled. Your listings stay visible until ${new Date(res.activeUntil).toLocaleDateString()}.`
          : "Subscription cancelled.",
      });
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Could not cancel subscription" });
    } finally {
      setCanceling(false);
    }
  };

  if (loading || plansLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const status = subscription?.status;
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : null;
  const maxSavings = Math.max(0, ...plans.map(yearlySavings));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          An active plan is required to list products on the marketplace.
        </p>
      </div>

      {(notice || confirming) && (
        <div
          className={`mb-6 flex items-start gap-2 p-4 rounded-xl text-sm ${
            confirming || notice?.type === "info"
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
              : notice?.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
          role="status"
        >
          {confirming ? (
            <Loader2 className="w-4 h-4 mt-0.5 animate-spin" />
          ) : notice?.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5" />
          )}
          <span>{confirming ? "Confirming your subscription with PayPal..." : notice?.text}</span>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current plan</h2>
        {isTrial && subscription ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Trial</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${listingActive ? STATUS_STYLES.trialing : STATUS_STYLES.canceled}`}>
                {listingActive ? "active" : "ended"}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {listingActive && periodEnd
                ? `Up to ${plan?.max_listings ?? 3} listings until ${periodEnd}. No payment needed during the trial.`
                : "Your trial has ended and your products are hidden. Subscribe to publish them again — approved products go live instantly."}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
              Listings used: <strong>{usedListings}</strong> / {plan?.max_listings ?? 3}
            </p>
          </div>
        ) : plan && subscription && status !== "canceled" ? (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[status ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
                  {subscription.cancel_at_period_end ? "cancels at period end" : status?.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${subscription.billing_interval === "year" ? plan.price_yearly : plan.price_monthly}
                /{subscription.billing_interval === "year" ? "year" : "month"} via PayPal
              </p>
              {periodEnd && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {subscription.cancel_at_period_end ? "Listings visible until" : "Renews on"} {periodEnd}
                </p>
              )}
              {status === "past_due" && (
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                  PayPal couldn't collect your last payment, so your listings are hidden. Update your payment method in PayPal.
                </p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                Listings used: <strong>{usedListings}</strong> / {plan.max_listings >= 999 ? "unlimited" : plan.max_listings}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:w-48">
              <a
                href="https://www.paypal.com/myaccount/autopay/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Manage on PayPal
              </a>
              {!subscription.cancel_at_period_end && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={canceling}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                >
                  {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300">You don't have an active plan.</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choose a plan below to publish your products.</p>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {hasPaidPlan ? "Change plan" : "Choose a plan"}
        </h2>
        <IntervalToggle value={interval} onChange={setBillingInterval} maxSavings={maxSavings} />
      </div>

      <VendorPlanCards
        plans={plans}
        interval={interval}
        currentPlanId={hasPaidPlan && !subscription?.cancel_at_period_end ? subscription?.plan_id : null}
        currentInterval={subscription?.billing_interval}
        busySlug={busySlug}
        ctaLabel={(_, isCurrent) => (isCurrent ? "Current plan" : hasPaidPlan ? "Switch to this plan" : "Subscribe with PayPal")}
        onSelect={handleSelect}
      />

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
        Billed through PayPal. You can pay with a PayPal account or a debit/credit card. Cancel anytime.
      </p>
    </div>
  );
}
