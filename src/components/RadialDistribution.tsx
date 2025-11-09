import { useEffect, useMemo, useRef, useState } from "react";

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function pathArc(
  cx: number, cy: number, r: number,
  start: number, sweep: number, thickness: number
) {
  const end = start + sweep;
  const innerR = r - thickness;
  const p1 = polarToXY(cx, cy, r, end);
  const p2 = polarToXY(cx, cy, r, start);
  const p3 = polarToXY(cx, cy, innerR, start);
  const p4 = polarToXY(cx, cy, innerR, end);
  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export default function RadialDistribution({
  data,
  size = 440,
  thickness = 70,
  gapDeg = 5,
  centerImageUrl,
  onSliceClick,
  showChips = true,          // NEW: hiện chip dự phòng dưới biểu đồ trên mobile
  coachmarkOnce = true       // NEW: coachmark lần đầu cho pointer:coarse
}: {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  thickness?: number;
  gapDeg?: number;
  centerImageUrl?: string;
  onSliceClick?: (info: { label: string; value: number; index: number }) => void;
  showChips?: boolean;
  coachmarkOnce?: boolean;
}) {
  const total = Math.max(1, data.reduce((s, d) => s + (d.value || 0), 0));
  const cx = size / 2, cy = size / 2;
  const r = (size / 2) - 4;
  const palette = ["#f43f5e","#f59e0b","#10b981","#22c55e","#3b82f6","#a855f7","#eab308","#14b8a6"];

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [tip, setTip] = useState<{x:number;y:number;label:string;value:number} | null>(null);
  const [showHint, setShowHint] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Build arcs
  const arcs = useMemo(() => {
    let cursor = 220; // start angle giữ nguyên phong cách hiện tại
    return data.map((d, i) => {
      const sweep = (d.value / total) * 360 - gapDeg;
      const start = cursor + gapDeg / 2;
      cursor += (d.value / total) * 360;
      return { start, sweep: Math.max(0, sweep), color: d.color ?? palette[i % palette.length] };
    });
  }, [data, total, gapDeg]);

  // Coachmark lần đầu cho thiết bị pointer: coarse
  useEffect(() => {
    if (!coachmarkOnce) return;
    const isCoarse = typeof window !== "undefined" && matchMedia && matchMedia("(pointer: coarse)").matches;
    const key = "rd_affordance_hint_shown";
    if (isCoarse && !localStorage.getItem(key)) {
      setShowHint(true);
      const t = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem(key, "1");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [coachmarkOnce]);

  const pick = (index: number) => {
    const item = data[index];
    if (!item) return;
    setActiveIdx(index);
    try { if (navigator?.vibrate) navigator.vibrate(12); } catch {}
    const perc = Math.round((item.value / total) * 100);
    onSliceClick?.({ label: item.label, value: perc, index });
    // thả highlight sau 700ms để tránh kẹt
    setTimeout(() => setActiveIdx(null), 700);
  };

  const onSlicePointer = (i: number) => () => pick(i);

  const centerLabel = (() => {
    const i = activeIdx ?? hoverIdx;
    if (i == null) return null;
    const perc = Math.round((data[i].value / total) * 100);
    return (
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ width: size * 0.5 }}
      >
        <div className="font-semibold text-white text-sm">{data[i].label}</div>
        <div className="text-xs text-gray-300">{perc}%</div>
      </div>
    );
  })();

  return (
    <div
      ref={wrapRef}
      className="relative select-none"
      style={{
        width: size, height: size,
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent"
      }}
      aria-label="Interactive donut chart"
      role="group"
    >
      {/* Coachmark vòng sáng lần đầu cho mobile */}
      {showHint && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-40 h-40 rounded-full animate-ping bg-white/10" />
          <div className="absolute bottom-3 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold">
            Tap any slice to filter
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${size} ${size}`} className="block">
        {/* nền donut */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(15,23,42,0.6)" />

        {/* từng lát */}
        {arcs.map((a, i) => {
          const d = pathArc(cx, cy, r, a.start, a.sweep, thickness);
          const perc = Math.round((data[i].value / total) * 100);
          const isHot = hoverIdx === i || activeIdx === i;
          return (
            <path
              key={i}
              d={d}
              fill={a.color}
              opacity={isHot ? 1 : 0.9}
              stroke="rgba(15,23,42,0.85)"
              strokeWidth={isHot ? 4 : 6}
              className="cursor-pointer"
              role="button"
              aria-label={`${perc}% ${data[i].label}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => { setHoverIdx(null); setTip(null); }}
              onMouseMove={(e) => {
                const box = wrapRef.current?.getBoundingClientRect();
                if (!box) return;
                setTip({ x: e.clientX - box.left, y: e.clientY - box.top, label: data[i].label, value: perc });
              }}
              onClick={onSlicePointer(i)}
              onTouchStart={onSlicePointer(i)}
              onPointerUp={onSlicePointer(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pick(i); }}
              tabIndex={0}
            >
              <title>{`${perc}% ${data[i].label}`}</title>
            </path>
          );
        })}
      </svg>

      {/* logo giữa giữ nguyên nếu có */}
      {centerImageUrl && (
        <img
          src={centerImageUrl}
          alt="center"
          className="absolute rounded-full"
          style={{
            left: "50%", top: "50%",
            width: size * 0.26, height: size * 0.26,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 8px rgba(2,6,23,0.6)"
          }}
          draggable={false}
        />
      )}

      {/* label giữa khi chạm */}
      {centerLabel}

      {/* Tooltip khi hover desktop */}
      {tip && (
        <div
          className="absolute z-10 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs shadow-lg cursor-pointer"
          style={{
            left: Math.min(size - 10, Math.max(10, tip.x + 12)),
            top:  Math.min(size - 10, Math.max(10, tip.y + 12)),
            whiteSpace: "nowrap"
          }}
          onClick={() => {
            if (hoverIdx != null) pick(hoverIdx);
          }}
        >
          <div className="font-semibold">{tip.value}%</div>
          <div className="text-gray-300">{tip.label}</div>
        </div>
      )}

      {/* Chip dự phòng cho mobile */}
      {showChips && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full px-1 sm:hidden">
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar justify-center">
            {data.map((it, i) => (
              <button
                key={it.label}
                onClick={() => pick(i)}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border border-zinc-200/60 bg-white/5 text-white"
                style={{
                  outline: activeIdx === i ? `2px solid ${arcs[i].color}` : "none",
                  boxShadow: activeIdx === i ? "0 0 0 2px rgba(255,255,255,.2)" : "none"
                }}
                aria-label={`Filter by ${it.label}`}
              >
                {it.label} {it.value > 0 ? `• ${it.value}` : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
