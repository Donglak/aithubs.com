import {
  ArrowUp,
  Search
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import '../../css/style.css';
import '../../css/style_Aitool.css';
import ToolActionButtons from '../components/ToolActionButtons';
import { tools } from '../data/tools';
import { toSlug } from '../utils/slug';

// --------- Helpers ---------
// --------- Helpers ---------
const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const arr = <T,>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const norm = (v: unknown) =>
  s(v).trim().toLowerCase();
// Fallback đơn giản → map 1 số tag sang industry / function khi dataset chưa có field riêng
const TAG_MAPPING = {
  industry: new Map<string, string>([
    ['ecommerce', 'E‑commerce'],
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
    ['workflow','automation'],
    ['analytics', 'Analytics'],
  ]),
};

function deriveIndustries(t: any): string[] {
  const fromField = arr(t.industry).map(s).filter(Boolean);
  if (fromField.length) return fromField;

  // fallback từ tags
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

  // fallback từ tags
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach(tag => {
    TAG_MAPPING.function.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

const PAGE_SIZE = 30;

const ToolsPage = () => {
  // ====== Filters ======
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Scroll-to-top (mobile FAB)
const [showToTop, setShowToTop] = useState(false);
const [filtersOpen, setFiltersOpen] = useState(true);

useEffect(() => {
  const onScroll = () => setShowToTop(window.scrollY > 320);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

const scrollToTop = () => {
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  try { navigator.vibrate?.(10); } catch {}
  window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
};


  // ====== URL params (để share link lọc) ======
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParamArray = (key: 'industry' | 'function' | 'pricing', arrVal: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (arrVal.length) next.set(key, arrVal.join(','));
    setSearchParams(next, { replace: false });
  };

  const handleToggleIndustry = (val: string) => {
  // luôn chỉ giữ đúng 1 industry
  setSelectedIndustries(prev => {
    const next = prev.includes(val) ? [] : [val];
    updateParamArray('industry', next);
    return next;
  });
};


  const handleToggleFunction = (val: string) => {
  setSelectedFunctions(prev => {
    const next = prev.includes(val)
      ? prev.filter(x => x !== val)   // bỏ nếu đang chọn
      : [...prev, val];               // thêm nếu chưa có
    updateParamArray('function', next);
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

  // Đọc params từ URL lần đầu / khi URL đổi
  useEffect(() => {
    const inds = (searchParams.get('industry') ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const funcs = (searchParams.get('function') ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const pric = (searchParams.get('pricing') ?? '')
      .split(',')
      .map(s => s.trim() as 'free'|'freemium'|'paid')
      .filter(Boolean);

    setSelectedIndustries(inds);
    setSelectedFunctions(funcs);
    setSelectedPricing(pric);
  }, [searchParams]);

  // ====== Tập facet: industries / functions ======
  const { allIndustries, allFunctions } = useMemo(() => {
    const inds = new Map<string, number>();
    const funcs = new Map<string, number>();

    tools.forEach(t => {
      deriveIndustries(t).forEach(i => inds.set(i, (inds.get(i) ?? 0) + 1));
      deriveFunctions(t).forEach(f => funcs.set(f, (funcs.get(f) ?? 0) + 1));
    });

    return {
      allIndustries: Array.from(inds.entries()).sort((a, b) => b[1] - a[1]), // [label, count]
      allFunctions: Array.from(funcs.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, []);

  // ====== Paging / Infinite Scroll ======
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // ====== Filtering / Sorting ======
  const filteredTools = useMemo(() => {
    const q = searchTerm.toLowerCase();

    const list = tools.filter(tool => {
      // search
      const name = s(tool.name);
      const desc = s(tool.description);
      const tags = arr<string>(tool.tags).map(s);

      const matchesSearch =
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tags.some(tag => tag.toLowerCase().includes(q));

      // industry
      const inds = deriveIndustries(tool); // string[]
      const matchesIndustry =
        selectedIndustries.length === 0 ||
        inds.some(i => selectedIndustries.includes(i));

      // function
      const funcs = deriveFunctions(tool);
      const matchesFunction =
        selectedFunctions.length === 0 ||
        funcs.some(f => selectedFunctions.includes(f));

      // pricing
      const priceText = s(tool.price).toLowerCase();
      const isFree = priceText.includes('free');
      const hasDash = s(tool.price).includes('-');
      const matchesPricing =
        selectedPricing.length === 0 ||
        selectedPricing.some(p => {
          if (p === 'free') return isFree && !hasDash;
          if (p === 'free') return isFree && hasDash;
          if (p === 'paid') return !isFree;
          return false;
        });

      return matchesSearch && matchesIndustry && matchesFunction && matchesPricing;
    });

    // sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'popularity': return (b.reviews || 0) - (a.reviews || 0);
        case 'rating':     return (b.rating || 0) - (a.rating || 0);
        case 'name':       return s(a.name).localeCompare(s(b.name));
        case 'price': {
          const aPrice = parseFloat(s(a.price).replace(/[^0-9.]/g, '')) || 0;
          const bPrice = parseFloat(s(b.price).replace(/[^0-9.]/g, '')) || 0;
          return aPrice - bPrice;
        }
        default: return 0;
      }
    });

    return list;
  }, [searchTerm, selectedIndustries, selectedFunctions, selectedPricing, sortBy]);

  // Reset paging khi filter đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedIndustries, selectedFunctions, selectedPricing, sortBy]);

  // Infinite scroll
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
          content="Filter AI & digital tools by industry and functions. Compare pricing, features, and ratings to pick the best tool for your use case."
        />
        <link rel="canonical" href="https://aithubs.com/tools" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <h1 className="mt-3 text-3xl sm:text-5xl leading-tight font-hero font-extrabold tracking-tight text-white">
          <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent"> Find The Best Tools — Filtered by Industry & Functions</span>
        </h1>

        {/* Search */}
        <div className="max-w-xl w-full mx-auto mb-26 mt-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools by name, description or tags…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
          {/* Mobile filters toggle */}
              <div className="mt-4 flex items-center justify-between lg:hidden">
                <p className="text-xs text-slate-400">
                  Showing {filteredTools.length} tools
                </p>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100
                            border border-slate-600 hover:bg-slate-700"
                >
                  {filtersOpen ? 'Hide filters' : 'Show filters'}
                </button>
              </div>

        {/* Filters card */}
        {/* Layout 2 cột: sidebar filters + list */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px,minmax(0,1fr)] gap-6">
            {/* Sidebar filters bên trái */}
            <aside className={`${filtersOpen ? 'block' : 'hidden'}lg:block lg:sticky lg:top-24 self-start`}>
              <div className="glow-mobile glass-card tool-card p-4 flex flex-col justify-between h-full transition-all">
                {/* Tiêu đề + nút clear */}
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Filters
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedFunctions([]);
                      setSelectedPricing([]);
                      setSearchTerm('');
                      setSearchParams(new URLSearchParams(), { replace: false });
                    }}
                    className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Clear filters
                  </button>
                </div>

                {/* Industry checkbox list */}
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    Industry
                  </p>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {allIndustries.map(([label, count]) => (
                      <label
                        key={label}
                        className="flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIndustries.includes(label)}
                            onChange={() => handleToggleIndustry(label)}
                            className="h-3.5 w-3.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-400"
                          />
                          <span>{label}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Function checkbox list */}
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    Functions
                  </p>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {allFunctions.map(([label, count]) => (
                      <label
                        key={label}
                        className="flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFunctions.includes(label)}
                            onChange={() => handleToggleFunction(label)}
                            className="h-3.5 w-3.5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-400"
                          />
                          <span>{label}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-lg font-semibold text-green-400">
                    Pricing
                  </p>
                  <div className="space-y-1 text-xs text-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('free')}
                        onChange={() => handleTogglePricing('free')}
                        className="h-3.5 w-3.5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-400"
                      />
                      <span>Free</span>
                    </label>
                    {/* Nếu dùng freemium thì mở lại */}
                    {/* <label ...>Freemium</label> */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('paid')}
                        onChange={() => handleTogglePricing('paid')}
                        className="h-3.5 w-3.5 rounded border-slate-600 text-pink-500 focus:ring-pink-400"
                      />
                      <span>Paid</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Cột phải: sort + kết quả list tools */}
            <section className="space-y-4" ref={resultRef}>
              {/* Thanh sort / view / showing count giữ nguyên code cũ của bạn ở đây */}
              <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Đặt toàn bộ khối Showing / Sort / View hiện tại vào đây
          NHƯNG bỏ các class kiểu mt-6, mt-8 nếu đang có */}
              
              {/* ... */}
              {/* List tools dùng visibleTools.map(...) giữ nguyên */}
              {/* ... */}
            


        {/* List */}
        <div 
          ref={resultRef}
          className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          {visibleTools.map(tool => {
            const inds = deriveIndustries(tool);
            const funcs = deriveFunctions(tool);
            return (
              <div key={tool.id} className="glow-mobile glass-card tool-card p-4 flex flex-col justify-between h-full transition-all">
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
                    {s(tool.price).toLowerCase().includes('free') && s(tool.price).includes('-') ? (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Free</span>
                    ) : s(tool.price).toLowerCase().includes('free') ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Free</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Paid</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mt-2">{tool.description}</p>

                {/* Industries & Functions chips */}
                {/* Industries & Functions chips (click to filter) */}
<div className="flex flex-wrap gap-2 mt-3">
  {/* Industry tags */}
  {inds.slice(0, 3).map((i, idx) => {
    const isActive = selectedIndustries.includes(i);
    return (
      <button
        key={`ind-${tool.name}-${idx}`}
        type="button"
        onClick={() => handleToggleIndustry(i)}
        className={
          `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
           border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
           ${
             isActive
               ? 'bg-indigo-500 text-white border-indigo-400'
               : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
           }`
        }
      >
        {i}
      </button>
    );
  })}

  {/* Function tags */}
  {funcs.slice(0, 3).map((f, idx) => {
    const isActive = selectedFunctions.includes(f);
    return (
      <button
        key={`fn-${tool.name}-${idx}`}
        type="button"
        onClick={() => handleToggleFunction(f)}
        className={
          `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
           border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
           ${
             isActive
               ? 'bg-emerald-500 text-white border-emerald-400'
               : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
           }`
        }
      >
        {f}
      </button>
    );
  })}
</div>


                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-white/10">
                  {/* Hàng 1: nút tương tác */}
                  <div
                    className="flex items-center justify-end gap-1 mb-3"
                    onClick={e => e.preventDefault()}
                  >
                    <ToolActionButtons
                      tool={{
                        slug: toSlug(tool.name),
                        name: s(tool.name),
                        logo: s(tool.image),
                        category: deriveIndustries(tool)[0] || deriveFunctions(tool)[0] || '',
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Hàng 2: Details + Try Now */}
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/tools/${toSlug(tool.name)}`}
                      className="btn-neon text-xs px-4 py-2 rounded font-semibold"
                    >
                      Details
                    </Link>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gradient px-4 py-2 rounded-full text-sm pulseGlow"
                    >
                      Try Now
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
        {/* Scroll-to-top FAB (mobile only) */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className={[
            "fixed z-50 right-4",
            // chừa safe-area iOS + tránh đè footer
            "bottom-[calc(env(safe-area-inset-bottom)+88px)]",
            // chỉ hiện trên mobile
            "md:hidden",
            // hình tròn, nền mờ, viền nhẹ
            "w-12 h-12 rounded-full bg-gray-900/85 text-white backdrop-blur",
            "ring-1 ring-white/10 shadow-lg",
            // hiệu ứng xuất hiện/ẩn
            "transition-all duration-300",
            showToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none",
            // feedback khi chạm & accessibility
            "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          ].join(" ")}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToTop(); }}
        >
          <ArrowUp className="w-5 h-5 mx-auto" />
        </button>


        </section>
      </div>

      </div>
      
    </div>
    
  );
};

export default ToolsPage;
