import { BarChart3, Link2, Loader2, MessageSquare, Shield, Store, Zap } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useVendor } from "../hooks/useVendor";
import { vendorDb } from "../lib/supabase";
import { startVendorSubscription } from "../lib/vendorBilling";
import { IntervalToggle, VendorPlanCards } from "../components/vendor/VendorPlanCards";
import { useVendorPlans, yearlySavings } from "../hooks/useVendorPlans";
import type { BillingInterval, VendorPlan } from "../types/vendor";

const BENEFITS = [
  { icon: Store, title: "Your own storefront", description: "A public vendor page that showcases your brand and all your products." },
  { icon: Link2, title: "Keep 100% of sales", description: "Buyers purchase through your own checkout link. We never take a commission." },
  { icon: Zap, title: "Easy listing", description: "Create and manage listings from a simple dashboard." },
  { icon: BarChart3, title: "Analytics", description: "Track views and outbound clicks on every product." },
  { icon: MessageSquare, title: "Lead capture", description: "Collect inquiries from interested buyers (Pro and above)." },
  { icon: Shield, title: "Curated marketplace", description: "Every listing is reviewed, so buyers trust what they find here." },
];

const STEPS = [
  "Create your store — your 14-day free trial starts instantly, no credit card",
  "Add up to 3 products — each one is reviewed before it goes live",
  "Subscribe monthly or yearly to keep listing and unlock more products",
];

function toSlug(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export default function BecomeVendorPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { vendor, subscription, listingActive, loading: vendorLoading, refresh } = useVendor();
  const hasPaidPlan = listingActive && subscription?.gateway !== "trial";
  const { plans, loading: plansLoading } = useVendorPlans();

  const [interval, setBillingInterval] = useState<BillingInterval>("month");
  const [selected, setSelected] = useState<{ slug: string; interval: BillingInterval } | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ brand_name: "", slug: "", website: "", contact_email: "", bio: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const loginUrl = `/login?redirect=${encodeURIComponent("/become-vendor#start")}`;

  const goToPayPal = async (slug: string, billing: BillingInterval) => {
    setBusySlug(slug);
    setError(null);
    try {
      await startVendorSubscription(slug, billing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusySlug(null);
    }
  };

  const handleSelectPlan = (p: VendorPlan) => {
    if (!user) {
      navigate(loginUrl);
      return;
    }
    if (vendor) {
      // Đã có gói trả phí thì đổi gói ở dashboard (có xác nhận)
      if (hasPaidPlan) navigate("/vendor/subscription");
      else goToPayPal(p.slug, interval);
      return;
    }
    setSelected({ slug: p.slug, interval });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateVendor = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    setError(null);

    const { error: insertError } = await vendorDb.from("vendors").insert({
      user_id: user.id,
      brand_name: form.brand_name.trim(),
      slug: form.slug || toSlug(form.brand_name),
      website: form.website.trim() || null,
      contact_email: form.contact_email.trim() || user.email || null,
      support_email: form.contact_email.trim() || user.email || null,
      bio: form.bio.trim() || null,
    });

    if (insertError) {
      setCreating(false);
      setError(insertError.code === "23505" ? "That store URL is already taken. Please choose another." : insertError.message);
      return;
    }

    await refresh();
    if (selected) {
      await goToPayPal(selected.slug, selected.interval);
      setCreating(false);
    } else {
      // Trial 14 ngày được database tự kích hoạt khi tạo store
      navigate("/vendor");
    }
  };

  const maxSavings = Math.max(0, ...plans.map(yearlySavings));
  const ready = !authLoading && !vendorLoading;
  const inputClass =
    "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Sell on AIThubs - List Your Digital Products</title>
        <meta
          name="description"
          content="List your AI tools, courses, ebooks and templates on the AIThubs marketplace. Simple monthly or yearly plans, no commission on sales."
        />
      </Helmet>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Sell your digital products on <span className="text-primary-600 dark:text-primary-400">AIThubs</span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Showcase your AI tools, courses, ebooks and templates to a global audience. One flat subscription,
          zero commission — buyers check out on your own site.
          <span className="block mt-3 font-medium text-gray-900 dark:text-white">
            Start with a 14-day free trial. No credit card required.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {ready && vendor ? (
            <Link to="/vendor" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Go to vendor dashboard
            </Link>
          ) : (
            <a href={user ? "#start" : loginUrl} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Start free trial
            </a>
          )}
          <Link to="/marketplace" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Browse the marketplace
          </Link>
        </div>
        <ol className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-primary-600 text-white text-sm font-semibold">{i + 1}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">Why sell on AIThubs?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <Icon className="w-9 h-9 text-primary-600 dark:text-primary-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Simple, flat pricing</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try free for 14 days with up to 3 products, then pick a plan. No commission. Cancel anytime.
          </p>
          <IntervalToggle value={interval} onChange={setBillingInterval} maxSavings={maxSavings} />
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400 text-center" role="alert">
            {error}
          </div>
        )}

        {plansLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <VendorPlanCards
            plans={plans}
            interval={interval}
            busySlug={busySlug}
            ctaLabel={(p) =>
              selected?.slug === p.slug && selected.interval === interval
                ? "Selected — complete your profile below"
                : hasPaidPlan
                  ? "Manage subscription"
                  : `Choose ${p.name}`
            }
            onSelect={handleSelectPlan}
          />
        )}
      </section>

      {/* Onboarding */}
      <section id="start" ref={formRef} className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        {!ready ? null : !user ? (
          <div className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create your vendor account</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Sign in or create a free account to set up your store.</p>
            <Link to={loginUrl} className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium">
              Sign in to continue
            </Link>
          </div>
        ) : vendor ? null : (
          <form onSubmit={handleCreateVendor} className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Set up your store</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selected
                  ? `Next you'll be taken to PayPal to start the ${plans.find((p) => p.slug === selected.slug)?.name ?? ""} plan.`
                  : "Your 14-day free trial starts right away — list up to 3 products, no credit card needed."}
              </p>
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand / store name *</span>
              <input
                className={inputClass}
                required
                maxLength={80}
                value={form.brand_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand_name: e.target.value, slug: slugTouched ? f.slug : toSlug(e.target.value) }))
                }
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store URL *</span>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="shrink-0">aithubs.com/vendors/</span>
                <input
                  className={inputClass}
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  title="Lowercase letters, numbers and hyphens"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: toSlug(e.target.value) }));
                  }}
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</span>
              <input className={inputClass} type="url" placeholder="https://" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact email</span>
              <input
                className={inputClass}
                type="email"
                placeholder={user.email ?? ""}
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short bio</span>
              <textarea className={inputClass} rows={3} maxLength={500} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </label>
            <button
              type="submit"
              disabled={creating || !form.brand_name.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              {selected ? "Create store & continue to PayPal" : "Create store & start free trial"}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By creating a store you agree to list only products you own the rights to. Listings are reviewed before publishing.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
