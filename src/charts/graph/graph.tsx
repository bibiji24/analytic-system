import {
  useMemo,
  useState,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import type { LineChartProps, ChartSeries } from "./types";
import {
  DEFAULT_COLORS,
  DEFAULT_PROPS,
  hexToRgba,
  buildLinePath,
  buildAreaPath,
  getDomain,
  mergeAxis,
  mergeLegend,
  mergeTooltip,
} from "./helpers";
import styles from "./graph.module.scss";

export function LineChart(props: LineChartProps) {
  const {
    series,
    labels = [],
    width = DEFAULT_PROPS.width,
    height = DEFAULT_PROPS.height,
    title,
    titleColor = DEFAULT_PROPS.titleColor,
    titleFontSize = DEFAULT_PROPS.titleFontSize,
    titleFontFamily = DEFAULT_PROPS.titleFontFamily,
    titleFontWeight = DEFAULT_PROPS.titleFontWeight,
    backgroundColor = DEFAULT_PROPS.backgroundColor,
    padding = {},
    yMin,
    yMax,
    smooth = DEFAULT_PROPS.smooth,
    showPoints = DEFAULT_PROPS.showPoints,
    className,
    children,
  } = props;

  const xAxisCfg = useMemo(() => mergeAxis(props.xAxis), [props.xAxis]);
  const yAxisCfg = useMemo(() => mergeAxis(props.yAxis), [props.yAxis]);
  const legendCfg = useMemo(() => mergeLegend(props.legend), [props.legend]);
  const tooltipCfg = useMemo(() => mergeTooltip(props.tooltip), [props.tooltip]);

  /* ---------- Скрытие рядов через легенду ---------- */
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleSeries = useMemo(
    () =>
      series
        .map((s, i) => ({
          ...s,
          color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          strokeWidth: s.strokeWidth ?? 2,
          pointRadius: s.pointRadius ?? (showPoints ? 3.5 : 0),
          hidden: s.hidden || hiddenIds.has(s.id),
        }))
        .filter((s) => !s.hidden) as (ChartSeries & {
          color: string;
          strokeWidth: number;
          pointRadius: number;
          hidden: boolean;
        })[],
    [series, hiddenIds, showPoints],
  );

  /* ---------- Геометрия ---------- */
  const pad = {
    top: padding.top ?? (title ? 36 : 16),
    right: padding.right ?? 24,
    bottom: padding.bottom ?? 36,
    left: padding.left ?? 48,
  };

  const legendVertical =
    legendCfg.position === "left" || legendCfg.position === "right";

  const innerW =
    width - pad.left - pad.right - (legendCfg.visible && legendVertical ? 120 : 0);
  const innerH = height - pad.top - pad.bottom;

  const [domainMin, domainMax] = useMemo(
    () => getDomain(series, yMin, yMax),
    [series, yMin, yMax],
  );

  const dataLen = visibleSeries[0]?.data.length ?? 0;

  const xScale = useCallback(
    (i: number) =>
      pad.left + (dataLen <= 1 ? innerW / 2 : (i / (dataLen - 1)) * innerW),
    [pad.left, innerW, dataLen],
  );

  const yScale = useCallback(
    (val: number) =>
      pad.top + innerH - ((val - domainMin) / (domainMax - domainMin || 1)) * innerH,
    [pad.top, innerH, domainMin, domainMax],
  );

  /* ---------- Тики Y ---------- */
  const yTicks = useMemo(() => {
    const arr: { value: number; y: number }[] = [];
    for (let i = 0; i <= yAxisCfg.ticks; i++) {
      const v = domainMin + ((domainMax - domainMin) / yAxisCfg.ticks) * i;
      arr.push({ value: v, y: yScale(v) });
    }
    return arr;
  }, [domainMin, domainMax, yAxisCfg.ticks, yScale]);

  /* ---------- Тултип ---------- */
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    idx: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!tooltipCfg.enabled || dataLen === 0) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;

      const idx = Math.round(((x - pad.left) / innerW) * (dataLen - 1));
      if (idx < 0 || idx >= dataLen) {
        setHover(null);
        return;
      }

      const cx = xScale(idx);
      let cy = pad.top;
      for (const s of visibleSeries) {
        const v = s.data[idx];
        if (v !== null) {
          cy = yScale(v);
          break;
        }
      }
      setHover({ x: cx, y: cy, idx });
    },
    [tooltipCfg.enabled, dataLen, width, pad.left, innerW, xScale, yScale, visibleSeries],
  );

  /* ---------- Рендер ---------- */

  const legendClassMap: Record<string, string> = {
    top: styles.legendTop,
    bottom: styles.legendBottom,
    left: styles.legendLeft,
    right: styles.legendRight,
  };

  const legendStyle: CSSProperties = {
    fontSize: legendCfg.fontSize,
    fontFamily: legendCfg.fontFamily,
    color: legendCfg.color,
    "--legend-item-gap": `${legendCfg.itemGap}px`,
    "--legend-padding": `${legendCfg.padding}px`,
    "--legend-bg": legendCfg.backgroundColor,
    "--legend-radius": `${legendCfg.borderRadius}px`,
  } as CSSProperties;

  const tooltipStyle: CSSProperties = {
    background: tooltipCfg.backgroundColor,
    color: tooltipCfg.color,
    border: `${tooltipCfg.borderWidth}px solid ${tooltipCfg.borderColor}`,
    borderRadius: tooltipCfg.borderRadius,
    fontSize: tooltipCfg.fontSize,
    fontFamily: tooltipCfg.fontFamily,
    padding: tooltipCfg.padding,
    left: hover ? hover.x : 0,
    top: hover ? hover.y - 8 : 0,
    opacity: hover ? 1 : 0,
  };

  return (
    <div
      className={`${styles.root} ${className ?? ""}`}
      style={{ width, height, background: backgroundColor }}
    >
      {/* Легенда (top / left / right) */}
      {legendCfg.visible &&
        (legendCfg.position === "top" ||
          legendCfg.position === "left" ||
          legendCfg.position === "right") && (
          <div
            className={`${styles.legend} ${legendClassMap[legendCfg.position]}`}
            style={legendStyle}
          >
            {series.map((s, i) => (
              <div
                key={s.id}
                className={`${styles.legendItem} ${
                  hiddenIds.has(s.id) ? styles.legendItemHidden : ""
                }`}
                onClick={() => toggleSeries(s.id)}
              >
                <span
                  className={styles.legendMarker}
                  style={{
                    width: legendCfg.markerSize,
                    height: legendCfg.markerSize,
                    background:
                      s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                  }}
                />
                {s.label}
              </div>
            ))}
          </div>
        )}

      <svg
        ref={svgRef}
        className={styles.svg}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Заголовок */}
        {title && (
          <text
            x={width / 2}
            y={pad.top - 12}
            textAnchor="middle"
            fill={titleColor}
            fontSize={titleFontSize}
            fontFamily={titleFontFamily}
            fontWeight={titleFontWeight}
          >
            {title}
          </text>
        )}

        {/* Горизонтальная сетка */}
        {yAxisCfg.showGrid &&
          yTicks.map((t, i) => (
            <line
              key={`gy-${i}`}
              x1={pad.left}
              y1={t.y}
              x2={width - pad.right}
              y2={t.y}
              stroke={yAxisCfg.gridColor}
              strokeWidth={yAxisCfg.gridWidth}
              strokeDasharray={yAxisCfg.gridDash}
            />
          ))}

        {/* Вертикальная сетка */}
        {xAxisCfg.showGrid &&
          Array.from({ length: dataLen }).map((_, i) => (
            <line
              key={`gx-${i}`}
              x1={xScale(i)}
              y1={pad.top}
              x2={xScale(i)}
              y2={pad.top + innerH}
              stroke={xAxisCfg.gridColor}
              strokeWidth={xAxisCfg.gridWidth}
              strokeDasharray={xAxisCfg.gridDash}
            />
          ))}

        {/* Подписи Y */}
        {yTicks.map((t, i) => (
          <text
            key={`ty-${i}`}
            x={pad.left - 8}
            y={t.y + 4}
            textAnchor="end"
            fill={yAxisCfg.tickColor}
            fontSize={yAxisCfg.tickFontSize}
            fontFamily={yAxisCfg.tickFontFamily}
          >
            {Math.round(t.value * 100) / 100}
          </text>
        ))}

        {/* Подписи X */}
        {labels.map((lbl, i) => {
          if (i >= dataLen) return null;
          return (
            <text
              key={`tx-${i}`}
              x={xScale(i)}
              y={pad.top + innerH + yAxisCfg.tickFontSize + 8}
              textAnchor="middle"
              fill={xAxisCfg.tickColor}
              fontSize={xAxisCfg.tickFontSize}
              fontFamily={xAxisCfg.tickFontFamily}
            >
              {lbl}
            </text>
          );
        })}

        {/* Ось Y */}
        {yAxisCfg.showAxis && (
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={pad.top + innerH}
            stroke={yAxisCfg.axisColor}
            strokeWidth={yAxisCfg.axisWidth}
          />
        )}

        {/* Ось X */}
        {xAxisCfg.showAxis && (
          <line
            x1={pad.left}
            y1={pad.top + innerH}
            x2={width - pad.right}
            y2={pad.top + innerH}
            stroke={xAxisCfg.axisColor}
            strokeWidth={xAxisCfg.axisWidth}
          />
        )}

        {/* Заголовок оси Y */}
        {yAxisCfg.title && (
          <text
            x={12}
            y={pad.top + innerH / 2}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${pad.top + innerH / 2})`}
            fill={yAxisCfg.titleColor}
            fontSize={yAxisCfg.titleFontSize}
            fontFamily={yAxisCfg.titleFontFamily}
          >
            {yAxisCfg.title}
          </text>
        )}

        {/* Заголовок оси X */}
        {xAxisCfg.title && (
          <text
            x={pad.left + innerW / 2}
            y={height - 4}
            textAnchor="middle"
            fill={xAxisCfg.titleColor}
            fontSize={xAxisCfg.titleFontSize}
            fontFamily={xAxisCfg.titleFontFamily}
          >
            {xAxisCfg.title}
          </text>
        )}

        {/* Ряды данных */}
        {visibleSeries.map((s) => {
          const pts = s.data
            .map((v, i) =>
              v === null ? null : { x: xScale(i), y: yScale(v!), value: v!, idx: i },
            )
            .filter(
              (p): p is { x: number; y: number; value: number; idx: number } =>
                p !== null,
            );

          const linePath = buildLinePath(
            pts.map(({ x, y }) => ({ x, y })),
            smooth,
          );
          const areaPath = buildAreaPath(
            pts.map(({ x, y }) => ({ x, y })),
            pad.top + innerH,
            smooth,
          );
          const fillColor = s.fillColor ?? hexToRgba(s.color, 0.15);

          return (
            <g key={s.id}>
              {s.fill && <path d={areaPath} fill={fillColor} stroke="none" />}
              <path
                d={linePath}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeDasharray={s.dash}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.pointRadius > 0 &&
                pts.map((p) => (
                  <circle
                    key={p.idx}
                    cx={p.x}
                    cy={p.y}
                    r={s.pointRadius}
                    fill={s.color}
                  />
                ))}
            </g>
          );
        })}

        {/* Маркер наведения */}
        {hover && (
          <line
            x1={hover.x}
            y1={pad.top}
            x2={hover.x}
            y2={pad.top + innerH}
            stroke={tooltipCfg.borderColor}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {children}
      </svg>

      {/* Легенда снизу */}
      {legendCfg.visible && legendCfg.position === "bottom" && (
        <div
          className={`${styles.legend} ${styles.legendBottom}`}
          style={legendStyle}
        >
          {series.map((s, i) => (
            <div
              key={s.id}
              className={`${styles.legendItem} ${
                hiddenIds.has(s.id) ? styles.legendItemHidden : ""
              }`}
              onClick={() => toggleSeries(s.id)}
            >
              <span
                className={styles.legendMarker}
                style={{
                  width: legendCfg.markerSize,
                  height: legendCfg.markerSize,
                  background:
                    s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                }}
              />
              {s.label}
            </div>
          ))}
        </div>
      )}

      {/* Тултип */}
      {tooltipCfg.enabled && hover && (
        <div className={styles.tooltip} style={tooltipStyle}>
          {labels[hover.idx] && (
            <div style={{ opacity: 0.7, marginBottom: 2 }}>
              {labels[hover.idx]}
            </div>
          )}
          {visibleSeries.map((s) => {
            const v = s.data[hover.idx];
            return v === null ? null : (
              <div
                key={s.id}
                style={{ display: "flex", gap: 6, alignItems: "center" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.color,
                  }}
                />
                <span>
                  {s.label}: {v}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LineChart;
