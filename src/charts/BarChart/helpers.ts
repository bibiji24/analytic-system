import type { BarChartSeries, AxisConfig, BarChartLegendConfig, TooltipConfig, BarChartProps } from "./types";

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
    BarChartLegendConfig,
    | "enabled" | "position" | "fontSize" | "fontFamily"
    | "color" | "itemGap" | "gap" | "markerSize"
    | "backgroundColor" | "padding" | "borderRadius"
  >
> = {
  enabled: true,
  position: "bottom",
  fontSize: 12,
  fontFamily: "inherit",
  color: "#334155",
  itemGap: 16,
  gap: 32,
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
    BarChartProps,
    | "width" | "height" | "titleColor" | "titleFontSize"
    | "titleFontFamily" | "titleFontWeight" | "backgroundColor"
    | "stacked" | "horizontal"
  >
> = {
  width: 600,
  height: 360,
  titleColor: "#1e293b",
  titleFontSize: 16,
  titleFontFamily: "inherit",
  titleFontWeight: 600,
  backgroundColor: "#ffffff",
  stacked: false,
  horizontal: false,
};

export function getDomain(
  series: BarChartSeries[],
  yMin?: number,
  yMax?: number,
): [number, number] {
  // Для stacked: суммируем по категориям
  const allValues = series
    .map((s) => s.data)
    .reduce((acc, data) => {
      data.forEach((v, i) => {
        acc[i] = (acc[i] ?? 0) + (typeof v === "number" ? v : 0);
      });
      return acc;
    }, [] as number[]);

  if (allValues.length === 0) return [yMin ?? 0, yMax ?? 1];

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const padding = range * 0.08;

  const min = yMin ?? (rawMin < 0 ? rawMin - padding : Math.max(0, rawMin - padding));
  const max = yMax ?? rawMax + padding;

  return [min, max];
}

export function mergeAxis(axis: AxisConfig | undefined) {
  return { ...DEFAULT_AXIS, ...axis };
}
export function mergeLegend(legend: BarChartLegendConfig | undefined) {
  return { ...DEFAULT_LEGEND, ...legend };
}
export function mergeTooltip(tooltip: TooltipConfig | undefined) {
  return { ...DEFAULT_TOOLTIP, ...tooltip };
}
