import { useEffect, useRef, useState } from "react";

export interface DailyPoint {
  date: string; // YYYY-MM-DD (UTC)
  value: number;
}

interface Props {
  data: DailyPoint[];
  /** Tên chỉ số, dùng trong tooltip và bảng cho trình đọc màn hình */
  metricLabel: string;
  height?: number;
}

const PAD = { top: 12, right: 8, bottom: 24, left: 36 };
const GAP = 2; // khoảng hở giữa các cột
const RADIUS = 4; // bo góc đầu cột

const fmtDay = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v) ?? pow * 10;
  return step * 4;
}

/** Cột có đầu bo tròn, chân phẳng nằm trên đường gốc */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function DailyBarChart({ data, metricLabel, height = 220 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.max(1, band - GAP);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const labelIdx = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);
  const hovered = hover !== null ? data[hover] : null;

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label={`${metricLabel} per day`} className="block">
        {/* Lưới & trục: nhạt, không tranh với dữ liệu */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? "stroke-gray-300 dark:stroke-gray-600" : "stroke-gray-100 dark:stroke-gray-800"}
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-500 dark:fill-gray-400 text-[11px] tabular-nums">
              {Number.isInteger(t) ? t : t.toFixed(1)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + i * band + GAP / 2;
          const h = (d.value / max) * innerH;
          return (
            <g key={d.date}>
              {h > 0 && (
                <path
                  d={barPath(x, y(d.value), barW, h)}
                  className={`fill-[#2a78d6] dark:fill-[#3987e5] transition-opacity ${hover !== null && hover !== i ? "opacity-50" : ""}`}
                />
              )}
              {labelIdx.has(i) && (
                <text
                  x={x + barW / 2}
                  y={height - 6}
                  textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                  className="fill-gray-500 dark:fill-gray-400 text-[11px]"
                >
                  {fmtDay(d.date)}
                </text>
              )}
              {/* Vùng hover cao hết biểu đồ, rộng cả băng — lớn hơn cột để dễ trỏ */}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(Math.max(PAD.left + hover * band + band / 2, 60), width - 60),
            top: Math.max(y(hovered.value) - 8, 40),
          }}
        >
          <div className="text-gray-500 dark:text-gray-400">{fmtDay(hovered.date)}</div>
          <div className="font-semibold text-gray-900 dark:text-white tabular-nums">
            {hovered.value.toLocaleString()} {metricLabel.toLowerCase()}
          </div>
        </div>
      )}

      {/* Bảng dữ liệu cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>{metricLabel} per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
