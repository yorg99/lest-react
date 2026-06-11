import type { ChartMode, DataRow, Kpis, Settings, Tab } from "../../lib/types";
import DataTable from "./DataTable";
import RealtimeChart from "./RealtimeChart";
import UncertaintyView from "./UncertaintyView";

export interface ChartPanelProps {
  history: DataRow[];
  tab: Tab;
  setTab: (t: Tab) => void;
  chartMode: ChartMode;
  setChartMode: (m: ChartMode) => void;
  settings: Settings;
  kpis: Kpis;
}

const TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: "chart", label: "📊 Temps Réel" },
  { key: "table", label: "📋 Tableau" },
  { key: "uncert", label: "🔢 Incertitudes" },
];

const LEGEND: Record<ChartMode, ReadonlyArray<{ l: string; c: string }>> = {
  avg: [
    { l: "Siemens (réf)", c: "#79c0ff" },
    { l: "PT100", c: "#f85149" },
  ],
  hum: [{ l: "HR", c: "#39d0d8" }],
};

export default function ChartPanel({
  history,
  tab,
  setTab,
  chartMode,
  setChartMode,
  settings,
  kpis,
}: ChartPanelProps) {
  return (
    <div className="chart-panel">
      <div className="tab-bar">
        {TABS.map((t) => (
          <div
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </div>
        ))}
        <div className="tab-sp" />
        <select
          className="ch-sel"
          value={chartMode}
          onChange={(e) => setChartMode(e.target.value as ChartMode)}
        >
          <option value="avg">Température</option>
          <option value="hum">Humidité</option>
        </select>
      </div>

      {tab === "chart" && (
        <>
          <div className="chart-inner">
            <RealtimeChart history={history} mode={chartMode} />
          </div>
          <div className="leg-row">
            {LEGEND[chartMode].map((it) => (
              <div key={it.l} className="leg-i">
                <div className="leg-dot" style={{ background: it.c }} />
                {it.l}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "table" && (
        <DataTable history={history} settings={settings} U={kpis.U} />
      )}

      {tab === "uncert" && (
        <UncertaintyView
          uc={kpis.uc}
          U={kpis.U}
          hom={kpis.hom}
          sigma={kpis.sigma}
        />
      )}
    </div>
  );
}
