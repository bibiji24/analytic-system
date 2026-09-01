import type { CSSProperties, ReactNode } from "react";

/** Данные одного ряда */
export interface ChartSeries {
  id: string;
  label: string;
  data: (number | null)[];
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  pointRadius?: number;
  dash?: string;
  fill?: boolean;
  hidden?: boolean;
}

/** Настройки оси */
export interface AxisConfig {
  tickColor?: string;
  tickFontSize?: number;
  tickFontFamily?: string;
  titleColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  axisColor?: string;
  axisWidth?: number;
  gridColor?: string;
  gridWidth?: number;
  gridDash?: string;
  ticks?: number;
  title?: string;
  showGrid?: boolean;
  showAxis?: boolean;
}

/** Настройки легенды */
export interface LegendConfig {
  visible?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  itemGap?: number;
  markerSize?: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

/** Настройки тултипа */
export interface TooltipConfig {
  enabled?: boolean;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
}

/** Пропсы компонента */
export interface LineChartProps {
  series: ChartSeries[];
  labels?: string[];
  width?: number;
  height?: number;
  title?: string;
  titleColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  titleFontWeight?: CSSProperties["fontWeight"];
  backgroundColor?: string;
  padding?: Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  yMin?: number;
  yMax?: number;
  smooth?: number;
  showPoints?: boolean;
  className?: string;
  children?: ReactNode;
}
