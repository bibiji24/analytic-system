import type {
  ChartSeries,
  AxisConfig,
  LegendConfig,
  TooltipConfig,
  LineChartProps,
} from "./types";

/* ---------- Цвета ---------- */

export const DEFAULT_COLORS = [
  "#4f8cff",
  "#ff6b6b",
  "#2dd4a7",
  "#f5a623",
  "#a78bfa",
  "#ec4899",
];

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- Значения по умолчанию ---------- */

export const DEFAULT_AXIS: Required<
  Pick<
    AxisConfig,
    | "tickColor" | "tickFontSize" | "tickFontFamily"
    | "titleColor" | "titleFontSize" | "titleFontFamily"
    | "axisColor" | "axisWidth" | "gridColor"
    | "gridWidth" | "gridDash" | "ticks"
    | "showGrid" | "showAxis"
  >
> = {
  tickColor: "#64748b",
  tickFontSize: 12,
  tickFontFamily: "inherit",
  titleColor: "#334155",
  titleFontSize: 13,
  titleFontFamily: "inherit",
  axisColor: "#cbd5e1",
  axisWidth: 1,
  gridColor: "#e2e8f0",
  gridWidth: 1,
  gridDash: "4 4",
  ticks: 5,
  showGrid: true,
  showAxis: true,
};

export const DEFAULT_LEGEND: Required<
  Pick<
    LegendConfig,
    | "visible" | "position" | "fontSize" | "fontFamily"
    | "color" | "itemGap" | "markerSize"
    | "backgroundColor" | "padding" | "borderRadius"
  >
> = {
  visible: true,
  position: "bottom",
  fontSize: 12,
  fontFamily: "inherit",
  color: "#334155",
  itemGap: 16,
  markerSize: 12,
  backgroundColor: "transparent",
  padding: 4,
  borderRadius: 6,
};

export const DEFAULT_TOOLTIP: Required<
  Pick<
    TooltipConfig,
    | "enabled" | "backgroundColor" | "color"
    | "borderColor" | "borderWidth" | "borderRadius"
    | "fontSize" | "fontFamily" | "padding"
  >
> = {
  enabled: true,
  backgroundColor: "#0f172a",
  color: "#f8fafc",
  borderColor: "#334155",
  borderWidth: 1,
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "inherit",
  padding: 8,
};

export const DEFAULT_PROPS: Required<
  Pick<
    LineChartProps,
    | "width" | "height" | "titleColor" | "titleFontSize"
    | "titleFontFamily" | "titleFontWeight"
    | "backgroundColor" | "smooth" | "showPoints"
  >
> = {
  width: 600,
  height: 360,
  titleColor: "#1e293b",
  titleFontSize: 16,
  titleFontFamily: "inherit",
  titleFontWeight: 600,
  backgroundColor: "#ffffff",
  smooth: 0,
  showPoints: true,
};

/* ---------- Вычисления ---------- */

export function getDomain(
  series: ChartSeries[],
  yMin?: number,
  yMax?: number,
): [number, number] {
  const allValues = series
    .filter((s) => !s.hidden)
    .flatMap((s) => s.data)
    .filter((v): v is number => v !== null && !Number.isNaN(v));

  if (allValues.length === 0) return [yMin ?? 0, yMax ?? 1];

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const padding = range * 0.08;

  const min = yMin ?? (rawMin < 0 ? rawMin - padding : Math.max(0, rawMin - padding));
  const max = yMax ?? rawMax + padding;

  return [min, max];
}

/** Catmull-Rom → кубические кривые Безье */
export function buildLinePath(
  points: { x: number; y: number }[],
  smooth: number,
): string {
  if (points.length === 0) return "";
  if (smooth <= 0 || points.length < 3) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }

  const tension = smooth;
  const segments: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  return segments.join(" ");
}

export function buildAreaPath(
  points: { x: number; y: number }[],
  baseline: number,
  smooth: number,
): string {
  if (points.length === 0) return "";
  const linePath = buildLinePath(points, smooth);
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export function mergeAxis(axis: AxisConfig | undefined) {
  return { ...DEFAULT_AXIS, ...axis };
}
export function mergeLegend(legend: LegendConfig | undefined) {
  return { ...DEFAULT_LEGEND, ...legend };
}
export function mergeTooltip(tooltip: TooltipConfig | undefined) {
  return { ...DEFAULT_TOOLTIP, ...tooltip };
}
