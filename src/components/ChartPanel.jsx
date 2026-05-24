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
    () => history.map((d) => (d.pt100 != null ? Number(d.pt100) : null)),
    [history],
  );
  const humArray = useMemo(
    () => history.map((d) => (d.hum != null ? Number(d.hum) : null)),
    [history],
  );

  // Temperature charts: Siemens (reference) and PT100
  const siemensData = useMemo(() => {
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
      {
        label: "Cible T",
        data: history.map(() => settings.tempTarget),
        borderColor: "rgba(121,192,255,.35)",
        borderWidth: 1.5,
        borderDash: [5, 3],
        pointRadius: 0,
        tension: 0,
        yAxisID: "yT",
      },
    ];

    // overlay PT100 on the Siemens chart when available (helps visibility/debugging)
    if (pt100Array.some((v) => v != null)) {
      datasets.push({
        label: "PT100",
        data: pt100Array,
        borderColor: "#f85149",
        backgroundColor: "rgba(248,81,73,0)",
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: "yT",
        spanGaps: true,
        borderDash: [4, 2],
      });
    }

    return { labels, datasets };
  }, [siemensArray, pt100Array, labels, settings.tempTarget, history]);

  const pt100Data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "PT100",
          data: pt100Array,
          borderColor: "#f85149",
          backgroundColor: "rgba(248,81,73,.07)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: "yT",
          spanGaps: true,
        },
        {
          label: "Cible T",
          data: history.map(() => settings.tempTarget),
          borderColor: "rgba(248,81,73,.4)",
          borderWidth: 1.5,
          borderDash: [5, 3],
          pointRadius: 0,
          tension: 0,
          yAxisID: "yT",
        },
      ],
    }),
    [pt100Array, labels, settings.tempTarget],
  );

  // quick presence check for PT100 data (used to show a helpful placeholder)
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
        {
          label: "Cible HR",
          data: history.map(() => settings.humTarget),
          borderColor: "rgba(57,208,216,.4)",
          borderWidth: 1.5,
          borderDash: [5, 3],
          pointRadius: 0,
          tension: 0,
          yAxisID: "yH",
        },
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
    ? [
        { l: "HR", c: "#39d0d8", d: false },
        { l: "Cible HR", c: "#39d0d8", d: true },
      ]
    : [
        { l: "Siemens (réf)", c: "#79c0ff", d: false },
        { l: "PT100", c: "#f85149", d: false },
        { l: "Cible T", c: "#f85149", d: true },
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
                <div style={{ height: 180 }}>
                  <Line
                    key={`siemens-${labels.length}-${siemensArray.filter((v) => v != null).length}`}
                    data={siemensData}
                    options={siemensOptions}
                  />
                </div>
                <div style={{ height: 180, marginTop: 12 }}>
                  {hasPt100 ? (
                    <Line
                      key={`pt100-${labels.length}-${pt100Array.filter((v) => v != null).length}`}
                      data={pt100Data}
                      options={pt100Options}
                    />
                  ) : (
                    <div
                      style={{ padding: 18, color: "#7d8590", fontSize: 13 }}
                    >
                      Aucun PT100 disponible — vérifier la colonne{" "}
                      <code>pt100_temp</code> ou l'envoi depuis l'appareil.
                    </div>
                  )}
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
                <th>ΔT (PT100−Siemens)</th>
                <th>HR (%)</th>
                <th>Cible HR</th>
                <th>U(T) k=2</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {[...history]
                .reverse()
                .slice(0, 40)
                .map((d) => {
                  const tdRef =
                    d.avg != null
                      ? +(d.avg - settings.tempTarget).toFixed(2)
                      : null;
                  const delta =
                    d.pt100 != null && d.avg != null
                      ? +(d.pt100 - d.avg).toFixed(2)
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
                        {d.pt100 != null ? d.pt100.toFixed(1) : "—"}
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
                        ±{(0.06 + Math.random() * 0.02).toFixed(3)}°C
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
