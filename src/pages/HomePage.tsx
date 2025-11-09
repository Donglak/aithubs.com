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
  Zap
} from 'lucide-react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/style.css';
import NewsletterForm from '../components/NewsletterForm';
import RadialDistribution from '../components/RadialDistribution';
import { FUNCTIONS_DESCRIPTIONS, INDUSTRY_DESCRIPTIONS } from '../data/categoryTemplates';
import { tools } from '../data/tools';


// --------- Helpers (kept aligned with ToolsPage) ---------
const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const arr = <T,>(v: T | T[] | undefined | null): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
const norm = (v: unknown) => s(v).trim().toLowerCase();

// Fallback map → derive industry & function from tags when dataset chưa có field riêng
const TAG_MAPPING = {
  industry: new Map<string, string>([
    ['ecommerce', 'Ecommerce'],
    ['finance', 'Finance'],
    ['marketing', 'Marketing'],
    ['education', 'Education'],
    ['health', 'Health'],
    ['design', 'Design'],
    ['productivity', 'Productivity'],
  ]),
  function: new Map<string, string>([
    ['copywriting', 'Copywriting'],
    ['image', 'Image Generation'],
    ['audio', 'Audio Tools'],
    ['video', 'Video Tools'],
    ['code', 'Code Assistant'],
    ['chat', 'Chatbot'],
    ['seo', 'SEO'],
    ['automation', 'Automation'],
    ['analytics', 'Analytics'],
  ]),
};

function deriveIndustries(t: any): string[] {
  const fromField = arr(t.industry).map(s).filter(Boolean);
  if (fromField.length) return fromField;
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach(tag => {
    TAG_MAPPING.industry.forEach((label, key) => {
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
  tags.forEach(tag => {
    TAG_MAPPING.function.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

// --------- Visual system (keep colors & icons consistent) ---------
const GRADIENT_COLOR = {
  primary: 'from-primary-600 to-secondary-600',
  indigo: 'from-indigo-500 to-blue-600',
  green: 'from-green-500 to-emerald-600',
  purple: 'from-purple-500 to-pink-600',
  pink: 'from-pink-500 to-rose-600',
  orange: 'from-orange-500 to-red-600',
  yellow: 'from-yellow-500 to-amber-600',
  slate: 'from-gray-500 to-slate-600',
} as const;

// Icons for Industries
const INDUSTRY_ICON: Record<string, React.ComponentType<any>> = {
  'E-commerce': ShoppingBag,
  'Finance & Fintech': BadgeDollarSign,
  'Marketing & Advertising': Megaphone,
  'Education / EdTech': Building2,
  'Healthcare & MedTech': HeartIconFallback, // custom fallback wrapper below
  'Creative & Design': Palette,
  'Productivity & Workflow': Zap,
  'HR / Recruiting' : PersonStanding,
  'Software / DevTools': Server
};

// Icons for Functions
const FUNCTION_ICON: Record<string, React.ComponentType<any>> = {
  'AI Text Generation': MessageSquareText,
  'AI Image / Voice / Video Generation': ImageIcon,
  'Chatbot / Agent': Bot,
  'Automation / Workflow': Zap,
  'Design / Creative Tools': Code2,
  'SEO & Ads Optimization': Search,
  'Lead Gen / CRM / Sales Funnel': Mail,
  'Analytics & Reporting': BarChart3,
  'Content Management' : PenTool
};

// Some datasets might not have Health icon → simple heart using SVG path via Lucide wrapper
function HeartIconFallback(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M12 21s-6.716-4.393-9.428-7.105A5.998 5.998 0 1 1 12 5.07a5.998 5.998 0 1 1 9.428 8.825C18.716 16.607 12 21 12 21z" />
    </svg>
  );
}

// Gradient chooser (try to keep stable color feel)
const pickGrad = (label: string, kind: 'industry' | 'function') => {
  const key = label.toLowerCase();
  if (kind === 'industry') {
    if (key.includes('design')) return GRADIENT_COLOR.pink;
    if (key.includes('marketing')) return GRADIENT_COLOR.green;
    if (key.includes('finance')) return GRADIENT_COLOR.orange;
    if (key.includes('education')) return GRADIENT_COLOR.indigo;
    if (key.includes('health')) return GRADIENT_COLOR.yellow;
    if (key.includes('productivity')) return GRADIENT_COLOR.slate;
    return GRADIENT_COLOR.indigo;
  }
  // function
  if (key.includes('image')) return GRADIENT_COLOR.purple;
  if (key.includes('audio')) return GRADIENT_COLOR.yellow;
  if (key.includes('video')) return GRADIENT_COLOR.orange;
  if (key.includes('code')) return GRADIENT_COLOR.indigo;
  if (key.includes('chat')) return GRADIENT_COLOR.green;
  if (key.includes('seo')) return GRADIENT_COLOR.pink;
  if (key.includes('automation')) return GRADIENT_COLOR.slate;
  if (key.includes('analytics')) return GRADIENT_COLOR.primary;
  if (key.includes('copy')) return GRADIENT_COLOR.green;
  return GRADIENT_COLOR.indigo;
};

// Resolve label to description keys used in categoryTemplates
function resolveIndustryKey(label: string) {
  const k = label.toLowerCase();
  if (k.includes('ecom')) return 'e-commerce';
  if (k.includes('market')) return 'marketing';
  // handle medtech/health before generic 'edtech' to avoid accidental substring matches
  if (k.includes('medtech') || k.includes('med') || k.includes('health')) return 'healthcare';
  if (k.includes('education') || k.includes('edtech')) return 'education';
  if (k.includes('finance') || k.includes('fintech')) return 'finance';
  if (k.includes('hr')) return 'hr';
  if (k.includes('design') || k.includes('creative')) return 'creative';
  if (k.includes('software') || k.includes('dev')) return 'software';
  if (k.includes('product')) return 'productivity';
  return k.replace(/\s+/g, '-');
}

function getIndustryDescription(label: string) {
  const key = resolveIndustryKey(label);
  return INDUSTRY_DESCRIPTIONS[key] || `Discover the best ${label} tools, vetted by our community.`;
}

function resolveFunctionKey(label: string) {
  const k = label.toLowerCase();
  if (k.includes('text')) return 'ai-text';
  if (k.includes('image') || k.includes('video') || k.includes('voice')) return 'ai-image-video';
  if (k.includes('chat')) return 'chatbot';
  if (k.includes('automation') || k.includes('workflow')) return 'automation';
  if (k.includes('design') || k.includes('creative')) return 'design';
  if (k.includes('seo') || k.includes('ads')) return 'seo-ads';
  if (k.includes('lead') || k.includes('crm')) return 'lead-gen';
  if (k.includes('analytic')) return 'analytics';
  if (k.includes('content')) return 'content-management';
  return k.replace(/\s+/g, '-');
}

function getFunctionDescription(label: string) {
  const key = resolveFunctionKey(label);
  return FUNCTIONS_DESCRIPTIONS[key] || `The top tools for ${label.toLowerCase()}.`;
}

const HomePage: React.FC = () => {
  

  
  // Trending block kept from original but neutral to categories
  const trendingTools = React.useMemo(
    () =>
      tools
        .filter(t => (t as any).featured)
        .slice()
        .sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 3),
    []
  );
  const marqueeCSS = `
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;

  // Build facets from dataset using same derivation as ToolsPage
  const { industries, functions } = React.useMemo(() => {
    const ind = new Map<string, number>();
    const fn = new Map<string, number>();
    tools.forEach(t => {
      deriveIndustries(t).forEach(i => ind.set(i, (ind.get(i) ?? 0) + 1));
      deriveFunctions(t).forEach(f => fn.set(f, (fn.get(f) ?? 0) + 1));
    });
    const industries = Array.from(ind.entries()).sort((a, b) => b[1] - a[1]);
    const functions = Array.from(fn.entries()).sort((a, b) => b[1] - a[1]);
    return { industries, functions };
  }, []);

  // build a RadialDistribution for Funcsion 
  const functionDist = React.useMemo(() => {
  const counts = new Map<string, number>();
  tools.forEach(t => {
    // dùng đúng hàm deriveFunctions(t) mà trang bạn đang có
    const fs = deriveFunctions(t);
    (fs.length ? fs : ['Other']).forEach(f => counts.set(f, (counts.get(f) ?? 0) + 1));
  });
  const sorted = Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).slice(0,9); // top 6
  return sorted.map(([label, count]) => ({ label, value: count }));
}, []);

  const stats = [
    { number: `${tools.length}+`, label: 'Digital Tools' },
    { number: '50K+', label: 'Happy Users' },
    { number: '98%', label: 'Success Rate' },
    { number: '$2M+', label: 'Saved by Users' },
  ];
  
  // Brand logos (use local files in public/brands)
  
  const brands = [
    { name: 'OpenAI', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg' },
    {name: 'Gemini', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg' },
    {name: 'Deepseek', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/DeepSeek_logo.svg' },
    { name: 'Shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg' },
    { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg' },
    { name: 'Grok', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Grok-feb-2025-logo.svg' },
    { name: 'Looka', logo: 'https://looka.com/wp-content/themes/looka/images/logos/looka_logo_black.svg' },
    {name: 'lovable', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Logowhite_lovable.svg' },
    {name: 'Make', logo: 'https://strapi-affiliate.s3.us-east-1.amazonaws.com/strapi/AP_Make_115b636570.png' },
    { name: 'Evato', logo: 'https://assets.elements.envato.com/apps/storefront/EnvatoLogoLight-b794a434513b3b975d91.svg'},

  ];
  const navigate = useNavigate();
  const handleSliceClick = (info: { label: string; value: number; index: number }) => {
  // nếu biểu đồ là theo Functions:
  navigate(`/tools?function=${encodeURIComponent(info.label)}`);
  // nếu biểu đồ theo Industry thì đổi query param tương ứng:
  // navigate(`/tools?industry=${encodeURIComponent(info.label)}`);
};


  return (
    <div className="pt-16">
      <style>{marqueeCSS}</style>
      {/* Meta */}
      <Helmet>
        <title>DigitalToolsHub — Explore by Industry & Functions</title>
        <meta
          name="description"
          content="Find the best digital tools filtered by industry and functions. Compare pricing, features, and ratings to pick the best tool for your use case."
        />
        <link rel="canonical" href="https://aithubs.com/" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Discover the Best
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Digital Tools</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Browse by industry and functions to find exactly what fits your workflow. Consistent filters with our Tools page, same icons and colors, just faster discovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/tools"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Explore All Tools
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/blog"
                  className="border-2 border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  Read Guides
                </Link>
              </div>
            </div>

            {/* Trending tools */}
            <div className="animate-slide-in-right">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-large">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trending Tools</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
               
                    <div className="card card--hover p-6 block space-y-4">
                      {trendingTools.map((tool: any) => {
                        const price = s(tool.price);
                        const priceLabel =
                        /^free\b/i.test(price)
                        ? 'Free'
                        : price.match(/\$\s*\d+(?:\.\d{2})?/)?.[0]?.replace(/\s+/g, '') ?? (price || '—');

                        // pick one function to color the badge
                        const fn = deriveFunctions(tool)[0] || 'Automation';
                        const Icon = FUNCTION_ICON[fn] || Bot;
                        const grad = pickGrad(fn, 'function');

                        return (
                          <Link
                            key={tool.id}
                            to={`/tools/${tool.id}`}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-r ${grad} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-blue" />
                              </div>
                              <div>
                                <div className="font-medium text-green-900 dark:text-white">{tool.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {(fn || 'Function')}
                                </div>
                              </div>
                            </div>
                            <div className="text-green-600 dark:text-green-400 font-semibold">{priceLabel}</div>
                          </Link>
                        );
                      })}
                    </div>
                
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
    <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
    style={{ animation: 'marquee 20s linear infinite' }} > 
      {[...brands, ...brands].map((b, i) => (
        <Link 
        
          key={`${b.name}-${i}`}
          to ={'/tools'}
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

      {/* Stats Section (unchanged visuals) */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-transparent">Browse by Industry</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore tools curated for your industry. Click any card to jump into a pre‑filtered list.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map(([label, count]) => {
              const Icon = INDUSTRY_ICON[label] || Server;
              const grad = pickGrad(label, 'industry');
              return (
                <Link
                  key={label}
                  to={`/tools?industry=${encodeURIComponent(label)}`}
                  className="glow-mobile glow-rotate card card--hover p-6 block group rounded-xl bg-white dark:bg-gray-900/60 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${grad} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-300 mb-2">{label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {getIndustryDescription(label)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{count} tools</span>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Browse by Functions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Zero in on what you need the tool to do: write, design, automate, analyze, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {functions.map(([label, count]) => {
              const Icon = FUNCTION_ICON[label] || Bot;
              const grad = pickGrad(label, 'function');
              return (
                <Link
                  key={label}
                  to={`/tools?function=${encodeURIComponent(label)}`}
                  className="glow-mobile glow-rotate card card--hover p-6 block group rounded-xl bg-gray-50 dark:bg-gray-800 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${grad} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-300 mb-2">{label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {getFunctionDescription(label)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{count} tools</span>
                    <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/*section in the RadialDitribution*/}
      <section className="py-16 bg-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
    <div>
      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Tool distribution</h2>
      <p className="text-gray-400 mb-6">
        Explore the right digital tools designed to power the functions you need
      </p>
      <ul className="space-y-2 text-gray-300 text-sm">
        {functionDist.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full"
                  style={{ background: ['#f43f5e','#f59e0b','#10b981','#22c55e','#3b82f6','#a855f7'][i%6] }} />
            <span className="font-medium">{d.label}</span>
            <span className="ml-auto text-gray-400">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="flex flex-col items-center">
  <RadialDistribution
    data={functionDist}
    size={330}                 // 280–340 phù hợp mobile, bạn có thể tinh chỉnh
    thickness={72}
    gapDeg={2}
    centerImageUrl="https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://media.easy-peasy.ai/27feb2bb-aeb4-4a83-9fb6-8f3f2a15885e/3fb516e4-bad7-4755-89c5-b6030d22888d.png"
    onSliceClick={handleSliceClick}
    showChips={false}           // NEW
    coachmarkOnce={true}       // NEW
  />

  {/* hướng dẫn: mobile và desktop khác nhau để dễ hiểu */}
  <p className="mt-4 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-sm sm:hidden">
    Tap slices or chips to filter
  </p>
  <p className="mt-4 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-300 font-semibold text-sm hidden sm:block">
    Hover or click slices to filter
  </p>
</div>
    
</div>
</section>
      

      {/* Testimonials (kept) */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">See how our community is achieving amazing results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[{
              name: 'Sarah Johnson',
              role: 'Digital Marketer',
              image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              quote: 'DigitalToolsHub helped me discover AI tools that increased my productivity by 300%. The reviews are honest and detailed.',
              rating: 5,
              earnings: '$15K+ saved on tools'
            }, {
              name: 'Mike Chen',
              role: 'Online Entrepreneur',
              image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              quote: 'Found the perfect marketing automation stack through this platform. My conversion rates doubled in 3 months.',
              rating: 5,
              earnings: '$50K+ revenue increase'
            }, {
              name: 'Emily Rodriguez',
              role: 'Content Creator',
              image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
              quote: 'The MMO tools section is a goldmine. I built my entire online business using recommendations from here.',
              rating: 5,
              earnings: '$25K+ monthly income'
            }].map((t, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img loading="lazy" src={t.image} alt={`${t.name} avatar`} className="w-12 h-12 rounded-full object-cover mr-4" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">{[...Array(t.rating)].map((_, i) => (<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />))}</div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">"{t.quote}"</blockquote>
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium">{t.earnings}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
            <Mail className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Stay Ahead of the Curve</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get weekly updates on the latest digital tools, exclusive deals, and expert insights delivered straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
