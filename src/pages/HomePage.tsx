import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Bot,
  Building2,
  Code2,
  Image as ImageIcon,
  Mail,
  Megaphone,
  MessageSquareText,
  Palette,
  PenTool,
  PersonStanding,
  Search,
  Server,
  ShoppingBag,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import "../../css/style.css";
import NewsletterForm from "../components/NewsletterForm";
import {
  FUNCTIONS_DESCRIPTIONS,
  categories_DESCRIPTIONS,
} from "../data/categoryTemplates";
import { tools } from "../data/tools";
import { toSlug } from "../utils/slug";

// --------- Helpers (kept aligned with ToolsPage) ---------
const s = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);
const arr = <T,>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];
const norm = (v: unknown) => s(v).trim().toLowerCase();

// Fallback map → derive categories & function from tags when dataset chưa có field riêng
const TAG_MAPPING = {
  categories: new Map<string, string>([
    ["ecommerce", "Ecommerce"],
    ["finance", "Finance"],
    ["marketing", "Marketing"],
    ["education", "Education"],
    ["health", "Health"],
    ["design", "Design"],
    ["productivity", "Productivity"],
  ]),
  function: new Map<string, string>([
    ["copywriting", "Copywriting"],
    ["image", "Image Generation"],
    ["audio", "Audio Tools"],
    ["video", "Video Tools"],
    ["code", "Code Assistant"],
    ["chat", "Chatbot"],
    ["seo", "SEO"],
    ["automation", "Automation"],
    ["analytics", "Analytics"],
  ]),
};

function deriveIndustries(t: any): string[] {
  const fromField = arr(t.categories).map(s).filter(Boolean);
  if (fromField.length) return fromField;
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach((tag) => {
    TAG_MAPPING.categories.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

function deriveFunctions(t: any): string[] {
  const fromField = arr(t.functions).map(s).filter(Boolean);
  if (fromField.length) return fromField;
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach((tag) => {
    TAG_MAPPING.function.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

// --------- Visual system (keep colors & icons consistent) ---------
const GRADIENT_COLOR = {
  primary: "from-primary-600 to-secondary-600",
  indigo: "from-indigo-500 to-blue-600",
  green: "from-green-500 to-emerald-600",
  purple: "from-purple-500 to-pink-600",
  pink: "from-pink-500 to-rose-600",
  orange: "from-orange-500 to-red-600",
  yellow: "from-yellow-500 to-amber-600",
  slate: "from-gray-500 to-slate-600",
} as const;

// Icons for Industries
const categories_ICON: Record<string, React.ComponentType<any>> = {
  "E-commerce": ShoppingBag,
  "Finance & Fintech": BadgeDollarSign,
  "Marketing & Advertising": Megaphone,
  "Education / EdTech": Building2,
  "Healthcare & MedTech": HeartIconFallback, // custom fallback wrapper below
  "Creative & Design": Palette,
  "Productivity & Workflow": Zap,
  "HR / Recruiting": PersonStanding,
  "Software / DevTools": Server,
};

// Icons for Functions
const FUNCTION_ICON: Record<string, React.ComponentType<any>> = {
  "AI Text Generation": MessageSquareText,
  "AI Image / Voice / Video Generation": ImageIcon,
  "Chatbot / Agent": Bot,
  "Automation / Workflow": Zap,
  "Design / Creative Tools": Code2,
  "SEO & Ads Optimization": Search,
  "Lead Gen / CRM / Sales Funnel": Mail,
  "Analytics & Reporting": BarChart3,
  "Content Management": PenTool,
};

// Some datasets might not have Health icon → simple heart using SVG path via Lucide wrapper
function HeartIconFallback(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      {...props}
    >
      <path d="M12 21s-6.716-4.393-9.428-7.105A5.998 5.998 0 1 1 12 5.07a5.998 5.998 0 1 1 9.428 8.825C18.716 16.607 12 21 12 21z" />
    </svg>
  );
}

// Gradient chooser (try to keep stable color feel)
const pickGrad = (label: string, kind: "categories" | "function") => {
  const key = label.toLowerCase();
  if (kind === "categories") {
    if (key.includes("design")) return GRADIENT_COLOR.pink;
    if (key.includes("marketing")) return GRADIENT_COLOR.green;
    if (key.includes("finance")) return GRADIENT_COLOR.orange;
    if (key.includes("education")) return GRADIENT_COLOR.indigo;
    if (key.includes("health")) return GRADIENT_COLOR.yellow;
    if (key.includes("productivity")) return GRADIENT_COLOR.slate;
    return GRADIENT_COLOR.indigo;
  }
  // function
  if (key.includes("image")) return GRADIENT_COLOR.purple;
  if (key.includes("audio")) return GRADIENT_COLOR.yellow;
  if (key.includes("video")) return GRADIENT_COLOR.orange;
  if (key.includes("code")) return GRADIENT_COLOR.indigo;
  if (key.includes("chat")) return GRADIENT_COLOR.green;
  if (key.includes("seo")) return GRADIENT_COLOR.pink;
  if (key.includes("automation")) return GRADIENT_COLOR.slate;
  if (key.includes("analytics")) return GRADIENT_COLOR.primary;
  if (key.includes("copy")) return GRADIENT_COLOR.green;
  return GRADIENT_COLOR.indigo;
};

// Resolve label to description keys used in categoryTemplates
function resolvecategoriesKey(label: string) {
  const k = label.toLowerCase();
  if (k.includes("ecom")) return "e-commerce";
  if (k.includes("market")) return "marketing";
  // handle medtech/health before generic 'edtech' to avoid accidental substring matches
  if (k.includes("medtech") || k.includes("med") || k.includes("health"))
    return "healthcare";
  if (k.includes("education") || k.includes("edtech")) return "education";
  if (k.includes("finance") || k.includes("fintech")) return "finance";
  if (k.includes("hr")) return "hr";
  if (k.includes("design") || k.includes("creative")) return "creative";
  if (k.includes("software") || k.includes("dev")) return "software";
  if (k.includes("product")) return "productivity";
  return k.replace(/\s+/g, "-");
}

function getcategoriesDescription(label: string) {
  const key = resolvecategoriesKey(label);
  return (
    categories_DESCRIPTIONS[key] ||
    `Discover the best ${label} tools, vetted by our community.`
  );
}

function resolveFunctionKey(label: string) {
  const k = label.toLowerCase();
  if (k.includes("text")) return "ai-text";
  if (k.includes("image") || k.includes("video") || k.includes("voice"))
    return "ai-image-video";
  if (k.includes("chat")) return "chatbot";
  if (k.includes("automation") || k.includes("workflow")) return "automation";
  if (k.includes("design") || k.includes("creative")) return "design";
  if (k.includes("seo") || k.includes("ads")) return "seo-ads";
  if (k.includes("lead") || k.includes("crm")) return "lead-gen";
  if (k.includes("analytic")) return "analytics";
  if (k.includes("content")) return "content-management";
  return k.replace(/\s+/g, "-");
}

function getFunctionDescription(label: string) {
  const key = resolveFunctionKey(label);
  return (
    FUNCTIONS_DESCRIPTIONS[key] || `The top tools for ${label.toLowerCase()}.`
  );
}

const HomePage: React.FC = () => {
  // Trending block kept from original but neutral to categories
  const trendingTools = React.useMemo(
    () =>
      tools
        .filter((t) => (t as any).featured)
        .slice()
        .sort(
          (a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
        )
        .slice(0, 3),
    [],
  );
  const marqueeCSS = `
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;

  // Build facets from dataset using same derivation as ToolsPage
  const { industries, functions } = React.useMemo(() => {
    const ind = new Map<string, number>();
    const fn = new Map<string, number>();
    tools.forEach((t) => {
      deriveIndustries(t).forEach((i) => ind.set(i, (ind.get(i) ?? 0) + 1));
      deriveFunctions(t).forEach((f) => fn.set(f, (fn.get(f) ?? 0) + 1));
    });
    const industries = Array.from(ind.entries()).sort((a, b) => b[1] - a[1]);
    const functions = Array.from(fn.entries()).sort((a, b) => b[1] - a[1]);
    return { industries, functions };
  }, []);

  // build a RadialDistribution for Funcsion
  const functionDist = React.useMemo(() => {
    const counts = new Map<string, number>();
    tools.forEach((t) => {
      // dùng đúng hàm deriveFunctions(t) mà trang bạn đang có
      const fs = deriveFunctions(t);
      (fs.length ? fs : ["Other"]).forEach((f) =>
        counts.set(f, (counts.get(f) ?? 0) + 1),
      );
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9); // top 6
    return sorted.map(([label, count]) => ({ label, value: count }));
  }, []);

  const stats = [
    { number: `1000+`, label: "Digital Tools" },
    { number: "50K+", label: "Happy Users" },
    { number: "98%", label: "Success Rate" },
    { number: "$2M+", label: "Saved by Users" },
  ];

  // Brand logos (use local files in public/brands)

  const brands = [
    {
      name: "OpenAI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    },
    {
      name: "Gemini",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    },
    {
      name: "Deepseek",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/DeepSeek_logo.svg",
    },
    {
      name: "Shopify",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg",
    },
    {
      name: "Notion",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    },
    {
      name: "Grok",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Grok-feb-2025-logo.svg",
    },
    {
      name: "Looka",
      logo: "https://looka.com/wp-content/themes/looka/images/logos/looka_logo_black.svg",
    },
    {
      name: "lovable",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Logowhite_lovable.svg",
    },
    {
      name: "Make",
      logo: "https://strapi-affiliate.s3.us-east-1.amazonaws.com/strapi/AP_Make_115b636570.png",
    },
    {
      name: "Evato",
      logo: "https://assets.elements.envato.com/apps/storefront/EnvatoLogoLight-b794a434513b3b975d91.svg",
    },
  ];
  const navigate = useNavigate();
  const handleSliceClick = (info: {
    label: string;
    value: number;
    index: number;
  }) => {
    // nếu biểu đồ là theo Functions:
    navigate(`/tools?function=${encodeURIComponent(info.label)}`);
    // nếu biểu đồ theo categories thì đổi query param tương ứng:
    // navigate(`/tools?categories=${encodeURIComponent(info.label)}`);
  };

  return (
    <div className="pt-16">
      <style>{marqueeCSS}</style>
      {/* Meta */}
      <Helmet>
        <title>DigitalToolsHub — Explore by categories & Functions</title>
        <meta
          name="description"
          content="Find the best digital tools filtered by categories and functions. Compare pricing, features, and ratings to pick the best tool for your use case."
        />
        <link rel="canonical" href="https://aithubs.com/" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>1000+ Digital Tools Available</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Discover the Best
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {" "}
                  Digital Tools
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Browse by categories and functions to find exactly what fits
                your workflow. Consistent filters with our Tools page, same
                icons and colors, just faster discovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/tools"
                  className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Explore All Tools
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/blog"
                  className="group border-2 border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  Read Guides
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Verified Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Expert Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Regular Updates</span>
                </div>
              </div>
            </div>

            {/* Trending tools */}
            <div className="animate-slide-in-right">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Trending Tools
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {trendingTools.map((tool: any, index: number) => {
                    const price = s(tool.price);
                    const priceLabel = /^free\b/i.test(price)
                      ? "Free"
                      : (price
                          .match(/\$\s*\d+(?:\.\d{2})?/)?.[0]
                          ?.replace(/\s+/g, "") ??
                        (price || "—"));

                    const fn = deriveFunctions(tool)[0] || "Automation";
                    const Icon = FUNCTION_ICON[fn] || Bot;
                    const grad = pickGrad(fn, "function");

                    return (
                      <Link
                        key={tool.id}
                        to={`/tools/${toSlug(tool.name)}`}
                        className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div
                              className={`w-12 h-12 bg-gradient-to-r ${grad} rounded-xl flex items-center justify-center shadow-sm`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {tool.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <span>{fn || "Function"}</span>
                              <span className="text-gray-300">·</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{tool.rating || "—"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            {priceLabel}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/tools"
                  className="mt-6 block text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View all trending tools →
                </Link>
              </div>
            </div>
          </div>
          {/* Brand logos row */}
          {/* Brand logos marquee (mobile-friendly) */}

          <div className="mt-10 relative overflow-hidden">
            {/* mask 2 bên: ẩn ở xs để không che logo */}
            <div className="hidden sm:block pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-gray-900 to-transparent opacity-60 dark:from-black" />
            <div className="hidden sm:block pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-gray-900 to-transparent opacity-60 dark:from-black" />

            <div className="py-2">
              {/* track chạy vô hạn: nhân đôi mảng để loop mượt */}
              <div
                className="flex items-center gap-4 sm:gap-6 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
                style={{ animation: "marquee 20s linear infinite" }}
              >
                {[...brands, ...brands].map((b, i) => (
                  <Link
                    key={`${b.name}-${i}`}
                    to={"/tools"}
                    className="shrink-0 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-md
                     bg-pink-400/80 dark:bg-pink-400/80 flex items-center justify-center"
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="shrink-0 h-6 sm:h-8 w-auto"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary-200 dark:bg-primary-900 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stat.number}
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore tools curated for your industry. Click any card to jump
              into a pre‑filtered list.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map(([label, count]) => {
              const Icon = categories_ICON[label] || Server;
              const grad = pickGrad(label, "categories");
              return (
                <Link
                  key={label}
                  to={`/tools?categories=${encodeURIComponent(label)}`}
                  className="group bg-white dark:bg-gray-900/60 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${grad} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                    {getcategoriesDescription(label)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      {count} tools
                    </span>
                    <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* Functions Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Functions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Zero in on what you need the tool to do: write, design, automate,
              analyze, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {functions.map(([label, count]) => {
              const Icon = FUNCTION_ICON[label] || Bot;
              const grad = pickGrad(label, "function");
              return (
                <Link
                  key={label}
                  to={`/tools?function=${encodeURIComponent(label)}`}
                  className="group bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${grad} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                    {getFunctionDescription(label)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      {count} tools
                    </span>
                    <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how our community is achieving amazing results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Marketer",
                image:
                  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                quote:
                  "DigitalToolsHub helped me discover AI tools that increased my productivity by 300%. The reviews are honest and detailed.",
                rating: 5,
                earnings: "$15K+ saved on tools",
              },
              {
                name: "Mike Chen",
                role: "Online Entrepreneur",
                image:
                  "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                quote:
                  "Found the perfect marketing automation stack through this platform. My conversion rates doubled in 3 months.",
                rating: 5,
                earnings: "$50K+ revenue increase",
              },
              {
                name: "Emily Rodriguez",
                role: "Content Creator",
                image:
                  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
                quote:
                  "The MMO tools section is a goldmine. I built my entire online business using recommendations from here.",
                rating: 5,
                earnings: "$25K+ monthly income",
              },
            ].map((t, index) => (
              <div
                key={index}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700"
              >
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img
                      loading="lazy"
                      src={t.image}
                      alt={`${t.name} avatar`}
                      className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-white dark:ring-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {t.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t.role}
                    </div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t.earnings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay Ahead of the Curve
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get weekly updates on the latest digital tools, exclusive deals,
              and expert insights delivered straight to your inbox.
            </p>
            <NewsletterForm />
            <p className="text-sm text-white/70 mt-4">
              Join 50,000+ professionals. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
