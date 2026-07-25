import {
  ArrowLeft,
  Award,
  Check,
  ChevronRight,
  ExternalLink,
  Star,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import VideoReviews from "../components/VideoReviews";
import { tools } from "../data/tools";
import { buildToolDetailsAsync } from "../lib/buildToolDetails";
import { useTranslation } from "react-i18next";
import { toSlug } from "../utils/slug";

const ToolDetailPage = () => {
  const { t } = useTranslation("product");

  const tabs = [
    { key: "overview", label: t("tool.tabs.overview") },
    { key: "pricing", label: t("tool.tabs.pricing") },
    { key: "video", label: t("tool.tabs.video") },
  ] as const;

  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "pricing" | "video">(
    "overview",
  );

  const normalizedSlug = useMemo(() => toSlug(slug ?? ""), [slug]);

  const toolBase = useMemo(
    () => tools.find((item) => toSlug(item.name) === normalizedSlug),
    [normalizedSlug],
  );

  const [tool, setTool] = useState<any | null>(null);

  // load chi tiết tool
  useEffect(() => {
    if (!toolBase) return;
    void buildToolDetailsAsync(toolBase as any).then(setTool);
  }, [toolBase]);

  // nếu không tìm thấy tool từ slug
  if (!toolBase) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Helmet>
          <title>{t("tool.notFoundTitle")}</title>
        </Helmet>

        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("tool.backToTools")}</span>
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("tool.notFoundTitle")}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("tool.notFoundDescription")}
          </p>
        </div>
      </main>
    );
  }

  // loading chi tiết tool
  if (!tool) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Helmet>
          <title>{toolBase.name}</title>
        </Helmet>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading tool details...
          </p>
        </div>
      </main>
    );
  }

  const toolSlug = useMemo(() => toSlug(tool?.name || ""), [tool]);

  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return tools
      .filter((item) => item.id !== tool.id)
      .filter((item) => {
        if (Array.isArray(item.categories) && Array.isArray(tool.categories)) {
          return item.categories.some((cat) =>
            tool.categories.includes(cat),
          );
        }
        return item.categories === tool.categories;
      })
      .sort((a, b) => {
        const commonA =
          Array.isArray(tool.categories) && Array.isArray(a.categories)
            ? a.categories.filter((cat) =>
                tool.categories.includes(cat),
              ).length
            : 0;
        const commonB =
          Array.isArray(tool.categories) && Array.isArray(b.categories)
            ? b.categories.filter((cat) =>
                tool.categories.includes(cat),
              ).length
            : 0;
        return commonB - commonA;
      })
      .slice(0, 3);
  }, [tool]);

  const industries = Array.isArray(tool.categories)
    ? tool.categories
    : [tool.categories];

  const badgeTone = (name: string) => {
    const k = name.toLowerCase();
    if (k.includes("free"))
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (k.includes("hobby") || k.includes("starter"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    if (k.includes("creator") || k.includes("pro"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    if (k.includes("business") || k.includes("team"))
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    if (k.includes("enterprise"))
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Helmet>
        <title>
          {tool.seo?.title ?? `${tool.name} - ${industries.join(", ")}`}
        </title>
        <meta
          name="description"
          content={tool.seo?.description ?? tool.description}
        />
        <link
          rel="canonical"
          href={tool.seo?.canonical ?? `https://aithubs.com/tools/${toolSlug}`}
        />
        <meta property="og:title" content={`${tool.name} | DigitalToolsHub`} />
        <meta
          property="og:description"
          content={tool.seo?.description ?? tool.description}
        />
        <meta property="og:image" content={tool.image} />
        <meta name="robots" content="index, follow" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="text-gray-400">{tool.name}</div>
        </div>

        {/* Top card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
              <div className="flex items-start gap-4">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tool.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />{" "}
                      {(tool.rating ?? 0).toFixed(1)} ({tool.reviews} reviews)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />{" "}
                      {industries.join(" / ")}
                    </span>
                    {tool.company && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />{" "}
                        {tool.company}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Visit website <ExternalLink className="w-4 h-4" />
                  </a>
                  {tool.freeTrial && (
                    <div className="text-xs text-green-600 text-right">
                      Free trial available
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {tool.longDescription ?? tool.description}
              </p>

              {/* Tabs */}
              <div
                className="border-b border-gray-200 dark:border-gray-800"
                role="tablist"
                aria-label={t("tool.sectionsAriaLabel")}
              >
                <div className="-mb-px flex gap-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      role="tab"
                      id={`tab-${tab.key}`}
                      aria-selected={activeTab === tab.key}
                      aria-controls={`panel-${tab.key}`}
                      tabIndex={activeTab === tab.key ? 0 : -1}
                      onClick={() => setActiveTab(tab.key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveTab(tab.key);
                        }
                      }}
                      className={`pb-3 border-b-2 transition ${
                        activeTab === tab.key
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab panels */}
              {activeTab === "overview" && (
                <div
                  role="tabpanel"
                  id="panel-overview"
                  aria-labelledby="tab-overview"
                  className="mt-6 flex flex-col gap-6"
                  tabIndex={0}
                >
                  {/* Left column: Features + Usecases */}
                  <div className="flex flex-col gap-6">
                    {/* Features */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t("tool.keyFeatures")}
                      </h3>
                      <ul className="space-y-2">
                        {tool.features?.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Usecases moved up here */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t("tool.bestFor")}
                      </h3>
                      <ul className="space-y-1">
                        {tool.useCases?.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 text-green-600" />
                            <span className="text-gray-900 dark:text-gray-300 overflow-hidden text-ellipsis block">
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right column: Pros & Cons */}
                  <div className="mt-6 flex flex-col gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t("tool.pros")}
                      </h3>
                      <ul className="space-y-2">
                        {tool.pros?.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {p}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t("tool.cons")}
                      </h3>
                      <ul className="space-y-2">
                        {tool.cons?.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="w-4 h-4 mt-1 text-red-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {c}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div
                  role="tabpanel"
                  id="panel-pricing"
                  aria-labelledby="tab-pricing"
                  className="mt-6"
                  tabIndex={0}
                >
                  {tool.pricingTiers && tool.pricingTiers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tool.pricingTiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                        >
                          {/* Header: account type badge + $ icon */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-6 py-2 rounded-full text-xs-200 font-semibold ${badgeTone(tier.name)}`}
                            >
                              {tier.name}
                            </span>
                          </div>

                          {/* Price + billing */}
                          <div className="mt-2 text-xl font-bold">
                            {tier.price}
                          </div>
                          {tier.billing && (
                            <div className="text-xs text-gray-500">
                              Billed {tier.billing}
                            </div>
                          )}

                          {/* Features */}
                          <ul className="mt-4 space-y-2">
                            {tier.features.map((f, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {f}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-900 dark:text-gray-300">
                      {t("tool.pricingdetailadd")}.
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3">
                    <p className="text-sm text-slate-200">
                      {t("tool.officialWebsitePrompt")}
                    </p>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5
                   rounded-full bg-indigo-500 text-sm font-semibold text-white
                   shadow-lg shadow-indigo-500/30
                   hover:bg-indigo-400 hover:shadow-indigo-400/40
                   focus:outline-none focus:ring-2 focus:ring-indigo-400
                   transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      {t("tool.viewFullPricing")}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === "video" && (
                <div
                  role="tabpanel"
                  id="panel-video"
                  aria-labelledby="tab-video"
                  className="mt-6"
                  tabIndex={0}
                >
                  <VideoReviews
                    name={tool.name}
                    items={tool.videoReviews} // <-- dữ liệu video
                    fallbackScreenshots={tool.screenshots} // fallback nếu chưa có video
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6">
              {/* Info card */}
              <aside className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 sticky top-6">
                <div className="space-y-4">
                  {/* CTA card */}
                  <div className="flex items-center justify-center">
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-full max-w-xs overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-100 border border-violet-500/60 dark:border-violet-500/60 p-4 flex flex-col items-center text-center gap-3"
                    >
                      <img
                        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTlqNXV3NDAxeWx3MnVyMGQ1b3V1OGg1bXE5bDk4MHd5cTJuZ2ZnYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MApP3BXb7LosQKoOvv/giphy.gif"
                        alt="Discover more on the official website"
                        className="w-54 h-54 mb-1 animate-bounce-slow object-contain"
                      />
                      <p className="text-sm text-slate-100 dark:text-slate-900 font-medium">
                        {t("tool.discoverymoreonweb")} 💙
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">
                        {t("tool.clickthe")}{" "}
                        <span className="text-indigo-300 dark:text-indigo-700 font-semibold">
                          {t("tool.visitWebsite")}
                        </span>{" "}
                        {t("tool.buttonbelow")}.
                      </p>
                    </a>
                  </div>

                  {/* Integrations */}
                  {tool.integrations && tool.integrations.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm text-pink-600 dark:text-pink-400 mb-2">
                        Integrations
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tool.integrations.map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Website button */}
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full animate-pulse items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Visit website <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </aside>

              {/* Related Tools — moved to right column */}
              {relatedTools.length > 0 && (
                <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Related Tools
                  </h3>
                  <div className="space-y-4">
                    {relatedTools.map((relatedTool) => (
                      <Link
                        key={relatedTool.name}
                        to={`/tools/${toSlug(relatedTool.name)}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src={relatedTool.image}
                          alt={relatedTool.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {relatedTool.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {relatedTool.price}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                            {relatedTool.rating}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ToolDetailPage;
