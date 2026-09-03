export interface BarChartDataSet {
  /** Метка по оси X */
  label: string;
  /** Значение бара */
  value: number;
  /** Индивидуальный цвет бара (опционально — перекрывает общий) */
  color?: string;
}

export interface BarChartSeries {
  name: string;           // название серии, например «Продажи», «План»
  data: BarChartDataSet[];
  color?: string;         // общий цвет всей серии (перекрывается color в data)
}

export interface AxisConfig {
  /** Цвет линий осей */
  axisColor?: string;
  /** Толщина линий осей, px */
  axisWidth?: number;
  /** Показывать ось X */
  showXAxis?: boolean;
  /** Показывать ось Y */
  showYAxis?: boolean;
  /** Цвет меток делений на оси */
  tickColor?: string;
  /** Размер шрифта меток делений, px */
  tickFontSize?: number;
  /** Шрифт меток делений */
  tickFontFamily?: string;
  /** Толщина линий сетки, px */
  gridLineWidth?: number;
  /** Цвет линий сетки */
  gridLineColor?: string;
  /** Показывать сетку */
  showGrid?: boolean;
  /** Показывать метки делений на оси X */
  showXTicks?: boolean;
  /** Показывать метки делений на оси Y */
  showYTicks?: boolean;
  /** Количество делений на оси Y */
  yTickCount?: number;
  /** Длина деления, px */
  tickLength?: number;
  /** Отступ меток от оси, px */
  tickPadding?: number;

  titleColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  gridColor?: string;
  gridWidth?: number;
  gridDash?: string;
  ticks?: number;
  showAxis?: boolean;
}

export interface BarChartBarConfig {
  /** Базовый цвет всех баров */
  color?: string;
  /** Цвет при наведении */
  hoverColor?: string;
  /** Скругление углов, px */
  borderRadius?: number;
  /** Ширина бара в долях от слота (0–1) */
  barWidthRatio?: number;
  /** Отступ между барами, px */
  gap?: number;
  /** Отступ между категориями */
  categoryGap?: number;
}

export interface BarChartLabelConfig {
  /** Показывать подписи значений над барами */
  showValues?: boolean;
  /** Цвет подписей значений */
  valueColor?: string;
  /** Размер шрифта подписей значений, px */
  valueFontSize?: number;
  /** Шрифт подписей значений */
  valueFontFamily?: string;
  /** Показывать подписи по оси X */
  showXLabels?: boolean;
  /** Цвет подписей оси X */
  xLabelColor?: string;
  /** Размер шрифта подписей оси X, px */
  xLabelFontSize?: number;
  /** Шрифт подписей оси X */
  xLabelFontFamily?: string;
  /** Угол наклона подписей оси X, градусы */
  xLabelRotation?: number;
}

export interface TooltipConfig {
  /** Показывать тултип при наведении */
  enabled?: boolean;
  /** Фон тултипа */
  backgroundColor?: string;
  /** Цвет текста тултипа */
  textColor?: string;
  /** Размер шрифта тултипа, px */
  fontSize?: number;
  /** Шрифт тултипа */
  fontFamily?: string;
  /** Скругление углов тултипа, px */
  borderRadius?: number;
  /** Внутренний отступ, px */
  padding?: number;

  color?: string;

  borderColor?: string;
  borderWidth?: number;
}

export interface BarChartConfig {
  /** Ширина холста, px (или 100% для адаптива) */
  width?: number | string;
  /** Высота холста, px */
  height?: number;
  /** Цвет фона графика */
  backgroundColor?: string;
  /** Внутренние отступы, px */
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** Заголовок графика */
  title?: {
    text: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
  };
  /** Конфигурация осей и сетки */
  axis?: AxisConfig;
  /** Конфигурация баров */
  bar?: BarChartBarConfig;
  /** Конфигурация подписей */
  labels?: BarChartLabelConfig;
  /** Конфигурация тултипа */
  tooltip?: TooltipConfig;
  legend?: BarChartLegendConfig;
}

export interface BarChartProps {
  /** Данные для отрисовки */
  series: BarChartSeries[];
  /** Конфигурация визуала */
  config?: BarChartConfig;
  /** Callback при наведении на бар */
  onBarHover?: (seriesIndex: number, item: BarChartDataSet, index: number) => void;
  /** Callback при клике на бар */
  onBarClick?: (seriesIndex: number, item: BarChartDataSet, index: number) => void;

  titleColor?: string;
  titleFontSize?: number;
  titleFontWeight?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  titleFontFamily?: string;
  stacked?: boolean;
  horizontal?: boolean;
}

export interface BarChartLegendConfig {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'right' | 'left'; // пока используем bottom
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  gap?: number;        // отступ между элементами легенды
  itemGap?: number;    // отступ внутри элемента (между цветом и текстом)
  markerSize?: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}