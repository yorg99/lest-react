import { useMemo, useState } from "react";
import ChartPanel from "./components/chart/ChartPanel";
import Header from "./components/Header";
import InfoPanel from "./components/InfoPanel";
import LoginScreen from "./components/LoginScreen";
import MiniCards from "./components/MiniCards";
import SensorCard from "./components/SensorCard";
import SettingsModal from "./components/SettingsModal";
import StatusBar from "./components/StatusBar";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import { useLiveData } from "./hooks/useLiveData";
import { useToast } from "./hooks/useToast";
import { DEFAULTS } from "./lib/config";
import { buildCsvRows, defaultCsvFilename, downloadCsv } from "./lib/csv";
import { computeKpis } from "./lib/stats";
import type { ChartMode, ModalType, Settings, Tab } from "./lib/types";

export default function App() {
  const { session, authChecking, authBusy, authError, login, logout } =
    useSupabaseAuth();
  const { history, espOnline, lastSeenTs, totalPts, status, reload } =
    useLiveData(session);
  const { toast, show } = useToast();

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [tab, setTab] = useState<Tab>("chart");
  const [chartMode, setChartMode] = useState<ChartMode>("avg");
  const [modal, setModal] = useState<ModalType>(null);
  const [startTime] = useState(() => Date.now());

  const kpis = useMemo(() => computeKpis(history), [history]);
  const latest = history.length > 0 ? history[history.length - 1] : null;

  function handleExport() {
    downloadCsv(buildCsvRows(history, settings), defaultCsvFilename());
    show("⬇ Export CSV téléchargé");
  }

  async function handleReset() {
    show("🔄 Réinitialisation…");
    const ok = await reload();
    show(ok ? "✅ Session réinitialisée" : "❌ Échec du rechargement");
  }

  if (authChecking) {
    return <main className="loading-screen">Vérification de la session...</main>;
  }
  if (!session) {
    return (
      <LoginScreen onLogin={login} busy={authBusy} error={authError} />
    );
  }

  return (
    <>
      <Header onExport={handleExport} onLogout={logout} />

      <div className="top-row">
        <SensorCard
          type="temp"
          value={latest?.avg ?? null}
          altValue={latest?.pt100 ?? null}
          target={settings.tempTarget}
          threshold={settings.tempThreshold}
          uncert={kpis.U}
          min={kpis.tempMin}
          max={kpis.tempMax}
          homog={kpis.hom}
          slope={kpis.slope}
          onSettings={() => setModal("temp")}
        />
        <SensorCard
          type="hum"
          value={latest?.hum ?? null}
          target={settings.humTarget}
          threshold={settings.humThreshold}
          uncert={null}
          min={kpis.humMin}
          max={kpis.humMax}
          onSettings={() => setModal("hum")}
        />
        <InfoPanel
          status={status}
          espOnline={espOnline}
          totalPts={totalPts}
          lastSeenTs={lastSeenTs}
        />
      </div>

      <MiniCards history={history} tempTarget={settings.tempTarget} />

      <ChartPanel
        history={history}
        tab={tab}
        setTab={setTab}
        chartMode={chartMode}
        setChartMode={setChartMode}
        settings={settings}
        kpis={kpis}
      />

      <StatusBar
        startTime={startTime}
        totalDur={settings.totalDur}
        testName={settings.testName}
        onReset={handleReset}
      />

      {modal && (
        <SettingsModal
          type={modal}
          settings={settings}
          onSave={(updated) => {
            setSettings((s) => ({ ...s, ...updated }));
            setModal(null);
            show("✅ Paramètres mis à jour");
          }}
          onClose={() => setModal(null)}
        />
      )}

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
