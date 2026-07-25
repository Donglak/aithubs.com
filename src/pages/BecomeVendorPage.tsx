import {
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Users,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with basic listing",
    features: ["1 product listing", "Basic visibility", "Community support"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$9.99",
    period: "/month",
    description: "For growing creators",
    features: [
      "5 product listings",
      "Basic analytics",
      "Email support",
      "Custom profile",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/month",
    description: "For serious sellers",
    features: [
      "25 product listings",
      "Advanced analytics",
      "Lead capture",
      "Priority support",
      "Featured options",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$99.99",
    period: "/month",
    description: "For large teams",
    features: [
      "Unlimited listings",
      "All analytics",
      "Team members",
      "Dedicated support",
      "Custom branding",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

const BENEFITS = [
  {
    icon: Zap,
    title: "Easy Listing",
    description:
      "Create and manage your product listings with our simple dashboard.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track views, clicks, and engagement on all your products.",
  },
  {
    icon: MessageSquare,
    title: "Lead Capture",
    description: "Collect inquiries from interested customers directly.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your products and data are protected with enterprise-grade security.",
  },
  {
    icon: Users,
    title: "Growing Audience",
    description: "Reach thousands of AI and tech enthusiasts on our platform.",
  },
];

export default function BecomeVendorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Become a Vendor - AIThub</title>
        <meta
          name="description"
          content="List your digital products on AIThub and reach thousands of AI and tech enthusiasts."
        />
      </Helmet>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Sell Your Digital Products on{" "}
          <span className="text-primary-600 dark:text-primary-400">AIThub</span>
        </h1>
        <p className="text-lg text-gray-900 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Join our marketplace and showcase your AI tools, courses, ebooks, and
          digital products to thousands of active users.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <a
            href="#plans"
            className="border border-gray-300 dark:border-gray-900 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View Plans
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Why Sell on AIThub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plans */}
      <section
        id="plans"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-900 dark:text-gray-400 text-center mb-10">
          Start free and upgrade as you grow
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 border transition-all ${
                plan.highlighted
                  ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500/50 ring-1 ring-primary-500"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {plan.period}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`block text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "border border-gray-300 dark:border-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
