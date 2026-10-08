import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** Lightweight hand-rolled SVG charts for Stats. Colors come from CSS variables (theme-aware). */

export function useWidth<T extends HTMLElement>(fallback = 640): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(200, Math.floor(node.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
  values: (number | null)[];
};

const PAD = { top: 10, right: 10, bottom: 24, left: 40 };

function niceCeil(value: number): number {
  if (value <= 0) return 2;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  // Keep the midline tick a whole number for small counts.
  const steps = exp === 1 ? [2, 4, 6, 8, 10] : [1, 2, 3, 4, 5, 6, 8, 10];
  for (const m of steps) {
    if (m * exp >= value) return m * exp;
  }
  return 10 * exp;
}

export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 10000) return `${Math.round(n / 1000)}k`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

function tickIndexes(count: number, width: number, minGap = 78): number[] {
  if (count <= 0) return [];
  const maxTicks = Math.max(2, Math.floor(width / minGap));
  if (count <= maxTicks) return Array.from({ length: count }, (_, i) => i);
  const step = Math.ceil(count / maxTicks);
  const out: number[] = [];
  for (let i = 0; i < count; i += step) out.push(i);
  return out;
}

function Readout({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; color: string; value: string }[];
}) {
  return (
    <div className="chart-readout" aria-live="polite">
      <span className="chart-readout-title">{title}</span>
      {rows.map((r) => (
        <span key={r.label} className="chart-readout-item">
          <span className="chart-swatch" style={{ background: r.color }} aria-hidden="true" />
          {r.label} <strong>{r.value}</strong>
        </span>
      ))}
    </div>
  );
}

function YAxis({
  ticks,
  y,
  width,
  format,
}: {
  ticks: number[];
  y: (v: number) => number;
  width: number;
  format: (v: number) => string;
}) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className={t === 0 ? "chart-zero" : "chart-gridline"}
          />
          <text x={PAD.left - 6} y={y(t)} className="chart-tick" textAnchor="end" dominantBaseline="middle">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

type BarProps = {
  labels: string[];
  tickLabels: string[];
  up: ChartSeries[];
  down?: ChartSeries[];
  height?: number;
  ariaLabel: string;
  summaryTitle?: string;
  emptyText?: string;
  format?: (v: number) => string;
};

/** Stacked bars; optional `down` series stack below zero (e.g. forgotten). */
export function BarChart({
  labels,
  tickLabels,
  up,
  down = [],
  height = 190,
  ariaLabel,
  summaryTitle = "Range total",
  emptyText,
  format = compact,
}: BarProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;
  const sumAt = (series: ChartSeries[], i: number) =>
    series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0);
  let maxUp = 0;
  let maxDown = 0;
  for (let i = 0; i < n; i += 1) {
    maxUp = Math.max(maxUp, sumAt(up, i));
    maxDown = Math.max(maxDown, sumAt(down, i));
  }
  const top = niceCeil(maxUp);
  const bottom = down.length ? (maxDown > 0 ? niceCeil(maxDown) : top * 0.25) : 0;
  const empty = maxUp === 0 && maxDown === 0;
  const plotH = height - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + ((top - v) / (top + bottom)) * plotH;
  const plotW = width - PAD.left - PAD.right;
  const band = n > 0 ? plotW / n : plotW;
  const gap = band > 6 ? Math.min(band * 0.22, 6) : band > 2.5 ? 0.6 : 0;
  const ticks = empty
    ? [0]
    : down.length && maxDown > 0
      ? [-bottom, 0, top / 2, top]
      : [0, top / 2, top];
  const longest = tickLabels.reduce((m, l) => Math.max(m, l.length), 0);
  const xTicks = tickIndexes(n, plotW, Math.max(34, longest * 5.8 + 8));

  const all = [...up, ...down];
  const readRows =
    hover == null
      ? all.map((s) => ({
          label: s.label,
          color: s.color,
          value: format(s.values.reduce<number>((a, v) => a + (v ?? 0), 0)),
        }))
      : all.map((s) => ({ label: s.label, color: s.color, value: format(s.values[hover] ?? 0) }));

  function onMove(clientX: number, target: SVGSVGElement) {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left - PAD.left;
    const i = Math.floor(x / band);
    setHover(i >= 0 && i < n ? i : null);
  }

  return (
    <div className="chart" ref={ref}>
      <Readout title={hover == null ? summaryTitle : labels[hover]} rows={readRows} />
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
        onPointerDown={(e) => onMove(e.clientX, e.currentTarget)}
        onPointerLeave={() => setHover(null)}
      >
        <YAxis ticks={ticks} y={y} width={width} format={(v) => format(Math.abs(v))} />
        {empty ? <EmptyNote width={width} height={height} text={emptyText} /> : null}
        {labels.map((_, i) => {
          const x = PAD.left + i * band + gap / 2;
          const w = Math.max(0.8, band - gap);
          let acc = 0;
          const ups = up.map((s) => {
            const v = s.values[i] ?? 0;
            if (v <= 0) return null;
            const rect = (
              <rect key={s.key} x={x} width={w} y={y(acc + v)} height={y(acc) - y(acc + v)} style={{ fill: s.color }} />
            );
            acc += v;
            return rect;
          });
          let dacc = 0;
          const downs = down.map((s) => {
            const v = s.values[i] ?? 0;
            if (v <= 0) return null;
            const rect = (
              <rect key={s.key} x={x} width={w} y={y(-dacc)} height={y(-(dacc + v)) - y(-dacc)} style={{ fill: s.color }} />
            );
            dacc += v;
            return rect;
          });
          return (
            <g key={i} opacity={hover == null || hover === i ? 1 : 0.45}>
              {ups}
              {downs}
            </g>
          );
        })}
        {xTicks.map((i) => (
          <text
            key={i}
            x={PAD.left + i * band + band / 2}
            y={height - 6}
            className="chart-tick"
            textAnchor="middle"
          >
            {tickLabels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

type LineProps = {
  labels: string[];
  tickLabels: string[];
  series: ChartSeries[];
  height?: number;
  ariaLabel: string;
  stacked?: boolean;
  yMax?: number;
  /** Lower bound of the y axis; "auto" zooms to the data (rounded down to a tenth of yMax). */
  yMin?: number | "auto";
  format?: (v: number) => string;
  /** Readout when not hovering; defaults to the last point. */
  idleTitle?: string;
};

/** Line chart, or stacked area chart when `stacked`. Null values leave gaps. */
export function LineChart({
  labels,
  tickLabels,
  series,
  height = 190,
  ariaLabel,
  stacked = false,
  yMax,
  yMin = 0,
  format = compact,
  idleTitle,
}: LineProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const stackedVals = series.map((_, si) =>
    labels.map((__, i) => {
      if (!stacked) return series[si].values[i];
      let s = 0;
      for (let k = 0; k <= si; k += 1) s += series[k].values[i] ?? 0;
      return s;
    }),
  );
  let max = 0;
  let hasData = false;
  for (const vals of stackedVals) {
    for (const v of vals) {
      if (v == null) continue;
      if (v > max) max = v;
      if (v !== 0 || yMax != null) hasData = true;
    }
  }
  const top = yMax ?? niceCeil(max);
  let floor = 0;
  if (yMin === "auto") {
    let min = Number.POSITIVE_INFINITY;
    for (const vals of stackedVals) for (const v of vals) if (v != null && v < min) min = v;
    const tenth = top / 10;
    floor = Number.isFinite(min) ? Math.max(0, Math.min(top / 2, Math.floor((min - tenth / 2) / tenth) * tenth)) : 0;
  } else floor = yMin;
  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + ((top - Math.max(floor, v)) / (top - floor)) * plotH;
  const xTicks = tickIndexes(n, plotW);

  function linePath(vals: (number | null)[]): string {
    let d = "";
    let pen = false;
    vals.forEach((v, i) => {
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  }

  function areaPath(si: number): string {
    const upper = stackedVals[si].map((v) => v ?? 0);
    const lower = si === 0 ? upper.map(() => floor) : stackedVals[si - 1].map((v) => v ?? 0);
    let d = upper.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    for (let i = n - 1; i >= 0; i -= 1) d += `L${x(i).toFixed(1)},${y(lower[i]).toFixed(1)}`;
    return `${d}Z`;
  }

  const at = hover ?? n - 1;
  const baseRows = series.map((s) => ({
    label: s.label,
    color: s.color,
    value: s.values[at] == null ? "—" : format(s.values[at] as number),
  }));
  // Stacked areas read top-down, matching the visual order.
  const readRows = stacked ? [...baseRows].reverse() : baseRows;

  function onMove(clientX: number, target: SVGSVGElement) {
    if (n === 0) return;
    const rect = target.getBoundingClientRect();
    const px = clientX - rect.left - PAD.left;
    const i = n <= 1 ? 0 : Math.round((px / plotW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  return (
    <div className="chart" ref={ref}>
      <Readout
        title={hover == null ? idleTitle ?? (labels[n - 1] || "") : labels[hover]}
        rows={readRows}
      />
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
        onPointerDown={(e) => onMove(e.clientX, e.currentTarget)}
        onPointerLeave={() => setHover(null)}
      >
        <YAxis
          ticks={hasData ? [floor, (floor + top) / 2, top] : [floor]}
          y={y}
          width={width}
          format={format}
        />
        {hasData ? null : <EmptyNote width={width} height={height} />}
        {stacked
          ? series.map((s, si) => (
              <path key={s.key} d={areaPath(si)} style={{ fill: s.color }} className="chart-area" />
            ))
          : null}
        {series.map((s, si) => (
          <path
            key={s.key}
            d={linePath(stacked ? stackedVals[si] : s.values)}
            style={{ stroke: s.color }}
            className="chart-line"
          />
        ))}
        {hover != null ? (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} className="chart-cursor" />
        ) : null}
        {hover != null
          ? series.map((s, si) => {
              const v = stacked ? stackedVals[si][hover] : s.values[hover];
              if (v == null) return null;
              return <circle key={s.key} cx={x(hover)} cy={y(v)} r={3.5} style={{ fill: s.color }} className="chart-dot" />;
            })
          : null}
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={height - 6} className="chart-tick" textAnchor={i === 0 && n > 1 ? "start" : "middle"}>
            {tickLabels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

function EmptyNote({
  width,
  height,
  text = "Nothing in this range yet",
}: {
  width: number;
  height: number;
  text?: string;
}) {
  return (
    <text
      x={PAD.left + (width - PAD.left - PAD.right) / 2}
      y={PAD.top + (height - PAD.top - PAD.bottom) / 2}
      className="chart-empty"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {text}
    </text>
  );
}

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

/** GitHub/Anki-style calendar heatmap ending today; fits as many weeks as the width allows. */
export function Heatmap({
  counts,
  now,
  maxWeeks = 53,
  unit = "actions",
}: {
  counts: Map<string, number>;
  now: number;
  maxWeeks?: number;
  unit?: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ key: string; label: string; n: number } | null>(null);
  const left = 28;
  const topPad = 16;
  const pitch = Math.max(11, Math.min(16, (width - left) / maxWeeks));
  const cell = pitch - 2.5;
  const weeks = Math.max(8, Math.min(maxWeeks, Math.floor((width - left) / pitch)));
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  let max = 0;
  let total = 0;
  let active = 0;
  const cells: { key: string; x: number; y: number; n: number; future: boolean; date: Date }[] = [];
  const months: { x: number; label: string }[] = [];
  for (let w = 0; w < weeks; w += 1) {
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const future = date.getTime() > today.getTime();
      const n = future ? 0 : counts.get(key) ?? 0;
      if (n > max) max = n;
      total += n;
      if (n > 0) active += 1;
      cells.push({ key, x: left + w * pitch, y: topPad + d * pitch, n, future, date });
      if (d === 0 && date.getDate() <= 7) {
        months.push({ x: left + w * pitch, label: date.toLocaleDateString(undefined, { month: "short" }) });
      }
    }
  }
  const level = (n: number) => {
    if (n <= 0 || max <= 0) return 0;
    const r = n / max;
    return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
  };
  const h = topPad + 7 * pitch + 2;
  return (
    <div className="chart heatmap" ref={ref}>
      <div className="chart-readout" aria-live="polite">
        {hover ? (
          <>
            <span className="chart-readout-title">{hover.label}</span>
            <span className="chart-readout-item">
              <strong>{hover.n}</strong> {unit}
            </span>
          </>
        ) : (
          <>
            <span className="chart-readout-title">Last {weeks} weeks</span>
            <span className="chart-readout-item">
              <strong>{active}</strong> active day{active === 1 ? "" : "s"}
            </span>
            <span className="chart-readout-item">
              <strong>{compact(total)}</strong> {unit}
            </span>
          </>
        )}
      </div>
      <svg width={width} height={h} role="img" aria-label="Daily activity calendar" onPointerLeave={() => setHover(null)}>
        {months.map((m, i) =>
          i === 0 && months[1] && months[1].x - m.x < pitch * 3 ? null : (
            <text key={`${m.label}-${m.x}`} x={m.x} y={10} className="chart-tick">
              {m.label}
            </text>
          ),
        )}
        {WEEKDAY_LABELS.map((l, d) =>
          l ? (
            <text key={l} x={0} y={topPad + d * pitch + cell / 2} className="chart-tick" dominantBaseline="middle">
              {l}
            </text>
          ) : null,
        )}
        {cells.map((c) =>
          c.future ? null : (
            <rect
              key={c.key}
              x={c.x}
              y={c.y}
              width={cell}
              height={cell}
              rx={2}
              className={`heat-cell heat-${level(c.n)}`}
              onPointerEnter={() =>
                setHover({
                  key: c.key,
                  n: c.n,
                  label: c.date.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                })
              }
            />
          ),
        )}
      </svg>
      <div className="heat-legend" aria-hidden="true">
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heat-swatch heat-${l}`} />
        ))}
        More
      </div>
    </div>
  );
}

/** One 100%-wide stacked bar with a legend underneath. */
export function StackBar({
  parts,
}: {
  parts: { key: string; label: string; color: string; value: number; hint?: string }[];
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div className="stackbar-wrap">
      <div className="stackbar" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}>
        {total === 0 ? <span className="stackbar-empty" /> : null}
        {parts.map((p) =>
          p.value > 0 ? (
            <span
              key={p.key}
              style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
              title={`${p.label}: ${p.value}`}
            />
          ) : null,
        )}
      </div>
      <ul className="stackbar-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className="chart-swatch" style={{ background: p.color }} aria-hidden="true" />
            <span className="stackbar-label">
              {p.label}
              {p.hint ? <span className="stackbar-hint">{p.hint}</span> : null}
            </span>
            <span className="stackbar-n">
              {p.value}
              {total > 0 ? <span className="stackbar-pct"> · {Math.round((p.value / total) * 100)}%</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({
  title,
  note,
  children,
  wide = false,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`chart-card${wide ? " wide" : ""}`}>
      <h3 className="chart-title">{title}</h3>
      {note ? <p className="chart-note">{note}</p> : null}
      {children}
    </section>
  );
}
