import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import { createOptions } from "./chartOptions";
import type { ChartMode, DataRow } from "../../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export interface RealtimeChartProps {
  history: DataRow[];
  mode: ChartMode;
}

const SIEMENS = "#79c0ff";
const SIEMENS_FILL = "rgba(121,192,255,.06)";
const PT100 = "#f85149";
const HUM = "#39d0d8";
const HUM_FILL = "rgba(57,208,216,.07)";

export default function RealtimeChart({ history, mode }: RealtimeChartProps) {
  const labels = useMemo(() => history.map((d) => d.label), [history]);
  const siemensArray = useMemo(
    () => history.map((d) => (d.avg != null ? Number(d.avg) : null)),
    [history],
  );
  const pt100Array = useMemo(
    () =>
      history.map((d) => {
        const raw = d.pt100;
        if (raw === null || raw === undefined) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      }),
    [history],
  );
  const humArray = useMemo(
    () => history.map((d) => (d.hum != null ? Number(d.hum) : null)),
    [history],
  );

  const hasPt100 = useMemo(
    () => pt100Array.some((v) => v != null),
    [pt100Array],
  );

  const tempData: ChartData<"line"> = useMemo(() => {
    const datasets: ChartData<"line">["datasets"] = [
      {
        label: "Siemens (réf)",
        data: siemensArray,
        borderColor: SIEMENS,
        backgroundColor: SIEMENS_FILL,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        yAxisID: "yT",
        spanGaps: true,
      },
    ];
    if (hasPt100) {
      datasets.push({
        label: "PT100",
        data: pt100Array,
        borderColor: PT100,
        backgroundColor: "rgba(248,81,73,0)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: "yT",
        spanGaps: true,
      });
    }
    return { labels, datasets };
  }, [labels, siemensArray, pt100Array, hasPt100]);

  const humData: ChartData<"line"> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "HR (%)",
          data: humArray,
          borderColor: HUM,
          backgroundColor: HUM_FILL,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: "yH",
          spanGaps: true,
        },
      ],
    }),
    [labels, humArray],
  );

  if (mode === "hum") {
    return (
      <div style={{ height: 360, paddingBottom: 8 }}>
        <Line data={humData} options={createOptions(true, HUM)} />
      </div>
    );
  }

  return (
    <div style={{ height: 360, paddingBottom: 8 }}>
      <Line
        key={`combined-${labels.length}-${siemensArray.filter((v) => v != null).length}`}
        data={tempData}
        options={createOptions(false, SIEMENS)}
      />
    </div>
  );
}
