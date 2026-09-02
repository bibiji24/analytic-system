import './App.css'
import type { BarChartConfig } from './charts/BarChart';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/graph';
import type { LineChartProps } from './charts/graph/types';
import { Button } from './ui/button'

const series: LineChartProps["series"] = [
  {
    id: "revenue",
    label: "Выручка",
    data: [12, 18, 15, 25, 30, 28, 35, 42, 38, 50],
    color: "#4f8cff",
    strokeWidth: 3,
    fill: true,
    fillColor: "rgba(79, 140, 255, 0.12)",
  },
  {
    id: "costs",
    label: "Расходы",
    data: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
    color: "#ff6b6b",
    strokeWidth: 2,
    dash: "14 10",
  },
  {
    id: "profit",
    label: "Прибыль",
    data: [4, 8, 3, 11, 14, 10, 15, 20, 14, 24],
    color: "#2dd4a7",
    strokeWidth: 2.5,
  },
];

const labels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт"];

const data = [
  {
    name: "План",
    data: [
      { label: 'Янв', value: 4200 },
      { label: 'Фев', value: 3100 },
      { label: 'Мар', value: 5800 },
      { label: 'Апр', value: 4700 },
      { label: 'Май', value: 6200 },
      { label: 'Июн', value: 3900 },
    ],
    color: '#cc3333'
  },
  {
    name: "Факт",
    data: [
      { label: 'Янв', value: 3000 },
      { label: 'Фев', value: 2500 },
      { label: 'Мар', value: 5234 },
      { label: 'Апр', value: 4800 },
      { label: 'Май', value: 6100 },
      { label: 'Июн', value: 4500 },
    ],
    color: '#2340c2ff'
  }
]

const config: BarChartConfig = {
  width: 600,
  height: 360,
  backgroundColor: '#fafafa',
  title: {
    text: 'Продажи за полугодие',
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 700,
  },
  axis: {
    gridLineColor: '#e2e8f0',
    yTickCount: 4,
    tickColor: '#64748b',
  },
  bar: {
    color: '#6366f1',
    hoverColor: '#4f46e5',
    borderRadius: 8,
    barWidthRatio: 0.65,
  },
  labels: {
    showValues: true,
    xLabelRotation: 0,
  },
  tooltip: {
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
  },
};

function App() {


  return (
    <>
      <Button text='Кнопка' />
      <div style={{ padding: 40, fontFamily: "'Inter', sans-serif" }}>
      <LineChart
        title="Финансовые показатели"
        titleColor="#1e293b"
        titleFontSize={18}
        titleFontWeight={700}
        width={720}
        height={400}
        backgroundColor="#fafbfc"
        series={series}
        labels={labels}
        smooth={0.5}
        showPoints
        padding={{ top: 48, right: 32, bottom: 44, left: 56 }}
        yAxis={{
          title: "Млн ₽",
          ticks: 6,
          gridColor: "#e2e8f0",
          gridDash: "3 5",
          tickFontSize: 11,
          tickColor: "#64748b",
        }}
        xAxis={{
          title: "Месяц 2024",
          tickFontSize: 12,
          gridColor: "#f1f5f9",
        }}
        legend={{
          visible: true,
          position: "top",
          fontSize: 13,
          color: "#334155",
          itemGap: 20,
          markerSize: 14,
          backgroundColor: "#f1f5f9",
          borderRadius: 8,
          padding: 8,
        }}
        tooltip={{
          enabled: true,
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          borderColor: "#334155",
          borderRadius: 8,
          fontSize: 13,
          padding: 10,
        }}
      />
    </div>
    <div style={{ padding: 24 }}>
      <BarChart
        series={data}
        config={config}
        onBarClick={(item, i) => console.log('Clicked:', item, i)}
      />
    </div>
    </>
  )
}

export default App
