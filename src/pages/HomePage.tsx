import { ArrowRight, Bot, DollarSign, Mail, Palette, Server, Star, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import '../../css/style.css';
import NewsletterForm from '../components/NewsletterForm';
import { aiSubcategoryDescriptions } from '../data/aiSubcategoryDescriptions';
import { categoryDescriptions } from '../data/categoryDescriptions';
import { tools } from '../data/tools';

// Helpers
const norm = (v?: unknown) =>
  (typeof v === 'string' ? v : v == null ? '' : String(v))
    .trim()
    .toLowerCase()
    .replace(/\s+tools?$/, ''); // "AI Tools" -> "ai", "Marketing Tool" -> "marketing"

const toArr = <T,>(x: T | T[] | undefined): T[] => (Array.isArray(x) ? x : x != null ? [x] : []);

const toSlug = (s: string) => s.trim().toLowerCase().replace(/\s+tools?$/i, "");
const getCatDesc = (titleOrSlug: string) =>
categoryDescriptions[titleOrSlug] ?? categoryDescriptions[toSlug(titleOrSlug)] ?? "";

// Chuẩn hoá nhẹ để tránh lệch "AI X Tools" vs "AI X"
const normalize = (s: string) =>
  s.trim().replace(/\s+tools?$/i, "");

const getSubDesc = (title: string) => {
  const exact = aiSubcategoryDescriptions[title];
  if (exact) return exact;
  const key = normalize(title);
  return aiSubcategoryDescriptions[key] || ""; // fallback rỗng nếu chưa có
};

const primaryCatSlug = (t: any) => {
  const cats = toArr<string>(t.category).map(norm);
  return cats[0] ?? '';
};

const priceLabel = (p?: string) => {
  if (!p) return '—';
  if (/^free\b/i.test(p)) return 'Free';
  const m = p.match(/\$\s*\d+(?:\.\d{2})?/);
  return m ? m[0].replace(/\s+/g, '') : p;
};


const HomePage = () => {
  const CATEGORY_ICON = {
  ai: Bot,
  marketing: TrendingUp,
  mmo: DollarSign,
  saas: Server,
  design: Palette,
  automation: Zap,
} as const;
const { byCategory, bySubcategory } = React.useMemo(() => {
    const byCategory = new Map<string, number>();
    const bySubcategory = new Map<string, number>();

    tools.forEach(t => {
      // category có thể là string hoặc mảng -> chuẩn hóa
      toArr<string>(t.category).map(norm).forEach(c => {
        if (!c) return;
        byCategory.set(c, (byCategory.get(c) || 0) + 1);
      });
      // subcategory có thể là string hoặc mảng
      toArr<string>(t.subcategory).map(norm).forEach(s => {
        if (!s) return;
        bySubcategory.set(s, (bySubcategory.get(s) || 0) + 1);
      });
    });

    return { byCategory, bySubcategory };
  }, [tools]);

  // 2) Tạo trending bên trong component
  const trendingTools = React.useMemo(
    () =>
      tools
        .filter(t => t.featured)
        .slice()
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 3),
    [tools]
  );
const CATEGORY_COLOR = {
  ai: 'from-blue-500 to-purple-600',
  marketing: 'from-green-500 to-teal-600',
  mmo: 'from-orange-500 to-red-600',
  saas: 'from-indigo-500 to-blue-600',
  design: 'from-pink-500 to-rose-600',
  automation: 'from-yellow-500 to-orange-600',
} as const;

const AI_SUBS = [
  ['AI Productivity Tools', 'from-blue-500 to-indigo-600', Bot],
  ['AI Text Generators', 'from-green-500 to-emerald-600', TrendingUp],
  ['AI Image Tools', 'from-purple-500 to-pink-600', Palette],
  ['AI Art Generators', 'from-pink-500 to-rose-600', Palette],
  ['AI Video Tools', 'from-red-500 to-orange-600', Server],
  ['AI Audio Generators', 'from-yellow-500 to-amber-600', Server],
  ['AI Code Tools', 'from-indigo-500 to-blue-600', Bot],
  ['AI Business Tools', 'from-teal-500 to-cyan-600', DollarSign],
  ['AI Agent & Automation Tools', 'from-gray-500 to-slate-600', Zap],
] as const;

const categoryList = ([
  ['AI Tools', 'ai'],
  ['Marketing Tools', 'marketing'],
  ['MMO Tools', 'mmo'],
  ['SaaS Tools', 'saas'],
  ['Design Tools', 'design'],
  ['Automation Tools', 'automation'],
] as const).map(([title, slug]) => ({
  title,
  slug,
  icon: CATEGORY_ICON[slug],
  color: CATEGORY_COLOR[slug],
  count: byCategory.get(slug) || 0,
}));

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Digital Marketer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'DigitalToolsHub helped me discover AI tools that increased my productivity by 300%. The reviews are honest and detailed.',
      rating: 5,
      earnings: '$15K+ saved on tools'
    },
    {
      name: 'Mike Chen',
      role: 'Online Entrepreneur',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'Found the perfect marketing automation stack through this platform. My conversion rates doubled in 3 months.',
      rating: 5,
      earnings: '$50K+ revenue increase'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Creator',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'The MMO tools section is a goldmine. I built my entire online business using recommendations from here.',
      rating: 5,
      earnings: '$25K+ monthly income'
    }
  ];

  const stats = [
    { number: `${tools.length}+`, label: 'Digital Tools' },
    { number: '50K+', label: 'Happy Users' },
    { number: '98%', label: 'Success Rate' },
    { number: '$2M+', label: 'Saved by Users' }
  ];

  
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Helmet>
        <title>DigitalToolsHub — Discover the Best Digital, AI, Marketing, and MMO Tools</title>
        <meta name="description" content="Find, compare, and access powerful AI, marketing, MMO, SaaS, and design tools to boost productivity and income." />
        <link rel="canonical" href="https://aithubs.com/" />
     </Helmet>
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Discover the Best
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Digital Tools</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Find, compare, and access the most powerful AI tools, marketing software, and MMO platforms. 
                Boost your productivity and income with expert-curated recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/tools"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Explore Tools
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
                  {trendingTools.map((tool) => {
                  const slug = primaryCatSlug(tool) as keyof typeof CATEGORY_ICON;
                  const Icon = CATEGORY_ICON[slug] ?? Bot;
                  const grad = CATEGORY_COLOR[slug] ?? 'from-gray-500 to-gray-600';

                return (
                <Link
                key={tool.id}
                to={`/tools/${tool.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${grad} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                  </div>
                <div>
                <div className="font-medium text-gray-900 dark:text-white">{tool.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {(slug || 'misc')} Tool
                  </div>
                  </div>
                </div>
              <div className="text-green-600 dark:text-green-400 font-semibold">
                {priceLabel(tool.price)}
              </div>
              </Link>
                 );
              })}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Tool Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover powerful digital tools across five main categories designed to boost your productivity and income
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-5">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryList.map((category) => (
                <Link
                  key={category.slug}
                  to={`/tools?category=${category.slug}`}
                  className="card card--hover p-6 block"
                  data-accent={category.slug}
                >
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {getCatDesc(category.title)}
                </p>
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {category.count}+ Tools
                </span>
                <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Subcategories Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              AI Tools by Category
              
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore specialized AI tools organized by their specific use cases and applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ... */}
{AI_SUBS.map(([name, color, Icon]) => {
  const count = bySubcategory.get(norm(name)) || 0;
  return (
    <Link
      key={name}
      to={`/tools?subcategory=${encodeURIComponent(name)}`}
      className=" card card--hover p-6 block group bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed line-clamp-2">
        {getSubDesc(name)}
     </p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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

      {/* Testimonials Section */}
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
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    loading="lazy"
                    src={testimonial.image}
                    alt={`${testimonial.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium">
                  {testimonial.earnings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12">
            <Mail className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay Ahead of the Curve
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get weekly updates on the latest digital tools, exclusive deals, and expert insights 
              delivered straight to your inbox.
            </p>
            
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;