import { Tool } from '../types/tool';
import { useMemo } from 'react';

// Helper functions
const s = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const arr = <T,>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const norm = (v: unknown) => s(v).trim().toLowerCase();

// Tag mapping for fallback
const TAG_MAPPING = {
  categories: new Map<string, string>([
    ["ecommerce", "E‑commerce"],
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
    ["workflow", "automation"],
    ["analytics", "Analytics"],
  ]),
};

export function deriveIndustries(t: Tool): string[] {
  const fromField = arr(t.categories).map(s).filter(Boolean);
  if (fromField.length) return fromField;

  // fallback from tags
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach((tag) => {
    TAG_MAPPING.categories.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

export function deriveFunctions(t: Tool): string[] {
  const fromField = arr(t.functions).map(s).filter(Boolean);
  if (fromField.length) return fromField;

  // fallback from tags
  const tags = arr<string>(t.tags).map(norm);
  const got = new Set<string>();
  tags.forEach((tag) => {
    TAG_MAPPING.function.forEach((label, key) => {
      if (tag.includes(key)) got.add(label);
    });
  });
  return Array.from(got);
}

/**
 * Computes all unique industries and functions with counts from tools array.
 * Memoized to avoid O(n²) recomputation on every render.
 */
export function useToolFacets(tools: Tool[]) {
  return useMemo(() => {
    const industries = new Map<string, number>();
    const functions = new Map<string, number>();

    tools.forEach((t) => {
      deriveIndustries(t).forEach((i) => industries.set(i, (industries.get(i) ?? 0) + 1));
      deriveFunctions(t).forEach((f) => functions.set(f, (functions.get(f) ?? 0) + 1));
    });

    // Sort by count descending
    const allIndustries = Array.from(industries.entries()).sort((a, b) => b[1] - a[1]);
    const allFunctions = Array.from(functions.entries()).sort((a, b) => b[1] - a[1]);

    return { allIndustries, allFunctions };
  }, [tools]);
}

/**
 * Filters and sorts tools based on search/filter criteria.
 * Memoized to only recompute when dependencies change.
 */
export function useFilteredTools(
  tools: Tool[],
  searchTerm: string,
  selectedIndustries: string[],
  selectedFunctions: string[],
  selectedPricing: string[],
  sortBy: string
) {
  return useMemo(() => {
    const q = searchTerm.toLowerCase();

    const list = tools.filter((tool) => {
      // Search match
      const name = s(tool.name);
      const desc = s(tool.description);
      const matchesSearch =
        name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);

      // Categories match
      const inds = deriveIndustries(tool);
      const matchesIndustries =
        selectedIndustries.length === 0 ||
        inds.some((i) => selectedIndustries.includes(i));

      // Functions match
      const funcs = deriveFunctions(tool);
      const matchesFunctions =
        selectedFunctions.length === 0 ||
        funcs.some((f) => selectedFunctions.includes(f));

      // Pricing match
      const priceText = s(tool.price).toLowerCase();
      const isFree = priceText.includes("free");
      const hasDash = s(tool.price).includes("-");
      const matchesPricing =
        selectedPricing.length === 0 ||
        selectedPricing.some((p) => {
          if (p === "free") return isFree && !hasDash;
          if (p === "freemium") return isFree && hasDash;
          if (p === "paid") return !isFree;
          return false;
        });

      return matchesSearch && matchesIndustries && matchesFunctions && matchesPricing;
    });

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return (b.reviews || 0) - (a.reviews || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return s(a.name).localeCompare(s(b.name));
        case "price": {
          const aPrice = parseFloat(s(a.price).replace(/[^0-9.]/g, "")) || 0;
          const bPrice = parseFloat(s(b.price).replace(/[^0-9.]/g, "")) || 0;
          return aPrice - bPrice;
        }
        default:
          return 0;
      }
    });

    return list;
  }, [
    tools,
    searchTerm,
    selectedIndustries,
    selectedFunctions,
    selectedPricing,
    sortBy,
  ]);
}