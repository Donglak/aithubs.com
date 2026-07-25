// Shared filter utilities for tools - extracted from ToolsPage and HomePage
import type { Tool } from '../types/tool';

export const s = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

export const arr = <T,>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

export const norm = (v: unknown) => s(v).trim().toLowerCase();

// Fallback map for deriving categories/functions from tags
export const TAG_MAPPING = {
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

export function getPricingCategory(price: string): "free" | "freemium" | "paid" | null {
  const priceText = s(price).toLowerCase();
  const isFree = priceText.includes("free");
  const hasDash = s(price).includes("-");

  if (isFree && !hasDash) return "free";
  if (isFree && hasDash) return "freemium";
  if (!isFree) return "paid";
  return null;
}

export type SortOption = "popularity" | "rating" | "name" | "price";

export function sortTools(tools: Tool[], sortBy: SortOption): Tool[] {
  const list = [...tools];
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
}

export interface ToolFilters {
  searchTerm: string;
  selectedIndustries: string[];
  selectedFunctions: string[];
  selectedPricing: string[];
  sortBy: SortOption;
}

export function filterTools(tools: Tool[], filters: ToolFilters): Tool[] {
  const { searchTerm, selectedIndustries, selectedFunctions, selectedPricing } = filters;
  const q = searchTerm.toLowerCase();

  return tools.filter((tool) => {
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
    const priceCategory = getPricingCategory(s(tool.price));
    const matchesPricing =
      selectedPricing.length === 0 ||
      selectedPricing.some((p) => {
        if (p === "free") return priceCategory === "free";
        if (p === "freemium") return priceCategory === "freemium";
        if (p === "paid") return priceCategory === "paid";
        return false;
      });

    return matchesSearch && matchesIndustries && matchesFunctions && matchesPricing;
  });
}