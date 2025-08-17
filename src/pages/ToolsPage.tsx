import {
  Activity, Box,
  Brain,
  Palette,
  Search,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import '../../css/style_Aitool.css';
import { aiSubcategories, tools } from '../data/tools';

const ToolsPage = () => {
  // ====== Filters ======
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  // Pricing -> multi-select
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ====== Paging / Infinite Scroll ======
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
    // ====== UI meta ======
  const categoryIcons: Record<string, JSX.Element> = {
    ai: <Brain className="w-4 h-4 text-primary-500" />,
    marketing: <TrendingUp className="w-4 h-4 text-primary-500" />,
    mmo: <Activity className="w-4 h-4 text-primary-500" />,
    saas: <Box className="w-4 h-4 text-primary-500" />,
    design: <Palette className="w-4 h-4 text-primary-500" />,
    automation: <Zap className="w-4 h-4 text-primary-500" />
  };

  const categories = [
    { value: 'ai', label: 'AI Tools' },
    { value: 'marketing', label: 'Marketing Tools' },
    { value: 'mmo', label: 'MMO Tools' },
    { value: 'saas', label: 'SaaS Tools' },
    { value: 'design', label: 'Design Tools' },
    { value: 'automation', label: 'Automation Tools' }
  ] as const;

  // ====== Handlers ======
  const updateParamArray = (key: 'category'|'subcategory'|'pricing', arr: string[]) => {
  const next = new URLSearchParams(searchParams);
  next.delete(key);
  if (arr.length) next.set(key, arr.join(','));
  setSearchParams(next, { replace: false });
};

const handleToggleCategory = (category: string) => {
  setSelectedCategories(prev => {
    const next = prev.includes(category) ? prev.filter(x => x !== category) : [...prev, category];
    updateParamArray('category', next);
    return next;
  });
};

const handleToggleSubcategory = (subcategory: string) => {
  setSelectedSubcategories(prev => {
    const next = prev.includes(subcategory) ? prev.filter(x => x !== subcategory) : [...prev, subcategory];
    updateParamArray('subcategory', next);
    return next;
  });
};

const handleTogglePricing = (key: 'free' | 'freemium' | 'paid') => {
  setSelectedPricing(prev => {
    const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
    updateParamArray('pricing', next);
    return next;
  });
};
 
  // them de thuc hien loc khi chọn dung category ben home
const [searchParams, setSearchParams] = useSearchParams();

const norm = (v: unknown) =>
  (typeof v === 'string' ? v : v == null ? '' : String(v))
    .trim()
    .toLowerCase()
    .replace(/\s+tools?$/,'');   // "AI Tools" -> "ai", "Marketing Tool" -> "marketing"

// Lấy giá trị ban đầu từ URL (chạy khi location.search đổi)
useEffect(() => {
  const cats = (searchParams.get('category') ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())    // slug: ai, marketing,...
    .filter(Boolean);

  const subs = (searchParams.get('subcategory') ?? '')
    .split(',')
    .map(s => s.trim())                   // <-- chuẩn hóa từng sub
    .filter(Boolean);

  setSelectedCategories(cats);
  setSelectedSubcategories(subs);
}, [searchParams]);


  // ====== Filtering / Sorting ======
  const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
  const filteredTools = useMemo(() => {
  const filtered = tools.filter(tool => {
    // Chuẩn hóa dữ liệu để tránh undefined
    const name = s(tool.name);
    const description = s(tool.description);
    const tags: string[] = Array.isArray(tool.tags) ? tool.tags : [];
    const priceText = s(tool.price).toLowerCase();

    // search
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      tags.some(tag => s(tag).toLowerCase().includes(q));

    // category: string | string[] | undefined
    const tCat = tool.category;
    const toolCats = Array.isArray(tCat) ? tCat.map(norm) : [norm(tCat)];

const matchesCategory =
  selectedCategories.length === 0 ||
  toolCats.some(c => selectedCategories.includes(c));

    // subcategory: string | string[] | undefined
    const tSub = tool.subcategory;
    const toolSubs = Array.isArray(tSub) ? tSub.map(x => s(x).toLowerCase()) : [s(tSub).toLowerCase()];
    const selectedSubsNorm = selectedSubcategories.map(x => x.toLowerCase());

    const matchesSubcategory =
    selectedSubsNorm.length === 0 ||
    toolSubs.some(sub => selectedSubsNorm.includes(sub));

    // pricing: multi-select
    const hasDash = s(tool.price).includes('-'); // "Free - $20/month" => Freemium
    const isFree = priceText.includes('free');
    const matchesPricing =
      selectedPricing.length === 0 ||
      selectedPricing.some(p => {
        if (p === 'free') return isFree && !hasDash;
        if (p === 'freemium') return isFree && hasDash;
        if (p === 'paid') return !isFree;
        return false;
      });

    return matchesSearch && matchesCategory && matchesSubcategory && matchesPricing;
  });

  // sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.reviews || 0) - (a.reviews || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return s(a.name).localeCompare(s(b.name));
      case 'price': {
        const aPrice = parseFloat(s(a.price).replace(/[^0-9.]/g, '')) || 0;
        const bPrice = parseFloat(s(b.price).replace(/[^0-9.]/g, '')) || 0;
        return aPrice - bPrice;
      }
      default:
        return 0;
    }
  });

  return filtered;
}, [searchTerm, selectedCategories, selectedSubcategories, selectedPricing, sortBy, tools]);


  // ====== Category counters (tính theo dữ liệu gốc) ======
  const categoryStats = useMemo(() => {
  return categories.map(cat => {
    const count = tools.filter(t => {
      const tCat = t.category;
      const toolCats = Array.isArray(tCat) ? tCat.map(norm) : [norm(tCat)];
      return toolCats.includes(cat.value); // cat.value đã là slug: ai, marketing,...
    }).length;
    return { ...cat, count };
  });
}, []);

  // ====== Reset paging khi filter đổi ======
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedCategories, selectedSubcategories, selectedPricing, sortBy]);

  // ====== Infinite Scroll với IntersectionObserver ======
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(cur => Math.min(cur + PAGE_SIZE, filteredTools.length));
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [filteredTools.length]);

  // ====== Phần nhìn thấy ======
  const visibleTools = useMemo(
    () => filteredTools.slice(0, visibleCount),
    [filteredTools, visibleCount]
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Explore the Best Digital Tools | DigitalToolsHub</title>
        <meta
          name="description"
          content="Compare top digital tools for AI, marketing, SaaS, and automation. Read reviews and find the best fit for your business."
        />
        <link rel="canonical" href="https://aithubs.com/tools" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <h2 className="max-w-2xl mx-auto sm:text-3xl md:text-4xl font-bold text-center gradient-text mb-6 break-words leading-tight">
          DigitalToolsHub Collects & Organizes All The Best AI Tools So YOU Too Can Become Superhuman!
        </h2>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Category Stats */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm font-medium text-white justify-center">
          {categoryStats.map(cat => (
            <span
              key={cat.value}
              className="px-3 py-1 bg-gradient-to-r from-purple-700 to-indigo-600 rounded-full shadow"
            >
              ({cat.count}) {cat.label}
            </span>
          ))}
        </div>

        {/* Filters card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8 transition-all duration-500">
          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(category => (
              <label key={category.value} className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => handleToggleCategory(category.value)}
                  className="form-checkbox text-blue-600 dark:text-blue-400"
                />
                {categoryIcons[category.value]}
                <span>{category.label}</span>
              </label>
            ))}
          </div>

          {/* AI Subcategories */}
          {selectedCategories.includes('ai') && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">AI Subcategories:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(aiSubcategories ?? []).map((sub) => (
                  <label key={sub} className="flex items-center space-x-2 text-sm text-gray-800 dark:text-white">
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.map(s => s.toLowerCase()).includes(sub.toLowerCase())}
                      onChange={() => handleToggleSubcategory(sub)}
                      className="form-checkbox text-primary-500"
                    />
                    <span className="bg-primary-100 dark:bg-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                      {sub}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pricing (checkboxes) */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">Pricing:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Free */}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                <input
                  type="checkbox"
                  checked={selectedPricing.includes('free')}
                  onChange={() => handleTogglePricing('free')}
                  className="form-checkbox text-green-600"
                />
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                  Free
                </span>
              </label>
              {/* Freemium */}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                <input
                  type="checkbox"
                  checked={selectedPricing.includes('freemium')}
                  onChange={() => handleTogglePricing('freemium')}
                  className="form-checkbox text-purple-600"
                />
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                  Freemium
                </span>
              </label>
              {/* Paid */}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                <input
                  type="checkbox"
                  checked={selectedPricing.includes('paid')}
                  onChange={() => handleTogglePricing('paid')}
                  className="form-checkbox text-red-600"
                />
                <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs">
                  Paid
                </span>
              </label>
            </div>
          </div>

          {/* Sort & View (giữ ngắn gọn) */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTools.length} of {tools.length} tools
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price Low-High</option>
              </select>

              <div className="ml-2 flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Clear filters */}
          <div className="mt-4">
            <button
                 onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSubcategories([]);
                  setSelectedPricing([]);
                  setSearchTerm('');
                  setSearchParams(new URLSearchParams(), { replace: false }); // <-- thêm dòng này
                }}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
              Clear filters
            </button>
          </div>
        </div>

        {/* List */}
        <div
          ref={resultRef}
          className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          {visibleTools.map(tool => (
            <div key={tool.id} className="glass-card tool-card p-4 flex flex-col justify-between h-full transition-all">
              {/* Top row: logo + name/rating + price badge */}
              <div className="flex items-center justify-between gap-4">
                <img
                  src={tool.image}
                  alt={tool.name}
                  loading="lazy"
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                    <div className="flex items-center text-sm text-yellow-400 mt-1">
                    {'★'.repeat(Math.max(0, Math.floor(tool.rating || 0)))}
                    <span className="ml-1 text-gray-300">{tool.rating ?? '—'}</span>
                    </div>

                </div>
                <div className="flex-shrink-0">
                  {tool.price.toLowerCase().includes('free') && tool.price.includes('-') ? (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Freemium</span>
                  ) : tool.price.toLowerCase().includes('free') ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Free</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Paid</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mt-2">{tool.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(tool.tags ?? []).slice(0, 4).map((tag, idx) => (
                <span key={idx} className="bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs">
                {s(tag)}
                </span>
                 ))}
              </div>


              {/* Category chips (nếu là mảng) */}
              {Array.isArray(tool.category) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tool.category.map((cat, idx) => (
                    <span key={idx} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                      {cat.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-4 flex justify-between items-center">
                <Link to={`/tools/${tool.id}`} className="btn-neon text-xs px-4 py-2 rounded font-semibold">
                  Details
                </Link>
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gradient px-4 py-2 rounded-full text-sm"
                >
                  Try Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* See more */}
        {visibleCount < filteredTools.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(v => Math.min(v + PAGE_SIZE, filteredTools.length))}
              className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-shadow shadow-md"
            >
              See more ({filteredTools.length - visibleCount} left)
            </button>
          </div>
        )}

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </div>
  );
};

export default ToolsPage;

