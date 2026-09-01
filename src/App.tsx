import './App.css'
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
    dash: "6 4",
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
    </>
  )
}

export default App
