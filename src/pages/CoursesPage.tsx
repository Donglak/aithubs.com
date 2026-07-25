// src/pages/CoursesPage.tsx
<<<<<<< HEAD
import {
  ArrowUp,
  BookOpen,
  Brain,
  Cpu,
  GraduationCap,
  Layers,
  PlayCircle,
  Search as SearchIcon,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
=======
import { ArrowUp, BookOpen, Brain, Cpu, GraduationCap, Layers, PlayCircle, Search as SearchIcon, Sparkles, Star, Users } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
import { useLocation, useNavigate } from "react-router-dom";
import { COURSES, Course } from "../data/courses";

/* ========== utils ========== */
const s = (v: unknown) => String(v ?? "").trim();

/** Chuẩn hóa về mảng string an toàn từ string / array / null */
const arr = (v: unknown): string[] =>
  Array.isArray(v)
    ? (v as unknown[]).map((x) => String(x).trim()).filter(Boolean)
    : (() => {
        const str = s(v);
<<<<<<< HEAD
        return str
          ? str
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : [];
=======
        return str ? str.split(",").map((x) => x.trim()).filter(Boolean) : [];
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      })();

function useDebounce<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function updateParamArray(
  navigate: ReturnType<typeof useNavigate>,
  key: string,
<<<<<<< HEAD
  values: string[],
=======
  values: string[]
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
) {
  const url = new URL(window.location.href);
  if (!values.length) url.searchParams.delete(key);
  else url.searchParams.set(key, values.join(","));
  navigate({ pathname: url.pathname, search: url.search }, { replace: true });
}

function updateParam(
  navigate: ReturnType<typeof useNavigate>,
  key: string,
<<<<<<< HEAD
  val?: string,
=======
  val?: string
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
) {
  const url = new URL(window.location.href);
  if (!val) url.searchParams.delete(key);
  else url.searchParams.set(key, val);
  navigate({ pathname: url.pathname, search: url.search }, { replace: true });
}

/* ========== Hero with big search ========== */
function CoursesHero({
  count,
  q,
  onChange,
  onSubmit,
}: {
  count: number;
  q: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
}) {
  return (
<<<<<<< HEAD
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-200 opacity-20 blur-3xl dark:bg-primary-900/30" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary-200 opacity-20 blur-3xl dark:bg-secondary-900/30" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 py-6 sm:py-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          Curated AI Courses • {count} listed
        </span>

        <h1 className="mt-3 font-hero text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Learn{" "}
          <span className="bg-gradient-to-r from-primary-600 via-pink-600 to-green-600 bg-clip-text text-transparent">
            New skills and get Professional Certificates
          </span>
          .
        </h1>

        <p className="mt-3 max-w-2xl text-gray-700 dark:text-gray-300">
          Hand-picked courses from Coursera, Udemy, fast.ai & more. Filter by
          level, price, and platform—skip the fluff and build real-world skills.
=======
    <section className="relative overflow-hidden">
      {/* Aurora background */}
      <div className="hero-aurora -z-10 absolute inset-x-0 top-0 h-56" />

      <div className="mx-auto max-w-6xl px-3 py-6 sm:py-10">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300/90 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
          Curated AI Courses • {count} listed
        </span>

        <h1 className="mt-3 text-3xl sm:text-5xl leading-tight font-hero font-extrabold tracking-tight text-white">
          Learn <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">New skills and get Professional Certificates</span>.
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          Hand-picked courses from Coursera, Udemy, fast.ai & more. Filter by level, price, and platform—skip the fluff and build real-world skills.
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        </p>

        {/* BIG SEARCH */}
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="relative max-w-3xl">
<<<<<<< HEAD
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
=======
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            <input
              value={q}
              onChange={(e) => onChange(e.target.value)}
              placeholder='Search AI courses (e.g. "prompt engineering", "PyTorch")'
<<<<<<< HEAD
              className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-28 text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700"
=======
              className="w-full pl-12 pr-28 py-3 rounded-2xl bg-slate-900/70 text-slate-100
                         border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl
                         bg-sky-600 text-white font-semibold tap-press"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-3">
<<<<<<< HEAD
          <a
            href="#courses-list"
            className="tap-press rounded-full border-0 bg-gradient-to-r from-primary-600 via-pink-600 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-400/30"
          >
            Start learning now
          </a>
        </div>
=======
           <a
             href="#courses-list"
             className="px-6 py-3 rounded-full font-semibold tap-press
                        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                        text-white shadow-lg shadow-pink-500/30 border-0
                        transform transition-all duration-200
                        hover:-translate-y-1 hover:scale-105
                        focus:outline-none focus:ring-4 focus:ring-purple-400/30
                        animate-pulse"
           >
             Start learning now
           </a>
         </div>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      </div>
    </section>
  );
}

import type { LucideIcon } from "lucide-react";

function PlatformAvatar({ platform }: { platform?: string }) {
  const key = (platform || "").toLowerCase();

<<<<<<< HEAD
=======
  // mặc định
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  let IconComp: LucideIcon = BookOpen;

  if (key.includes("udemy")) {
    IconComp = Sparkles;
  } else if (key.includes("fast.ai") || key.includes("fastai")) {
    IconComp = Cpu;
  } else if (key.includes("kaggle")) {
    IconComp = Layers;
  } else if (key.includes("coursera")) {
    IconComp = PlayCircle;
  } else if (key.includes("deep") || key.includes("ai")) {
    IconComp = Brain;
  }

  return (
    <div
<<<<<<< HEAD
      className="flex items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-600 dark:border-gray-700 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-400"
      style={{ width: 48, height: 48 }}
      aria-label={`${platform || "Course"} icon`}
    >
      <IconComp className="h-6 w-6" aria-hidden />
=======
      className="flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/15 to-blue-500/15 text-sky-300"
      style={{ width: 48, height: 48 }}   // ⟵ giảm kích thước
      aria-label={`${platform || "Course"} icon`}
    >
      <IconComp className="w-6 h-6" aria-hidden />
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
    </div>
  );
}

/* ========== Course card (memo) ========== */
const CourseCard = React.memo(function CourseCard({ c }: { c: Course }) {
  return (
<<<<<<< HEAD
    <article className="group flex flex-col rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80">
      {/* HEADER: icon + title + meta (một hàng) */}
      <div className="flex items-start gap-3">
        <PlatformAvatar platform={c.platform} />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            {c.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> {c.platform}
=======
    <article className="glow-mobile glass-card rounded-2xl border border-white/5 bg-slate-900/70 p-4 flex flex-col">
      {/* HEADER: icon + title + meta (một hàng) */}
      <div className="flex items-start gap-3">
        {/* giảm kích thước icon còn 48 để gọn hơn */}
        <PlatformAvatar platform={c.platform} /* size 48x48 */ />
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-blue-500 [text-shadow:_0.2px_0.2px_0.5px_white]  line-clamp-2">
            {c.title}
          </h3>
          <div className="mt-1 text-xs text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> {c.platform}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              {c.provider ? ` • ${c.provider}` : ""}
            </span>
            {c.level && <span>• {c.level}</span>}
            {c.hours != null && <span>• {c.hours}h</span>}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* DESCRIPTION */}
      {c.tagline && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
=======
      {/* DESCRIPTION: đưa ra ngoài header để full width, lấp khoảng trống dưới icon */}
      {c.tagline && (
        <p className="mt-2 text-sm text-slate-300 line-clamp-2">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          {c.tagline}
        </p>
      )}

      {/* FOOTER giữ nguyên */}
      <div className="mt-3 flex items-center justify-between">
<<<<<<< HEAD
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
=======
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            {c.rating?.toFixed(1) ?? "—"}
          </span>
          {c.students ? (
            <span className="inline-flex items-center gap-1">
<<<<<<< HEAD
              <Users className="h-4 w-4" />{" "}
              {Intl.NumberFormat().format(c.students)}
=======
              <Users className="w-4 h-4" /> {Intl.NumberFormat().format(c.students)}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            </span>
          ) : null}
          {c.price && (
            <span
              className={
                c.price === "Free"
<<<<<<< HEAD
                  ? "rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "rounded-full border border-purple-200 bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
=======
                  ? "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs"
                  : "bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              }
            >
              {c.price}
            </span>
          )}
        </div>

        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
<<<<<<< HEAD
          className="tap-press rounded-full bg-gradient-to-r from-primary-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-pink-700 hover:shadow"
=======
          className="tap-press btn-gradient px-4 py-2 rounded-full text-sm font-semibold"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        >
          View course
        </a>
      </div>
    </article>
  );
});

<<<<<<< HEAD
/* ========== Page ========== */
export default function CoursesPage({
  initial = COURSES,
}: {
  initial?: Course[];
}) {
=======

/* ========== Page ========== */
export default function CoursesPage({ initial = COURSES }: { initial?: Course[] }) {
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

<<<<<<< HEAD
  const [q, setQ] = useState(s(params.get("q")));
  const [platforms, setPlatforms] = useState<string[]>(
    arr(params.get("platform")),
  );
=======
  // state from URL
  const [q, setQ] = useState(s(params.get("q")));
  const [platforms, setPlatforms] = useState<string[]>(arr(params.get("platform")));
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  const [levels, setLevels] = useState<string[]>(arr(params.get("level")));
  const [prices, setPrices] = useState<string[]>(arr(params.get("price")));
  const [sort, setSort] = useState<string>(s(params.get("sort")) || "trending");

  const dq = useDebounce(q, 250);
  const [isPending, startTransition] = useTransition();

<<<<<<< HEAD
  const data = useMemo(() => initial.slice(), [initial]);

  const allPlatforms = useMemo(
    () => Array.from(new Set(data.map((c) => c.platform))).sort(),
    [data],
=======
  // dataset
  const data = useMemo(() => initial.slice(), [initial]);
  // options
  const allPlatforms = useMemo(
    () => Array.from(new Set(data.map((c) => c.platform))).sort(),
    [data]
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  );
  const allLevels = ["Beginner", "Intermediate", "Advanced"];
  const allPrices = ["Free", "Paid"];

<<<<<<< HEAD
=======
  // filter + sort
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  const filtered = useMemo(() => {
    const kw = dq.toLowerCase();

    let list = data.filter((c) => {
      const hitQ =
        !kw ||
        c.title.toLowerCase().includes(kw) ||
        (c.tagline || "").toLowerCase().includes(kw) ||
        (c.provider || "").toLowerCase().includes(kw) ||
        arr(c.tags).some((t) => t.toLowerCase().includes(kw));

      const hitPlat = !platforms.length || platforms.includes(c.platform);
<<<<<<< HEAD
      const hitLevel =
        !levels.length || (!!c.level && levels.includes(c.level));
      const hitPrice =
        !prices.length || (!!c.price && prices.includes(c.price as string));
=======
      const hitLevel = !levels.length || (!!c.level && levels.includes(c.level));
      const hitPrice = !prices.length || (!!c.price && prices.includes(c.price as string));
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

      return hitQ && hitPlat && hitLevel && hitPrice;
    });

<<<<<<< HEAD
    if (sort === "rating")
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "hours")
      list.sort((a, b) => (a.hours ?? 0) - (b.hours ?? 0));
    else if (sort === "students")
      list.sort((a, b) => (b.students ?? 0) - (a.students ?? 0));
=======
    if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "hours") list.sort((a, b) => (a.hours ?? 0) - (b.hours ?? 0));
    else if (sort === "students") list.sort((a, b) => (b.students ?? 0) - (a.students ?? 0));
    // trending: original order
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

    return list;
  }, [data, dq, platforms, levels, prices, sort]);

<<<<<<< HEAD
  const listRef = useRef<HTMLDivElement>(null);

=======
  // anchors
  const listRef = useRef<HTMLDivElement>(null);

  // scroll-to-top FAB
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onS = () => setShowTop(window.scrollY > 320);
    window.addEventListener("scroll", onS, { passive: true });
    return () => window.removeEventListener("scroll", onS);
  }, []);
<<<<<<< HEAD

  const toTop = () => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    try {
      navigator.vibrate?.(10);
    } catch {}
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const toggle = (
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    key: string,
    groupKey: string,
  ) => {
    startTransition(() =>
      setFn((prev) => {
        const next = prev.includes(key)
          ? prev.filter((x) => x !== key)
          : [...prev, key];
        updateParamArray(navigate, groupKey, next);
        return next;
      }),
=======
  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    try { navigator.vibrate?.(10); } catch {}
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  // toggle helpers
  const toggle = (
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    key: string,
    groupKey: string
  ) => {
    startTransition(() =>
      setFn((prev) => {
        const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
        updateParamArray(navigate, groupKey, next);
        return next;
      })
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
    );
  };

  const clearAll = () => {
    startTransition(() => {
<<<<<<< HEAD
      setPlatforms([]);
      setLevels([]);
      setPrices([]);
      setSort("trending");
      setQ("");
=======
      setPlatforms([]); setLevels([]); setPrices([]); setSort("trending"); setQ("");
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      updateParamArray(navigate, "platform", []);
      updateParamArray(navigate, "level", []);
      updateParamArray(navigate, "price", []);
      updateParam(navigate, "sort", undefined);
      updateParam(navigate, "q", undefined);
    });
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
=======
    <div className="min-h-screen">
      {/* HERO with big search */}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      <CoursesHero
        count={filtered.length}
        q={q}
        onChange={(v) => {
          setQ(v);
          updateParam(navigate, "q", v || undefined);
        }}
        onSubmit={() =>
<<<<<<< HEAD
          document
            .getElementById("courses-list")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
=======
          document.getElementById("courses-list")?.scrollIntoView({ behavior: "smooth", block: "start" })
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        }
      />

      {/* Filters */}
<<<<<<< HEAD
      <div id="filters" className="mx-auto max-w-6xl space-y-3 px-3 py-3">
        {platforms.length || levels.length || prices.length || q ? (
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
            {q && (
              <span className="rounded-full border border-primary-200 bg-primary-100 px-2 py-1 text-primary-700 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
=======
      <div id="filters" className="mx-auto max-w-6xl px-3 py-3 space-y-3">
        {(platforms.length || levels.length || prices.length || q) ? (
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
            {q && (
              <span className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                q: “{q}”
              </span>
            )}
            {platforms.map((p) => (
              <button
                key={`pf-${p}`}
                onClick={() => toggle(setPlatforms, p, "platform")}
<<<<<<< HEAD
                className="rounded-full border border-indigo-200 bg-indigo-100 px-2 py-1 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
=======
                className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              >
                {p} ✕
              </button>
            ))}
            {levels.map((lv) => (
              <button
                key={`lv-${lv}`}
                onClick={() => toggle(setLevels, lv, "level")}
<<<<<<< HEAD
                className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
=======
                className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              >
                {lv} ✕
              </button>
            ))}
            {prices.map((pr) => (
              <button
                key={`pr-${pr}`}
                onClick={() => toggle(setPrices, pr, "price")}
<<<<<<< HEAD
                className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
=======
                className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
              >
                {pr} ✕
              </button>
            ))}
            <button
              onClick={clearAll}
<<<<<<< HEAD
              className="ml-auto rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
=======
              className="ml-auto px-3 py-1.5 rounded-full text-xs bg-slate-800 text-slate-200 border border-white/10"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Platform chips */}
<<<<<<< HEAD
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-400">
            Platform
          </div>
=======
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="text-xs font-semibold text-slate-300 mb-2">Platform</div>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          <div className="flex flex-wrap gap-2">
            {allPlatforms.map((p) => {
              const active = platforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => toggle(setPlatforms, p, "platform")}
<<<<<<< HEAD
                  className={`tap-press rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700"
=======
                  className={`tap-press px-3 py-1.5 rounded-full text-xs border ${
                    active
                      ? "border-indigo-400 bg-indigo-500/10 text-indigo-300"
                      : "border-white/10 text-slate-300"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level chips */}
<<<<<<< HEAD
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-400">
            Level
          </div>
=======
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="text-xs font-semibold text-slate-300 mb-2">Level</div>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          <div className="flex flex-wrap gap-2">
            {allLevels.map((lv) => {
              const active = levels.includes(lv);
              return (
                <button
                  key={lv}
                  onClick={() => toggle(setLevels, lv, "level")}
<<<<<<< HEAD
                  className={`tap-press rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700"
=======
                  className={`tap-press px-3 py-1.5 rounded-full text-xs border ${
                    active
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 text-slate-300"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                  }`}
                >
                  {lv}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price chips */}
<<<<<<< HEAD
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-400">
            Price
          </div>
=======
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="text-xs font-semibold text-slate-300 mb-2">Price</div>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          <div className="flex flex-wrap gap-2">
            {allPrices.map((pr) => {
              const active = prices.includes(pr);
              return (
                <button
                  key={pr}
                  onClick={() => toggle(setPrices, pr, "price")}
<<<<<<< HEAD
                  className={`tap-press rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-300"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700"
=======
                  className={`tap-press px-3 py-1.5 rounded-full text-xs border ${
                    active
                      ? "border-amber-400 bg-amber-500/10 text-amber-300"
                      : "border-white/10 text-slate-300"
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                  }`}
                >
                  {pr}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
<<<<<<< HEAD
      <div className="mx-auto max-w-6xl px-3 text-sm text-gray-500 dark:text-gray-400">
=======
      <div className="mx-auto max-w-6xl px-3 text-sm text-slate-400">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        {isPending ? "Updating..." : `${filtered.length} courses`}
      </div>

      {/* List */}
      <div id="courses-list" className="mx-auto max-w-6xl px-3 pb-24">
        <div
          ref={listRef}
<<<<<<< HEAD
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "1000px 800px",
          }}
=======
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1000px 800px" }}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        >
          {filtered.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>

        {filtered.length === 0 && (
<<<<<<< HEAD
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
=======
          <div className="text-center text-slate-400 py-10">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
            No courses matched. Try changing filters.
          </div>
        )}
      </div>

      {/* FAB to top */}
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={toTop}
        className={[
<<<<<<< HEAD
          "fixed right-4 z-50",
          "bottom-[calc(env(safe-area-inset-bottom)+88px)]",
          "md:hidden",
          "h-12 w-12 rounded-full backdrop-blur",
          "bg-white/90 text-gray-900 ring-1 ring-gray-200 shadow-lg",
          "dark:bg-gray-900/85 dark:text-white dark:ring-white/10",
          "transition-all duration-300",
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
          "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500",
        ].join(" ")}
      >
        <ArrowUp className="mx-auto h-5 w-5" />
=======
          "fixed z-50 right-4",
          "bottom-[calc(env(safe-area-inset-bottom)+88px)]",
          "md:hidden",
          "w-12 h-12 rounded-full bg-gray-900/85 text-white backdrop-blur",
          "ring-1 ring-white/10 shadow-lg",
          "transition-all duration-300",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none",
          "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500",
        ].join(" ")}
      >
        <ArrowUp className="w-5 h-5 mx-auto" />
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      </button>
    </div>
  );
}
