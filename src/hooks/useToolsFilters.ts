import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { Tool } from '../types/tool';
import {
  filterTools,
  sortTools,
  deriveIndustries,
  deriveFunctions,
  getPricingCategory,
  type ToolFilters,
  type SortOption,
} from '../utils/filterUtils';

interface UseToolsFiltersReturn {
  // Filter state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  selectedIndustries: string[];
  setSelectedIndustries: (industries: string[]) => void;
  toggleIndustry: (industry: string) => void;
  selectedFunctions: string[];
  setSelectedFunctions: (functions: string[]) => void;
  toggleFunction: (fn: string) => void;
  selectedPricing: string[];
  setSelectedPricing: (pricing: string[]) => void;
  togglePricing: (pricing: "free" | "freemium" | "paid") => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Computed
  filteredTools: Tool[];
  allIndustries: [string, number][];
  allFunctions: [string, number][];

  // URL sync
  clearAllFilters: () => void;
}

/**
 * Custom hook for managing tools filtering with URL synchronization
 * and memoized filter/sort computations to avoid O(n²) re-renders
 */
export function useToolsFilters(tools: Tool[]): UseToolsFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync filters with URL
  const updateParamArray = useCallback(
    (key: "categories" | "function" | "pricing", arrVal: string[]) => {
      const next = new URLSearchParams(searchParams);
      next.delete(key);
      if (arrVal.length) next.set(key, arrVal.join(","));
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const toggleIndustry = useCallback(
    (val: string) => {
      setSelectedIndustries((prev) => {
        const next = prev.includes(val) ? [] : [val];
        updateParamArray("categories", next);
        return next;
      });
    },
    [updateParamArray]
  );

  const toggleFunction = useCallback(
    (val: string) => {
      setSelectedFunctions((prev) => {
        const next = prev.includes(val)
          ? prev.filter((x) => x !== val)
          : [...prev, val];
        updateParamArray("function", next);
        return next;
      });
    },
    [updateParamArray]
  );

  const togglePricing = useCallback(
    (key: "free" | "freemium" | "paid") => {
      setSelectedPricing((prev) => {
        const next = prev.includes(key)
          ? prev.filter((x) => x !== key)
          : [...prev, key];
        updateParamArray("pricing", next);
        return next;
      });
    },
    [updateParamArray]
  );

  // Initialize from URL params
  useEffect(() => {
    const inds = (searchParams.get("categories") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const funcs = (searchParams.get("function") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const pric = (searchParams.get("pricing") ?? "")
      .split(",")
      .map((s) => s.trim() as "free" | "freemium" | "paid")
      .filter(Boolean);

    setSelectedIndustries(inds);
    setSelectedFunctions(funcs);
    setSelectedPricing(pric);
  }, [searchParams]);

  // Compute facets (industries & functions with counts) - memoized
  const { allIndustries, allFunctions } = useMemo(() => {
    const inds = new Map<string, number>();
    const funcs = new Map<string, number>();

    tools.forEach((t) => {
      deriveIndustries(t).forEach((i) => inds.set(i, (inds.get(i) ?? 0) + 1));
      deriveFunctions(t).forEach((f) => funcs.set(f, (funcs.get(f) ?? 0) + 1));
    });

    return {
      allIndustries: Array.from(inds.entries()).sort((a, b) => b[1] - a[1]),
      allFunctions: Array.from(funcs.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [tools]);

  // Filter and sort tools - memoized to avoid O(n²) recomputation
  const filteredTools = useMemo(() => {
    const filters: ToolFilters = {
      searchTerm: debouncedSearchTerm,
      selectedIndustries,
      selectedFunctions,
      selectedPricing,
      sortBy,
    };

    const filtered = filterTools(tools, filters);
    return sortTools(filtered, sortBy);
  }, [
    tools,
    debouncedSearchTerm,
    selectedIndustries,
    selectedFunctions,
    selectedPricing,
    sortBy,
  ]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedPricing([]);
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedIndustries,
    setSelectedIndustries,
    toggleIndustry,
    selectedFunctions,
    setSelectedFunctions,
    toggleFunction,
    selectedPricing,
    setSelectedPricing,
    togglePricing,
    sortBy,
    setSortBy,

    // Computed
    filteredTools,
    allIndustries,
    allFunctions,

    // Actions
    clearAllFilters,
  };
}