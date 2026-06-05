import type { ChartOptions } from "chart.js";

export function createOptions(forHum: boolean, yColor: string): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c2128",
        borderColor: "#30363d",
        borderWidth: 1,
        titleFont: { family: "DM Mono", size: 11 },
        bodyFont: { family: "DM Mono", size: 12 },
        padding: 11,
        cornerRadius: 8,
        callbacks: {
          title: (items) => "🕐 " + items[0]!.label,
          label: (c) =>
            `  ${c.dataset.label}: ${c.parsed.y !== null ? c.parsed.y.toFixed(2) : "—"}${forHum ? "%" : "°C"}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,.04)" },
        ticks: {
          font: { family: "DM Mono", size: 9 },
          color: "#7d8590",
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      yT: {
        type: "linear",
        position: "left",
        display: !forHum,
        grid: { color: "rgba(255,255,255,.05)" },
        ticks: {
          font: { family: "DM Mono", size: 10 },
          color: yColor,
          callback: (v) => v + "°C",
          maxTicksLimit: 6,
        },
        border: { display: false },
      },
      yH: {
        type: "linear",
        position: "right",
        display: forHum,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { family: "DM Mono", size: 10 },
          color: "#39d0d8",
          callback: (v) => v + "%",
          maxTicksLimit: 6,
        },
        border: { display: false },
        min: 0,
        max: 100,
      },
    },
  };
}
