import {
  ArrowUp,
  Search,
  Grid3x3,
  List,
  Filter,
  X,
  ChevronDown,
  Star,
  TrendingUp,
  Clock,
  DollarSign
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
// Fallback đơn giản → map 1 số tag sang categories / function khi dataset chưa có field riêng
const TAG_MAPPING = {
  categories: new Map<string, string>([
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
  const fromField = arr(t.categories).map(s).filter(Boolean);
  if (fromField.length) return fromField;

  // fallback từ tags
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach(tag => {
    TAG_MAPPING.categories.forEach((label, key) => {
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
const [showSuggestions, setShowSuggestions] = useState(false);
const [highlightedIndex, setHighlightedIndex] = useState(-1);
const searchRef = useRef<HTMLDivElement>(null);

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

  const updateParamArray = (key: 'categories' | 'function' | 'pricing', arrVal: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (arrVal.length) next.set(key, arrVal.join(','));
    setSearchParams(next, { replace: false });
  };

  const handleTogglecategories = (val: string) => {
  // luôn chỉ giữ đúng 1 categories
  setSelectedIndustries(prev => {
    const next = prev.includes(val) ? [] : [val];
    updateParamArray('categories', next);
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
    const inds = (searchParams.get('categories') ?? '')
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
      

      const matchesSearch =
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q);

      // categories
      const inds = deriveIndustries(tool); // string[]
      const matchescategories =
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
          if (p === 'freemium') return isFree && hasDash;
          if (p === 'paid') return !isFree;
          return false;
        });

      return matchesSearch && matchescategories && matchesFunction && matchesPricing;
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
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
              if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
              ) {
                setShowSuggestions(false);
                setHighlightedIndex(-1);
              }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
              document.removeEventListener('mousedown', handleClickOutside);
          }, []);

        const suggestions = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const q = searchTerm.toLowerCase();
        return tools
          .filter(t =>
            s(t.name).toLowerCase().includes(q) ||
            s(t.description).toLowerCase().includes(q)
          )
          .slice(0, 8);
      }, [searchTerm]);

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
          content="Filter AI & digital tools by categories and functions. Compare pricing, features, and ratings to pick the best tool for your use case."
        />
        <link rel="canonical" href="https://aithubs.com/tools" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <h1 className="mt-3 text-3xl sm:text-5xl leading-tight font-hero font-extrabold tracking-tight text-white">
          <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent"> Find The Best Tools — Filtered by categories & Functions</span>
        </h1>

        {/* Search */}
        {/* Search với autocomplete */}
<div className="w-full mx-auto mb-4 mt-5" ref={searchRef}>
  <div className="relative">

    <Search className="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-400 w-5 h-5 z-10 pointer-events-none" />

    <input
      type="text"
      placeholder="Search tools by name, description or tags..."
      value={searchTerm}
      onChange={e => {
        setSearchTerm(e.target.value);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      }}
      onFocus={() => {
        if (searchTerm.trim()) setShowSuggestions(true);
      }}
      onKeyDown={e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter') {
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            setSearchTerm(s(suggestions[highlightedIndex].name));
            setShowSuggestions(false);
            setHighlightedIndex(-1);
          } else {
            setShowSuggestions(false);
          }
        } else if (e.key === 'Escape') {
          setShowSuggestions(false);
          setHighlightedIndex(-1);
        }
      }}
      className="w-full pl-10 pr-10 py-3
                 border border-gray-300 dark:border-gray-600
                 rounded-xl focus:ring-2 focus:ring-primary-500
                 focus:border-transparent bg-white dark:bg-gray-700
                 text-gray-900 dark:text-white shadow-sm text-sm"
    />

    {/* Nút xoá */}
    {searchTerm && (
      <button
        type="button"
        onClick={() => {
          setSearchTerm('');
          setShowSuggestions(false);
          setHighlightedIndex(-1);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2
                   text-gray-400 hover:text-gray-600
                   dark:hover:text-gray-200 transition-colors text-base"
      >
        ✕
      </button>
    )}

    {/* Dropdown gợi ý */}
    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute z-50 left-0 right-0 top-full mt-1
                      bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-600
                      rounded-xl shadow-2xl overflow-hidden">

        {suggestions.map((tool, idx) => {
          const inds = deriveIndustries(tool);
          const funcs = deriveFunctions(tool);
          const isActive = idx === highlightedIndex;
          const escaped = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g, '\\$&'
          );
          const parts = s(tool.name).split(
            new RegExp(`(${escaped})`, 'gi')
          );

          return (
            <button
              key={s(tool.name)}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                setSearchTerm(s(tool.name));
                setShowSuggestions(false);
                setHighlightedIndex(-1);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5
                text-left transition-colors
                border-b border-gray-100 dark:border-gray-700/50 last:border-0
                ${isActive
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900
                               dark:text-white truncate">
                  {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase()
                      ? (
                        <mark key={i}
                          className="bg-yellow-200 dark:bg-yellow-500/40
                                     text-gray-900 dark:text-white
                                     rounded px-0.5">
                          {part}
                        </mark>
                      )
                      : <span key={i}>{part}</span>
                  )}
                </p>
                {(inds[0] || funcs[0]) && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {[inds[0], funcs[0]].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {tool.image && (
                <img
                  src={tool.image}
                  alt={s(tool.name)}
                  loading="lazy"
                  className="w-7 h-7 rounded object-cover flex-shrink-0"
                />
              )}
            </button>
          );
        })}

        {/* Hint phím tắt ở footer dropdown */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/80
                        border-t border-gray-100 dark:border-gray-700">
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded
                            bg-gray-200 dark:bg-gray-700
                            text-[10px] font-mono">↑↓</kbd>
            move &nbsp;·&nbsp;
            <kbd className="px-1.5 py-0.5 rounded
                            bg-gray-200 dark:bg-gray-700
                            text-[10px] font-mono">Enter</kbd>
            sellect &nbsp;·&nbsp;
            <kbd className="px-1.5 py-0.5 rounded
                            bg-gray-200 dark:bg-gray-700
                            text-[10px] font-mono">Esc</kbd>
            close
          </p>
        </div>

      </div>
    )}

  </div>
</div>
          {/* Mobile filters toggle */}
          <div className="mt-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {filtersOpen ? 'Hide filters' : 'Show filters'}
              </span>
              {(selectedIndustries.length > 0 || selectedFunctions.length > 0 || selectedPricing.length > 0) && (
                <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedIndustries.length + selectedFunctions.length + selectedPricing.length}
                </span>
              )}
            </button>
          </div>

        {/* Filters card */}
        {/* Layout 2 cột: sidebar filters + list */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px,minmax(0,1fr)] gap-6">
            {/* Sidebar filters bên trái */}
            <aside
                  className={`
                    ${filtersOpen ? 'block' : 'hidden'}
                    lg:block lg:sticky lg:top-24 self-start
                  `}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Tiêu đề + nút clear */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      Filters
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedFunctions([]);
                      setSelectedPricing([]);
                      setSearchTerm('');
                      setSearchParams(new URLSearchParams(), { replace: false });
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Clear all
                  </button>
                </div>

                {/* Active filters */}
                {(selectedIndustries.length > 0 || selectedFunctions.length > 0 || selectedPricing.length > 0) && (
                  <div className="mb-6 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {selectedIndustries.map(i => (
                        <button
                          key={i}
                          onClick={() => handleTogglecategories(i)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          {i}
                          <X size={12} />
                        </button>
                      ))}
                      {selectedFunctions.map(f => (
                        <button
                          key={f}
                          onClick={() => handleToggleFunction(f)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          {f}
                          <X size={12} />
                        </button>
                      ))}
                      {selectedPricing.map(p => (
                        <button
                          key={p}
                          onClick={() => handleTogglePricing(p as 'free' | 'freemium' | 'paid')}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          {p}
                          <X size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* categories checkbox list */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Categories
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{allIndustries.length}</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allIndustries.map(([label, count]) => (
                      <label
                        key={label}
                        className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIndustries.includes(label)}
                            onChange={() => handleTogglecategories(label)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Function checkbox list */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Functions
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{allFunctions.length}</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allFunctions.map(([label, count]) => (
                      <label
                        key={label}
                        className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFunctions.includes(label)}
                            onChange={() => handleToggleFunction(label)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing - Mobile only */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Pricing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('free')}
                        onChange={() => handleTogglePricing('free')}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Free</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('freemium')}
                        onChange={() => handleTogglePricing('freemium')}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Freemium</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('paid')}
                        onChange={() => handleTogglePricing('paid')}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Paid</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Cột phải: sort + kết quả list tools */}
            <section className="space-y-4" ref={resultRef}>
              {/* Thanh sort / view / showing count */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTools.length}</span> tools
                  </span>
                  {filteredTools.length > 0 && (
                    <span className="text-sm text-gray-400">·</span>
                  )}
                  {searchTerm && (
                    <span className="text-sm text-primary-600 dark:text-primary-400">
                      Search: "{searchTerm}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Pricing Filters */}
                  <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('free')}
                        onChange={() => handleTogglePricing('free')}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free</span>
                    </label>
                    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('freemium')}
                        onChange={() => handleTogglePricing('freemium')}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Freemium</span>
                    </label>
                    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPricing.includes('paid')}
                        onChange={() => handleTogglePricing('paid')}
                        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Paid</span>
                    </label>
                  </div>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      title="List view"
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      title="Grid view"
                    >
                      <Grid3x3 size={18} />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 pr-8 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="popularity">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                      <option value="price">Price Low-High</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>


        {/* List */}
        <div
          ref={resultRef}
          className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          {visibleTools.map(tool => {
            const inds = deriveIndustries(tool);
            const funcs = deriveFunctions(tool);
            const isFree = s(tool.price).toLowerCase().includes('free');
            const isPaid = !isFree;
            const isFreemium = isFree && s(tool.price).includes('-');

            return (
              <div key={tool.id} className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600">
                {/* Top row: logo + name/rating + price badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        loading="lazy"
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all"
                      />
                      {tool.featured && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                          <Star size={10} className="fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {tool.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{tool.rating ?? '—'}</span>
                          <span className="text-gray-400 ml-1">({tool.reviews?.toLocaleString() || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isFreemium ? (
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                        Freemium
                      </span>
                    ) : isFree ? (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-200 dark:border-green-700">
                        Free
                      </span>
                    ) : (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 dark:border-red-700">
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>

                {/* Industries & Functions chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {inds.slice(0, 2).map((i, idx) => {
                    const isActive = selectedIndustries.includes(i);
                    return (
                      <button
                        key={`ind-${tool.name}-${idx}`}
                        type="button"
                        onClick={() => handleTogglecategories(i)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          isActive
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm'
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  })}
                  {funcs.slice(0, 2).map((f, idx) => {
                    const isActive = selectedFunctions.includes(f);
                    return (
                      <button
                        key={`fn-${tool.name}-${idx}`}
                        type="button"
                        onClick={() => handleToggleFunction(f)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          isActive
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tools/${toSlug(tool.name)}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Details
                      </Link>
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow"
                      >
                        Try Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* See more */}
        {visibleCount < filteredTools.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(v => Math.min(v + PAGE_SIZE, filteredTools.length))}
              className="group px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Load more tools</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {filteredTools.length - visibleCount} remaining
              </span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* No results state */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedIndustries([]);
                setSelectedFunctions([]);
                setSelectedPricing([]);
                setSearchTerm('');
                setSearchParams(new URLSearchParams(), { replace: false });
              }}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
            >
              Clear all filters
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
