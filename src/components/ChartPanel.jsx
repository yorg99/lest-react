import React, { useMemo, useEffect } from "react";
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
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export default function ChartPanel({
  history,
  tab,
  setTab,
  chartMode,
  setChartMode,
  settings,
  uc,
  U,
  hom,
  sigma,
}) {
  const isH = chartMode === "hum";

  // labels shared between charts
  const labels = useMemo(() => history.map((d) => d.label), [history]);

  // numeric arrays coerced to Number (Chart.js prefers numbers)
  const siemensArray = useMemo(
    () => history.map((d) => (d.avg != null ? Number(d.avg) : null)),
    [history],
  );
  const pt100Array = useMemo(
    () =>
      history.map((d) => {
        const raw = d.pt100;
        if (raw === null || raw === undefined || raw === "") return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      }),
    [history],
  );
  // compute filtered average (cumulative average of pt100 readings) per row id
  // The filtered value for each row is the mean of all pt100 values up to and
  // including the current reading. This makes the first filtered value equal
  // to the first PT100 reading and avoids off-by-one shifts.
  const pt100FilteredById = useMemo(() => {
    const m = new Map();
    let sum = 0;
    let count = 0;
    for (const item of history) {
      const raw = item.pt100;
      const num =
        raw === null || raw === undefined || raw === "" ? NaN : Number(raw);
      if (Number.isFinite(num)) {
        sum += num;
        count += 1;
      }
      m.set(item.id, count > 0 ? sum / count : null);
    }
    return m;
  }, [history]);
  const humArray = useMemo(
    () => history.map((d) => (d.hum != null ? Number(d.hum) : null)),
    [history],
  );

  // Combined chart data: Siemens (reference) with optional PT100 overlay
  const combinedData = useMemo(() => {
    const datasets = [
      {
        label: "Siemens (réf)",
        data: siemensArray,
        borderColor: "#79c0ff",
        backgroundColor: "rgba(121,192,255,.06)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        yAxisID: "yT",
        spanGaps: true,
      },
    ];

    // add PT100 as an overlay on the same chart (single source of truth)
    if (pt100Array.some((v) => v != null)) {
      datasets.push({
        label: "PT100",
        data: pt100Array,
        borderColor: "#f85149",
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
  }, [siemensArray, pt100Array, labels]);

  // quick presence check for PT100 data (used for debug counts)
  const hasPt100 = useMemo(
    () => pt100Array.some((v) => v != null),
    [pt100Array],
  );

  useEffect(() => {
    // small debug log to help track missing data issues in the browser console
    console.debug(
      "[ChartPanel] labels=%d, Siemens samples=%d, PT100 samples=%d",
      labels.length,
      siemensArray.filter((v) => v != null).length,
      pt100Array.filter((v) => v != null).length,
    );
  }, [labels, siemensArray, pt100Array]);

  // Humidity dataset (unchanged)
  const humData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "HR (%)",
          data: history.map((d) => d.hum),
          borderColor: "#39d0d8",
          backgroundColor: "rgba(57,208,216,.07)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: "yH",
        },
        // target removed
      ],
    }),
    [history, labels, settings.humTarget],
  );

  // options factory
  const createOptions = (forHum, yColor) => ({
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
          title: (items) => "🕐 " + items[0].label,
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
          color: yColor || "#f85149",
          callback: (v) => v + "°C",
          maxTicksLimit: 6,
        },
        border: { display: false },
        // add some padding so the last tick/line isn't clipped
        suggestedMin: undefined,
        suggestedMax: undefined,
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
  });

  const siemensOptions = createOptions(false, "#79c0ff");
  const pt100Options = createOptions(false, "#f85149");
  const humOptions = createOptions(true, "#39d0d8");

  const legendItems = isH
    ? [{ l: "HR", c: "#39d0d8", d: false }]
    : [
        { l: "Siemens (réf)", c: "#79c0ff", d: false },
        { l: "PT100", c: "#f85149", d: false },
      ];

  return (
    <div className="chart-panel">
      <div className="tab-bar">
        {["chart", "table", "uncert"].map((t) => (
          <div
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "chart"
              ? "📊 Temps Réel"
              : t === "table"
                ? "📋 Tableau"
                : "🔢 Incertitudes"}
          </div>
        ))}
        <div className="tab-sp" />
        <select
          className="ch-sel"
          value={chartMode}
          onChange={(e) => setChartMode(e.target.value)}
        >
          <option value="avg">Température</option>
          <option value="hum">Humidité</option>
        </select>
      </div>

      {/* Chart */}
      {tab === "chart" && (
        <>
          <div className="chart-inner">
            {isH ? (
              <Line data={humData} options={humOptions} />
            ) : (
              <>
                <div style={{ height: 360, paddingBottom: 8 }}>
                  <Line
                    key={`combined-${labels.length}-${siemensArray.filter((v) => v != null).length}`}
                    data={combinedData}
                    options={siemensOptions}
                  />
                </div>
              </>
            )}
          </div>
          <div className="leg-row">
            {legendItems.map((it) => (
              <div key={it.l} className="leg-i">
                {it.d ? (
                  <div className="leg-dash" style={{ borderColor: it.c }} />
                ) : (
                  <div className="leg-dot" style={{ background: it.c }} />
                )}
                {it.l}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Table */}
      {tab === "table" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Siemens (°C)</th>
                <th>PT100 (°C)</th>
                <th>PT100 Filtered</th>
                <th>ΔT (PT100−Siemens)</th>
                <th>HR (%)</th>
                <th>Cible HR</th>
                <th>U(T) k=2</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 40).map((d) => {
                const tdRef =
                  d.avg != null
                    ? +(d.avg - settings.tempTarget).toFixed(2)
                    : null;
                const pt100FilteredVal = pt100FilteredById.get(d.id);
                const delta =
                  d.pt100 != null && d.avg != null
                    ? +(d.avg - pt100FilteredVal).toFixed(2)
                    : null;
                const ok =
                  delta !== null
                    ? Math.abs(delta) <= settings.tempThreshold
                    : tdRef !== null
                      ? Math.abs(tdRef) <= settings.tempThreshold
                      : false;
                return (
                  <tr key={d.id}>
                    <td style={{ fontSize: 10, color: "#7d8590" }}>
                      {d.label}
                    </td>
                    <td className="td-r">
                      {d.avg != null ? d.avg.toFixed(1) : "—"}
                    </td>
                    <td className="td-r">
                      {d.pt100 != null ? Number(d.pt100).toFixed(2) : "—"}
                    </td>
                    <td className="td-r">
                      {(() => {
                        const v = pt100FilteredById.get(d.id);
                        return v != null ? v.toFixed(2) : "—";
                      })()}
                    </td>
                    <td
                      className={
                        delta !== null &&
                        Math.abs(delta) > settings.tempThreshold
                          ? "td-r"
                          : "td-c"
                      }
                    >
                      {delta === null ? "—" : (delta >= 0 ? "+" : "") + delta}
                    </td>
                    <td className="td-c">
                      {d.hum != null ? d.hum.toFixed(1) : "—"}
                    </td>
                    <td>{settings.humTarget.toFixed(1)}</td>
                    <td className="td-y">
                      ±{U.toFixed(3)}°C
                    </td>
                    <td>
                      <span
                        className={`sbadge ${ok ? "s-ok" : "s-err"}`}
                        style={{ fontSize: 9 }}
                      >
                        {ok ? "OK" : "SEUIL"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Uncertainty */}
      {tab === "uncert" && (
        <div className="uncert-wrap">
          <div className="u-grid">
            {[
              {
                title: "Incertitude type uc(T)",
                val: `±${uc.toFixed(4)}°C`,
                color: "var(--yellow)",
                sub: "Combinée standard",
              },
              {
                title: "Incertitude élargie U(T)",
                val: `±${U.toFixed(4)}°C`,
                color: "var(--red)",
                sub: "k=2 · conf. 95%",
              },
              {
                title: "Variation ΔT",
                val: `${hom.toFixed(3)}°C`,
                color: "var(--cyan)",
                sub: "Max − Min session",
              },
              {
                title: "Stabilité σ",
                val: `${sigma.toFixed(4)}°C`,
                color: "var(--purple)",
                sub: "Écart-type 30s",
              },
              {
                title: "Résolution DHT11",
                val: "0.1°C",
                color: "var(--green)",
                sub: "Résolution capteur",
              },
              {
                title: "Étalon référence",
                val: "±0.025°C",
                color: "var(--muted)",
                sub: "Référence COFRAC",
              },
            ].map((c) => (
              <div key={c.title} className="u-card">
                <div className="u-title">{c.title}</div>
                <div className="u-val" style={{ color: c.color }}>
                  {c.val}
                </div>
                <div className="u-sub">{c.sub}</div>
              </div>
            ))}
          </div>
          <div className="u-formula">
            <span>U(T)</span> = k × uc(T) = k × √[ u²résol + u²répéta + u²étalon
            ]<br />
            <span>urésol</span> = 0.1 / (2√3) ≈ 0.029°C (DHT11)
            <br />
            <span>urépéta</span> = σ / √n ← stabilité glissant 30s
            <br />
            <span>uétalon</span> = 0.025°C (référence COFRAC)
          </div>
        </div>
      )}
    </div>
  );
}
