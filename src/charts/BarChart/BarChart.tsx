import { type FC, useMemo, useState, useCallback } from 'react';
import styles from './BarChart.module.scss';
import type {
  BarChartProps,
  BarChartConfig,
} from './types';

const DEFAULT_CONFIG: Required<
  Omit<BarChartConfig, 'title'>
> & { title?: BarChartConfig['title'] }  = {
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
    barWidthRatio: 0.5,
    gap: 12,
    categoryGap: 24,
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
  legend: {
    enabled: true,
    position: 'bottom',
    fontSize: 12,
    fontFamily: 'sans-serif',
    color: '#334155',
    gap: 16,
    itemGap: 8,
    markerSize: 16,
  },
};

function mergeConfig(custom?: BarChartConfig) {
  if (!custom) return DEFAULT_CONFIG;
  return {
    width: custom.width ?? DEFAULT_CONFIG.width,
    height: custom.height ?? DEFAULT_CONFIG.height,
    backgroundColor: custom.backgroundColor ?? DEFAULT_CONFIG.backgroundColor,
    padding: { ...DEFAULT_CONFIG.padding, ...custom.padding },
    title: custom.title ?? DEFAULT_CONFIG.title,
    axis: { ...DEFAULT_CONFIG.axis, ...custom.axis },
    bar: { ...DEFAULT_CONFIG.bar, ...custom.bar },
    labels: { ...DEFAULT_CONFIG.labels, ...custom.labels },
    tooltip: { ...DEFAULT_CONFIG.tooltip, ...custom.tooltip },
    legend: { ...DEFAULT_CONFIG.legend, ...custom.legend },
  };
}

// ─── Утилиты ─────────────────────────────────────────────────

/** Форматирование числа для меток оси Y */
function formatTick(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export const BarChart: FC<BarChartProps> = ({
  series,
  config: customConfig,
  onBarHover,
  onBarClick,
}) => {
  const cfg = useMemo(() => mergeConfig(customConfig), [customConfig]);
  const [hovered, setHovered] = useState<{ seriesIndex: number; index: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const { padding, axis, bar, height } = cfg;
    const titleHeight = cfg.title?.text ? (cfg.title.fontSize ?? 16) + 16 : 0;

    const chartTop = padding.top + titleHeight;
    const chartBottom = height - padding.bottom;
    const chartLeft = padding.left;
    const chartRight = typeof cfg.width === 'number' ? cfg.width - padding.right : 0;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    // Максимум по всем сериям
    const maxValue = Math.max(
      ...series.flatMap((s) => s.data.map((d) => d.value)),
      0,
    );
    const niceMax = maxValue === 0 ? 10 : Math.ceil(maxValue * 1.1);

    const yTicks = Array.from(
      { length: axis.yTickCount + 1 },
      (_, i) => (niceMax / axis.yTickCount) * i,
    );

    const categoriesCount = series.length > 0 ? series[0].data.length : 0;
    const slotWidth = categoriesCount > 0 ? chartWidth / categoriesCount : 0;

    // Ширина одного бара: слот минус отступы между сериями
    const totalGap = bar.gap * (series.length - 1);
    const barWidth = Math.max((slotWidth - totalGap) / series.length, 2);

    const yScale = (val: number) =>
      chartBottom - (val / niceMax) * chartHeight;

    const xBarPosition = (categoryIndex: number, seriesIndex: number) => {
      const start = chartLeft + categoryIndex * slotWidth + categoryIndex * bar.categoryGap;
      const offset = seriesIndex * barWidth + seriesIndex * bar.gap;
      return start + offset;
    };

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
  }, [cfg, series]);

  const handleBarEnter = useCallback(
    (seriesIndex: number, item: any, index: number, e: React.MouseEvent<SVGElement>) => {
      setHovered({ seriesIndex, index });
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      onBarHover?.(seriesIndex, item, index);
    },
    [onBarHover],
  );

  const handleBarLeave = useCallback(() => setHovered(null), []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleBarClick = useCallback(
    (seriesIndex: number, item: any, index: number) => {
      onBarClick?.(seriesIndex, item, index);
    },
    [onBarClick],
  );

  if (series.length === 0 || (series[0].data.length === 0)) {
    return (
      <div className={styles.empty}>Нет данных для отображения</div>
    );
  }

  const { axis, bar, labels, tooltip, legend } = cfg;

  let tooltipContent: { label: string; value: string } | null = null;
  if (tooltip.enabled && hovered !== null) {
    const s = series[hovered.seriesIndex];
    const item = s.data[hovered.index];
    tooltipContent = {
      label: `${s.name} — ${item.label}`,
      value: formatTick(item.value),
    };
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: legend.position === 'right' || legend.position === 'left' ? 'column' : 'row',
    alignItems: legend.position === 'right' || legend.position === 'bottom' ? 'flex-end' : legend.position === 'left' || legend.position === 'top' ? 'flex-start' : 'center',
    justifyContent: legend.position === 'bottom' || legend.position === 'top' ? 'center' : undefined,
    gap: legend.gap,
    backgroundColor: legend.backgroundColor,
    padding: legend.padding,
    borderRadius: legend.borderRadius,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: legend.itemGap,
  };

  const markerStyle: React.CSSProperties = {
    width: legend.markerSize,
    height: legend.markerSize,
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    fontSize: legend.fontSize,
    fontFamily: legend.fontFamily,
    lineHeight: 1,
    color: legend.color,
  };

  return (
    <div
      className={styles.container}
      style={{ width: cfg.width, height: cfg.height }}
    >
      <svg
        className={styles.svg}
        width={cfg.width}
        height={cfg.height}
        viewBox={`0 0 ${typeof cfg.width === 'number' ? cfg.width : 800} ${cfg.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {cfg.backgroundColor !== 'transparent' && (
          <rect x={0} y={0} width="100%" height={cfg.height} fill={cfg.backgroundColor} />
        )}

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

        {/* Рисуем бары по сериям */}
        {series.map((serie, sIndex) => {
          const serieColor = serie.color ?? bar.color;
          return (
            <g key={`serie-${sIndex}`}>
              {serie.data.map((item, cIndex) => {
                const barHeight = Math.max(geometry.chartBottom - geometry.yScale(item.value), 0);
                const x = geometry.xBarPosition(cIndex, sIndex);
                const y = geometry.yScale(item.value);
                const fillColor = item.color ?? serieColor;
                const isHovered = hovered?.seriesIndex === sIndex && hovered.index === cIndex;

                return (
                  <g
                    key={`bar-${sIndex}-${cIndex}`}
                    className={styles.barGroup}
                    onMouseEnter={(e) => handleBarEnter(sIndex, item, cIndex, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleBarLeave}
                    onClick={() => handleBarClick(sIndex, item, cIndex)}
                    style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={geometry.barWidth}
                      height={barHeight}
                      rx={bar.borderRadius}
                      ry={bar.borderRadius}
                      fill={isHovered ? bar.hoverColor ?? fillColor : fillColor}
                      className={styles.barRect}
                    />

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

                    {/* Подпись категории рисуем только для первой серии */}
                    {sIndex === 0 && labels.showXLabels && (
                      <text
                        x={x + geometry.slotWidth / 2}
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

                    {axis.showXTicks && sIndex === 0 && (
                      <line
                        x1={x + geometry.slotWidth / 2}
                        y1={geometry.chartBottom}
                        x2={x + geometry.slotWidth / 2}
                        y2={geometry.chartBottom + axis.tickLength}
                        stroke={axis.axisColor}
                        strokeWidth={axis.axisWidth}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {legend?.enabled && legend.position === 'bottom' && (
        <div style={containerStyle}>
          {series.map((serie, idx) => {
            const color = serie.color ?? (bar.color && idx < 10 ? bar.color : '#ccc');
            return (
              <div key={`legend-item-${idx}`} style={itemStyle}>
                <span style={{ ...markerStyle, backgroundColor: color }}></span>
                <span style={textStyle}>{serie.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {tooltip.enabled && tooltipContent && (
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
          <span className={styles.tooltipLabel}>{tooltipContent.label}</span>
          <span className={styles.tooltipValue}>{tooltipContent.value}</span>
        </div>
      )}
    </div>
  );
};

export default BarChart;
