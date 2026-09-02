import { type FC, useMemo, useState, useCallback } from 'react';
import styles from './BarChart.module.scss';
import type {
  BarChartProps,
  BarChartDataSet,
  BarChartConfig,
} from './types';

// ─── Значения по умолчанию ───────────────────────────────────

const DEFAULT_CONFIG: Required<
  Omit<BarChartConfig, 'title'>
> & { title?: BarChartConfig['title'] } = {
  width: '100%',
  height: 320,
  backgroundColor: 'transparent',
  padding: { top: 20, right: 20, bottom: 40, left: 48 },
  title: undefined,
  axis: {
    axisColor: '#cbd5e1',
    axisWidth: 1,
    showXAxis: true,
    showYAxis: true,
    tickColor: '#94a3b8',
    tickFontSize: 11,
    tickFontFamily: 'sans-serif',
    gridLineWidth: 1,
    gridLineColor: '#e2e8f0',
    showGrid: true,
    showXTicks: true,
    showYTicks: true,
    yTickCount: 5,
    tickLength: 6,
    tickPadding: 8,
  },
  bar: {
    color: '#6366f1',
    hoverColor: '#818cf8',
    borderRadius: 6,
    barWidthRatio: 0.7,
    gap: 12,
  },
  labels: {
    showValues: true,
    valueColor: '#475569',
    valueFontSize: 11,
    valueFontFamily: 'sans-serif',
    showXLabels: true,
    xLabelColor: '#64748b',
    xLabelFontSize: 12,
    xLabelFontFamily: 'sans-serif',
    xLabelRotation: 0,
  },
  tooltip: {
    enabled: true,
    backgroundColor: '#1e293b',
    textColor: '#f1f5f9',
    fontSize: 12,
    fontFamily: 'sans-serif',
    borderRadius: 8,
    padding: 8,
  },
};

/** Глубокое слияние конфига с дефолтами */
function mergeConfig(
  custom?: BarChartConfig,
): typeof DEFAULT_CONFIG {
  if (!custom) return DEFAULT_CONFIG;

  return {
    width: custom.width ?? DEFAULT_CONFIG.width,
    height: custom.height ?? DEFAULT_CONFIG.height,
    backgroundColor:
      custom.backgroundColor ?? DEFAULT_CONFIG.backgroundColor,
    padding: { ...DEFAULT_CONFIG.padding, ...custom.padding },
    title: custom.title ?? DEFAULT_CONFIG.title,
    axis: { ...DEFAULT_CONFIG.axis, ...custom.axis },
    bar: { ...DEFAULT_CONFIG.bar, ...custom.bar },
    labels: { ...DEFAULT_CONFIG.labels, ...custom.labels },
    tooltip: { ...DEFAULT_CONFIG.tooltip, ...custom.tooltip },
  };
}

// ─── Утилиты ─────────────────────────────────────────────────

/** Форматирование числа для меток оси Y */
function formatTick(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// ─── Компонент ───────────────────────────────────────────────

const BarChart: FC<BarChartProps> = ({
  data,
  config: customConfig,
  onBarHover,
  onBarClick,
}) => {
  const cfg = useMemo(() => mergeConfig(customConfig), [customConfig]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Вычисляем геометрию
  const geometry = useMemo(() => {
    const { padding, axis, bar, height, labels } = cfg;
    const titleHeight = cfg.title?.text
      ? (cfg.title.fontSize ?? 16) + 16
      : 0;

    const chartTop = padding.top + titleHeight;
    const chartBottom = height - padding.bottom;
    const chartLeft = padding.left;
    const chartRight = typeof cfg.width === 'number' ? cfg.width - padding.right : 0;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const maxValue = Math.max(...data.data.map((d) => d.value), 0);
    const niceMax = maxValue === 0 ? 10 : Math.ceil(maxValue * 1.1);

    const yTicks = Array.from(
      { length: axis.yTickCount + 1 },
      (_, i) => (niceMax / axis.yTickCount) * i,
    );

    const slotWidth = data.data.length > 0
      ? chartWidth / data.data.length
      : 0;
    const barWidth = Math.max(slotWidth * bar.barWidthRatio - bar.gap * 0.5, 2);

    const yScale = (val: number) =>
      chartBottom - (val / niceMax) * chartHeight;

    const xBarPosition = (index: number) =>
      chartLeft + index * slotWidth + (slotWidth - barWidth) / 2;

    return {
      chartTop,
      chartBottom,
      chartLeft,
      chartRight,
      chartWidth,
      chartHeight,
      niceMax,
      yTicks,
      slotWidth,
      barWidth,
      yScale,
      xBarPosition,
      titleHeight,
    };
  }, [cfg, data]);

  // ── Обработчики ──

  const handleBarEnter = useCallback(
    (item: BarChartDataSet, index: number, e: React.MouseEvent<SVGElement>) => {
      setHoveredIndex(index);
      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      onBarHover?.(item, index);
    },
    [onBarHover],
  );

  const handleBarLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleBarClick = useCallback(
    (item: BarChartDataSet, index: number) => {
      onBarClick?.(item, index);
    },
    [onBarClick],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [],
  );

  if (data.data.length === 0) {
    return (
      <div className={styles.empty}>
        Нет данных для отображения
      </div>
    );
  }

  const { axis, bar, labels, tooltip } = cfg;

  return (
    <div
      className={styles.container}
      style={{ width: cfg.width, height: cfg.height }}
    >
      <svg
        className={styles.svg}
        width={cfg.width}
        height={cfg.height}
        viewBox={`0 0 ${
          typeof cfg.width === 'number' ? cfg.width : 800
        } ${cfg.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Фон */}
        {cfg.backgroundColor !== 'transparent' && (
          <rect
            x={0}
            y={0}
            width="100%"
            height={cfg.height}
            fill={cfg.backgroundColor}
          />
        )}

        {/* Заголовок */}
        {cfg.title?.text && (
          <text
            x={cfg.padding.left}
            y={cfg.padding.top + (cfg.title.fontSize ?? 16)}
            fill={cfg.title.color ?? '#1e293b'}
            fontSize={cfg.title.fontSize ?? 16}
            fontFamily={cfg.title.fontFamily ?? 'sans-serif'}
            fontWeight={cfg.title.fontWeight ?? 600}
          >
            {cfg.title.text}
          </text>
        )}

        {/* Сетка (горизонтальные линии) */}
        {axis.showGrid &&
          geometry.yTicks.map((tick, i) => {
            const y = geometry.yScale(tick);
            return (
              <line
                key={`grid-${i}`}
                x1={geometry.chartLeft}
                y1={y}
                x2={geometry.chartRight}
                y2={y}
                stroke={axis.gridLineColor}
                strokeWidth={axis.gridLineWidth}
                strokeDasharray={i === 0 ? '0' : '4 4'}
              />
            );
          })}

        {/* Ось Y */}
        {axis.showYAxis && (
          <line
            x1={geometry.chartLeft}
            y1={geometry.chartTop}
            x2={geometry.chartLeft}
            y2={geometry.chartBottom}
            stroke={axis.axisColor}
            strokeWidth={axis.axisWidth}
          />
        )}

        {/* Метки и деления оси Y */}
        {axis.showYTicks &&
          geometry.yTicks.map((tick, i) => {
            const y = geometry.yScale(tick);
            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={geometry.chartLeft - axis.tickLength}
                  y1={y}
                  x2={geometry.chartLeft}
                  y2={y}
                  stroke={axis.axisColor}
                  strokeWidth={axis.axisWidth}
                />
                <text
                  x={geometry.chartLeft - axis.tickLength - axis.tickPadding}
                  y={y + axis.tickFontSize / 3}
                  textAnchor="end"
                  fill={axis.tickColor}
                  fontSize={axis.tickFontSize}
                  fontFamily={axis.tickFontFamily}
                >
                  {formatTick(tick)}
                </text>
              </g>
            );
          })}

        {/* Ось X */}
        {axis.showXAxis && (
          <line
            x1={geometry.chartLeft}
            y1={geometry.chartBottom}
            x2={geometry.chartRight}
            y2={geometry.chartBottom}
            stroke={axis.axisColor}
            strokeWidth={axis.axisWidth}
          />
        )}

        {/* Бары */}
        {data.data.map((item, i) => {
          const barHeight = Math.max(
            geometry.chartBottom - geometry.yScale(item.value),
            0,
          );
          const x = geometry.xBarPosition(i);
          const y = geometry.yScale(item.value);
          const fillColor = item.color ?? bar.color;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={`bar-${i}`}
              className={styles.barGroup}
              onMouseEnter={(e) => handleBarEnter(item, i, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleBarLeave}
              onClick={() => handleBarClick(item, i)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={y}
                width={geometry.barWidth}
                height={barHeight}
                rx={bar.borderRadius}
                ry={bar.borderRadius}
                fill={isHovered ? bar.hoverColor : fillColor}
                className={styles.barRect}
              />

              {/* Подпись значения над баром */}
              {labels.showValues && (
                <text
                  x={x + geometry.barWidth / 2}
                  y={y - axis.tickPadding / 2}
                  textAnchor="middle"
                  fill={labels.valueColor}
                  fontSize={labels.valueFontSize}
                  fontFamily={labels.valueFontFamily}
                  className={styles.valueLabel}
                >
                  {formatTick(item.value)}
                </text>
              )}

              {/* Подпись по оси X */}
              {labels.showXLabels && (
                <text
                  x={x + geometry.barWidth / 2}
                  y={geometry.chartBottom + axis.tickLength + axis.tickPadding + labels.xLabelFontSize}
                  textAnchor="middle"
                  fill={labels.xLabelColor}
                  fontSize={labels.xLabelFontSize}
                  fontFamily={labels.xLabelFontFamily}
                  transform={
                    labels.xLabelRotation !== 0
                      ? `rotate(${labels.xLabelRotation} ${x + geometry.barWidth / 2} ${geometry.chartBottom + axis.tickLength + axis.tickPadding + labels.xLabelFontSize})`
                      : undefined
                  }
                >
                  {item.label}
                </text>
              )}

              {/* Деление на оси X под баром */}
              {axis.showXTicks && (
                <line
                  x1={x + geometry.barWidth / 2}
                  y1={geometry.chartBottom}
                  x2={x + geometry.barWidth / 2}
                  y2={geometry.chartBottom + axis.tickLength}
                  stroke={axis.axisColor}
                  strokeWidth={axis.axisWidth}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Тултип */}
      {tooltip.enabled && hoveredIndex !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: mousePos.x,
            top: mousePos.y,
            backgroundColor: tooltip.backgroundColor,
            color: tooltip.textColor,
            fontSize: tooltip.fontSize,
            fontFamily: tooltip.fontFamily,
            borderRadius: tooltip.borderRadius,
            padding: tooltip.padding,
          }}
        >
          <span className={styles.tooltipLabel}>
            {data.data[hoveredIndex].label}
          </span>
          <span className={styles.tooltipValue}>
            {data.data[hoveredIndex].value}
          </span>
        </div>
      )}
    </div>
  );
};

export default BarChart;
