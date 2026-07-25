import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Heart,
  Loader2,
  Lock,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  ebooks,
  getPriceTypeColor,
  getPriceTypeLabel,
  type Ebook,
  type PreviewChapter,
} from "../data/ebooks";
import { useAuth } from "../hooks/useAuth";

const EBOOKS_PER_PAGE = 8;

type PreviewState = {
  isOpen: boolean;
  ebook: Ebook | null;
  chapter: PreviewChapter | null;
};

const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ebook-favorites");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleFavorite = useCallback((ebookId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(ebookId)
        ? prev.filter((id) => id !== ebookId)
        : [...prev, ebookId];

      if (typeof window !== "undefined") {
        localStorage.setItem("ebook-favorites", JSON.stringify(next));
      }

      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (ebookId: number) => favorites.includes(ebookId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
};

function useLoadMore<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const displayedItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => prev + pageSize);
      setIsLoading(false);
    }, 300);
  }, [hasMore, isLoading, pageSize]);

  return { displayedItems, hasMore, isLoading, loadMore };
}

interface EbookCardProps {
  ebook: Ebook;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onDownload: (ebook: Ebook) => void;
  onPreview?: () => void;
  user: unknown;
}

const EbookCard = memo(
  ({ ebook, isFavorite, onToggleFavorite, onDownload, onPreview }: EbookCardProps) => {
    const handleKeyDown = (
      e: KeyboardEvent<HTMLButtonElement>,
      action: () => void
    ) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    };

    return (
      <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 flex flex-col group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={ebook.coverImage}
            alt={`Cover of ${ebook.title} by ${ebook.author}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getPriceTypeColor(ebook.priceType)}`}
            >
              {getPriceTypeLabel(ebook.priceType)}
            </span>
            {ebook.priceType !== "free" && (
              <div className="flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(ebook.id)}
            onKeyDown={(e) => handleKeyDown(e, () => onToggleFavorite(ebook.id))}
            className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-200 ${
              isFavorite
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white"
            }`}
            aria-label={isFavorite ? `Remove ${ebook.title} from favorites` : `Add ${ebook.title} to favorites`}
            aria-pressed={isFavorite}
            type="button"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {onPreview && (
                <button
                  onClick={onPreview}
                  onKeyDown={(e) => handleKeyDown(e, onPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm shadow-lg transition-colors"
                  type="button"
                >
                  <FileText className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              )}

              <button
                onClick={() => onDownload(ebook)}
                onKeyDown={(e) => handleKeyDown(e, () => onDownload(ebook))}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm shadow-lg transition-colors"
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>{ebook.priceType === "free" ? "Download" : "Get Access"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full mb-2 w-fit">
            {ebook.category}
          </span>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[3rem]">
            {ebook.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            by <span className="font-medium">{ebook.author}</span>
          </p>

          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
              {ebook.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{ebook.rating}</span>
            </div>
            <span>•</span>
            <span>
              <FileText className="w-3 h-3 inline-block align-middle mr-1" />
              {ebook.pages} pages
            </span>
            <span>•</span>
            <span>{ebook.fileSize}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>{(ebook.downloads ?? 0).toLocaleString()} downloads</span>
            <span>{ebook.publishedDate}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                {ebook.priceType === "free" ? (
                  <>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">Free</span>
                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      No account needed
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${ebook.price}
                    </span>
                    <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                      {getPriceTypeLabel(ebook.priceType)}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => onDownload(ebook)}
                onKeyDown={(e) => handleKeyDown(e, () => onDownload(ebook))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
                  ebook.priceType === "free"
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                }`}
                type="button"
              >
                <Download className="w-4 h-4" />
                <span>{ebook.priceType === "free" ? "Download" : "Get Access"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

EbookCard.displayName = "EbookCard";

const EbooksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("all");
  const [previewState, setPreviewState] = useState<PreviewState>({
    isOpen: false,
    ebook: null,
    chapter: null,
  });
  const [previewEmailState, setPreviewEmailState] = useState({
    email: "",
    status: "idle" as "idle" | "submitting" | "success" | "error",
    errorMessage: "",
  });

  const user = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const openPreview = useCallback((ebook: Ebook, chapter: PreviewChapter) => {
    setPreviewState({ isOpen: true, ebook, chapter });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState({ isOpen: false, ebook: null, chapter: null });
    setPreviewEmailState({ email: "", status: "idle", errorMessage: "" });
  }, []);

  const handlePreviewEmailSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!previewEmailState.email || !previewEmailState.email.includes("@")) {
        setPreviewEmailState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Please enter a valid email address.",
        }));
        return;
      }

      setPreviewEmailState((prev) => ({ ...prev, status: "submitting", errorMessage: "" }));

      window.setTimeout(() => {
        setPreviewEmailState({ email: "", status: "success", errorMessage: "" });
        window.setTimeout(closePreview, 1200);
      }, 800);
    },
    [closePreview, previewEmailState.email]
  );

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(ebooks.map((ebook) => ebook.category)))],
    []
  );

  const getPreviewHandler = useCallback(
    (ebook: Ebook) => {
      if (!ebook.hasPreview || !ebook.previewChapters?.length) return undefined;
      return () => openPreview(ebook, ebook.previewChapters![0]);
    },
    [openPreview]
  );

  const filteredEbooks = useMemo(() => {
    return ebooks.filter((ebook) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        ebook.title.toLowerCase().includes(query) ||
        ebook.author.toLowerCase().includes(query) ||
        ebook.description.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "all" || ebook.category === selectedCategory;
      const matchesPriceType = selectedPriceType === "all" || ebook.priceType === selectedPriceType;

      return matchesSearch && matchesCategory && matchesPriceType;
    });
  }, [searchQuery, selectedCategory, selectedPriceType]);

  const { displayedItems, hasMore, isLoading, loadMore } = useLoadMore(
    filteredEbooks,
    EBOOKS_PER_PAGE
  );

  const handleDownload = (ebook: Ebook) => {
    if (!user && ebook.priceType !== "free") {
      window.location.href = "/login";
      return;
    }

    if (ebook.priceType === "free") {
      window.open(ebook.googleDriveLink, "_blank", "noopener,noreferrer");
      return;
    }

    window.alert(
      `This ${getPriceTypeLabel(ebook.priceType)} ebook requires payment. ${ebook.price} USD checkout will be added soon.`
    );
  };

  const renderPreviewModal = () => {
    if (!previewState.isOpen || !previewState.ebook || !previewState.chapter) return null;

    const { ebook, chapter } = previewState;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="preview-title">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closePreview} aria-hidden="true" />

          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <img src={ebook.coverImage} alt="" className="w-12 h-16 object-cover rounded-lg" />
                <div>
                  <h3 id="preview-title" className="font-semibold text-gray-900 dark:text-white">
                    {ebook.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </p>
                </div>
              </div>

              <button
                onClick={closePreview}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close preview"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 prose prose-lg dark:prose-invert max-w-none">
              <div className="preview-content" dangerouslySetInnerHTML={{ __html: chapter.content }} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 sticky bottom-0">
              <div className="max-w-xl mx-auto">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This is a free preview ({chapter.wordCount.toLocaleString()} words). Unlock the full chapter and the rest of the book.
                </p>

                {ebook.priceType === "free" ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        closePreview();
                        window.open(ebook.googleDriveLink, "_blank", "noopener,noreferrer");
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors shadow-sm"
                      type="button"
                    >
                      <Download className="w-5 h-5 inline-block mr-2" />
                      Download Full Book Free
                    </button>
                    <button
                      onClick={closePreview}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                      type="button"
                    >
                      Maybe Later
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePreviewEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={previewEmailState.email}
                      onChange={(e) =>
                        setPreviewEmailState((prev) => ({
                          ...prev,
                          email: e.target.value,
                          status: "idle",
                          errorMessage: "",
                        }))
                      }
                      placeholder="Enter your email to unlock full access"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />

                    {previewEmailState.errorMessage && (
                      <p className="text-sm text-red-500">{previewEmailState.errorMessage}</p>
                    )}

                    {previewEmailState.status === "success" && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Success! We will contact you shortly.
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={previewEmailState.status === "submitting"}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-60"
                      >
                        {previewEmailState.status === "submitting" ? "Submitting..." : `Get Full Access - $${ebook.price}`}
                      </button>
                      <button
                        onClick={closePreview}
                        className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                        type="button"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </form>
                )}

                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Secure checkout • Instant access • 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Ebooks Library | DigitalToolsHub</title>
        <meta
          name="description"
          content="Browse and download our collection of premium ebooks on various topics. Free and paid options available."
        />
      </Helmet>

      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ebooks Library</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {ebooks.length} ebooks available • {displayedItems.length} showing
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search ebooks by title, author, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={selectedPriceType}
                    onChange={(e) => setSelectedPriceType(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEbooks.length === 0
                ? "No ebooks found matching your criteria"
                : `Showing ${displayedItems.length} of ${filteredEbooks.length} ebook${filteredEbooks.length !== 1 ? "s" : ""}`}
            </p>

            {filteredEbooks.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedPriceType("all");
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                type="button"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredEbooks.length === 0 ? (
            <section className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No ebooks found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedPriceType("all");
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                type="button"
              >
                Clear Filters
              </button>
            </section>
          ) : (
            <section>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedItems.map((ebook) => (
                  <div key={ebook.id}>
                    <EbookCard
                      ebook={ebook}
                      isFavorite={isFavorite(ebook.id)}
                      onToggleFavorite={toggleFavorite}
                      onDownload={handleDownload}
                      onPreview={getPreviewHandler(ebook)}
                      user={user}
                    />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    type="button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <span className="text-sm text-primary-100">
                          {filteredEbooks.length - displayedItems.length} remaining
                        </span>
                        <ChevronDown className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasMore && displayedItems.length > 0 && (
                <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
                  You've reached the end of the results.
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      {renderPreviewModal()}
    </>
  );
};

export default EbooksPage;
