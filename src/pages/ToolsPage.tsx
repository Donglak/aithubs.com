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
  DollarSign,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import "../../css/style_Aitool.css";
import ToolActionButtons from "../components/ToolActionButtons";
import { tools } from "../data/tools";
import { toSlug } from "../utils/slug";
import { useToolsFilters } from "../hooks/useToolsFilters";

const PAGE_SIZE = 30;

const ToolsPage = () => {
  // Use the shared filtering hook
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedIndustries,
    toggleIndustry,
    selectedFunctions,
    toggleFunction,
    selectedPricing,
    togglePricing,
    sortBy,
    setSortBy,
    filteredTools,
    allIndustries,
    allFunctions,
    clearAllFilters,
  } = useToolsFilters(tools);

  // Local UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showToTop, setShowToTop] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [showCategoriesFilter, setShowCategoriesFilter] = useState(true);

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll / pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Scroll to results when filters change
  useEffect(() => {
    if (!resultRef.current) return;
    const y = resultRef.current.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }, [selectedFunctions, selectedIndustries, selectedPricing, debouncedSearchTerm]);

  // Scroll listener for "back to top" button
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearchTerm, selectedIndustries, selectedFunctions, selectedPricing, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((cur) => Math.min(cur + PAGE_SIZE, filteredTools.length));
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [filteredTools.length]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search suggestions using debounced search term
  const suggestions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    const q = debouncedSearchTerm.toLowerCase();
    return tools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [debouncedSearchTerm]);

  const visibleTools = useMemo(
    () => filteredTools.slice(0, visibleCount),
    [filteredTools, visibleCount],
  );

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    try {
      navigator.vibrate?.(10);
    } catch {}
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Explore the Best Digital Tools | DigitalToolsHub</title>
        <meta
          name="description"
          content="Filter AI & digital tools by categories and functions. Compare pricing, features, and ratings to pick the best tool for your use case."
        />
        <link rel="canonical" href="https://aithubs.com/tools" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Digital Tools Directory",
            description: "Explore and compare the best digital tools filtered by categories and functions.",
            numberOfItems: tools.length,
            itemListElement: tools.slice(0, 10).map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "SoftwareApplication",
                name: tool.name,
                description: tool.description,
                url: `https://aithubs.com/tools/${toSlug(tool.name)}`,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Cloud",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
              },
            })),
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <h1 className="mt-3 text-3xl sm:text-5xl leading-tight font-hero font-extrabold tracking-tight text-gray-900 dark:text-white">
          <span className="bg-gradient-to-r from-primary-600 via-pink-600 to-green-600 bg-clip-text text-transparent">
            {" "}
            Find The Best Tools — Filtered by categories & Functions
          </span>
        </h1>

        {/* Search */}
        <div className="w-full mx-auto mb-4 mt-5" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools by name, description or tags..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => {
                if (searchTerm.trim()) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.max(i - 1, -1));
                } else if (e.key === "Enter") {
                  if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    setSearchTerm(suggestions[highlightedIndex].name);
                    setShowSuggestions(false);
                    setHighlightedIndex(-1);
                  } else {
                    setShowSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                }
              }}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-900 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setShowSuggestions(false);
                  setHighlightedIndex(-1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-base"
              >
                ✕
              </button>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-900 rounded-xl shadow-2xl overflow-hidden">
                {suggestions.map((tool, idx) => {
                  const inds = tool.categories || [];
                  const funcs = tool.functions || [];
                  const isActive = idx === highlightedIndex;
                  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                  const parts = tool.name.split(new RegExp(`(${escaped})`, "gi"));

                  return (
                    <button
                      key={tool.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchTerm(tool.name);
                        setShowSuggestions(false);
                        setHighlightedIndex(-1);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0 ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {parts.map((part, i) =>
                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-white rounded px-0.5">
                                {part}
                              </mark>
                            ) : (
                              <span key={i}>{part}</span>
                            ),
                          )}
                        </p>
                        {(inds[0] || funcs[0]) && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {[inds[0], funcs[0]].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      {tool.image && (
                        <img
                          src={tool.image}
                          alt={tool.name}
                          loading="lazy"
                          className="w-7 h-7 rounded object-cover flex-shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-mono">↑↓</kbd> move &nbsp;·&nbsp;
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-mono">Enter</kbd> select &nbsp;·&nbsp;
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-mono">Esc</kbd> close
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filters toggle */}
        <div className="mt-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{filtersOpen ? "Hide filters" : "Show filters"}</span>
            {(selectedIndustries.length > 0 || selectedFunctions.length > 0 || selectedPricing.length > 0) && (
              <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedIndustries.length + selectedFunctions.length + selectedPricing.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters card */}
        <div className={`mt-6 grid grid-cols-1 gap-6 ${showDesktopFilters ? "lg:grid-cols-[280px,minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)]"}`}>
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? "block" : "hidden"} ${showDesktopFilters ? "lg:block" : "lg:hidden"} lg:sticky lg:top-24 self-start`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Active filters */}
              {(selectedIndustries.length > 0 || selectedFunctions.length > 0 || selectedPricing.length > 0) && (
                <div className="mb-6 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedIndustries.map((i) => (
                      <button key={i} onClick={() => toggleIndustry(i)} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        {i} <X size={12} />
                      </button>
                    ))}
                    {selectedFunctions.map((f) => (
                      <button key={f} onClick={() => toggleFunction(f)} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        {f} <X size={12} />
                      </button>
                    ))}
                    {selectedPricing.map((p) => (
                      <button key={p} onClick={() => togglePricing(p as "free" | "freemium" | "paid")} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md border border-primary-200 dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        {p} <X size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories checkbox list */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Categories</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{allIndustries.length}</span>
                  </div>
                  <button type="button" onClick={() => setShowCategoriesFilter((v) => !v)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                    {showCategoriesFilter ? "Hide categories" : "Show categories"}
                  </button>
                </div>
                {showCategoriesFilter && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allIndustries.map(([label, count]) => (
                      <label key={label} className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                        <span className="flex items-center gap-2">
                          <input type="checkbox" checked={selectedIndustries.includes(label)} onChange={() => toggleIndustry(label)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-0" />
                          <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Functions checkbox list */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Functions</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{allFunctions.length}</span>
                </div>
                <div className={`space-y-2 overflow-y-auto pr-2 custom-scrollbar ${showCategoriesFilter ? "max-h-64" : "max-h-[28rem]"}`}>
                  {allFunctions.map(([label, count]) => (
                    <label key={label} className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedFunctions.includes(label)} onChange={() => toggleFunction(label)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-0" />
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
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Pricing</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("free")} onChange={() => togglePricing("free")} className="w-4 h-4 rounded border-gray-300 dark:border-gray-900 text-green-600 focus:ring-green-500 focus:ring-offset-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("freemium")} onChange={() => togglePricing("freemium")} className="w-4 h-4 rounded border-gray-300 dark:border-gray-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Freemium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("paid")} onChange={() => togglePricing("paid")} className="w-4 h-4 rounded border-gray-300 dark:border-gray-900 text-red-600 focus:ring-red-500 focus:ring-offset-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Paid</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right column: sort + results */}
          <section className="space-y-4" ref={resultRef}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTools.length}</span> tools</span>
                {debouncedSearchTerm && (
                  <span className="text-sm text-primary-600 dark:text-primary-400">Search: "{debouncedSearchTerm}"</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowDesktopFilters((v) => !v)} className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors text-sm font-medium">
                  <Filter className="w-4 h-4" />
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("free")} onChange={() => togglePricing("free")} className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-900 text-green-600 focus:ring-green-500 focus:ring-offset-0" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("freemium")} onChange={() => togglePricing("freemium")} className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-0" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Freemium</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors">
                    <input type="checkbox" checked={selectedPricing.includes("paid")} onChange={() => togglePricing("paid")} className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-900 text-red-600 focus:ring-red-500 focus:ring-offset-0" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Paid</span>
                  </label>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-900 mx-1" />
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`} title="List view"><List size={18} /></button>
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`} title="Grid view"><Grid3x3 size={18} /></button>
                </div>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 pr-8 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer">
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                    <option value="price">Price Low-High</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tool list */}
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {visibleTools.map((tool) => {
                const inds = tool.categories || [];
                const funcs = tool.functions || [];
                const isFree = tool.price.toLowerCase().includes("free");
                const isPaid = !isFree;
                const isFreemium = isFree && tool.price.includes("-");

                return (
                  <div key={tool.id} className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <img src={tool.image} alt={tool.name} loading="lazy" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all" />
                          {tool.featured && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full"><Star size={10} className="fill-current" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{tool.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-sm">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="font-medium text-gray-700 dark:text-gray-300">{tool.rating ?? "—"}</span>
                              <span className="text-gray-400 ml-1">({tool.reviews?.toLocaleString() || 0})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isFreemium ? (
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">Freemium</span>
                        ) : isFree ? (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full border border-green-200 dark:border-green-700">Free</span>
                        ) : (
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-200 dark:border-red-700">Paid</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-4 line-clamp-2 leading-relaxed">{tool.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {inds.slice(0, 2).map((i, idx) => {
                        const isActive = selectedIndustries.includes(i);
                        return (
                          <button key={`ind-${tool.name}-${idx}`} type="button" onClick={() => toggleIndustry(i)} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${isActive ? "bg-indigo-500 text-white border-indigo-400 shadow-sm" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"}`}>{i}</button>
                        );
                      })}
                      {funcs.slice(0, 2).map((f, idx) => {
                        const isActive = selectedFunctions.includes(f);
                        return (
                          <button key={`fn-${tool.name}-${idx}`} type="button" onClick={() => toggleFunction(f)} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${isActive ? "bg-emerald-500 text-white border-emerald-400 shadow-sm" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"}`}>{f}</button>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ToolActionButtons tool={{ slug: toSlug(tool.name), name: tool.name, logo: tool.image, category: (tool.categories?.[0] || tool.functions?.[0] || "") }} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/tools/${toSlug(tool.name)}`} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Details</Link>
                          <a href={tool.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow">Try Now</a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {visibleCount < filteredTools.length && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisibleCount((v) => Math.min(v + PAGE_SIZE, filteredTools.length))} className="group px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                  <span>Load more tools</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{filteredTools.length - visibleCount} remaining</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* No results */}
            {filteredTools.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-10 h-10 text-gray-400" /></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tools found</h3>
                <p className="text-gray-900 dark:text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearAllFilters} className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">Clear all filters</button>
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} style={{ height: 1 }} />
          </section>
        </div>

        {/* Scroll-to-top FAB (mobile only) */}
        <button type="button" onClick={scrollToTop} aria-label="Scroll to top" className={["fixed z-50 right-4", "bottom-[calc(env(safe-area-inset-bottom)+88px)]", "md:hidden", "w-12 h-12 rounded-full bg-gray-900/85 text-white backdrop-blur", "ring-1 ring-white/10 shadow-lg", "transition-all duration-300", showToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none", "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"].join(" ")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") scrollToTop(); }}>
          <ArrowUp className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default ToolsPage;