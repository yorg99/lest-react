import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, formatTS } from './lib/supabase';
import Header       from './components/Header';
import LoginScreen  from './components/LoginScreen';
import SensorCard   from './components/SensorCard';
import InfoPanel    from './components/InfoPanel';
import MiniCards    from './components/MiniCards';
import ChartPanel   from './components/ChartPanel';
import StatusBar    from './components/StatusBar';
import SettingsModal from './components/SettingsModal';

const MAX_PTS   = 80;
const TOTAL_DUR = 72 * 3600;

function sd(arr) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((s, v) => s + v, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

export default function App() {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // ── Settings ────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    tempTarget: 25.0, tempThreshold: 2.0, tempSlope: 0.03,
    humTarget:  60.0, humThreshold:  5.0,
    testName: 'Étalonnage — Étuve LEST #1', totalDur: TOTAL_DUR
  });

  // ── Data ────────────────────────────────────────────────────────────────────
  const [history,   setHistory]   = useState([]);
  const [lastId,    setLastId]    = useState(0);
  const [connected, setConnected] = useState(false);
  const [espOnline, setEspOnline] = useState(false);
  const [lastSeenTs, setLastSeenTs] = useState(null);
  const [totalPts,  setTotalPts]  = useState(0);
  const [status,    setStatus]    = useState('⏳ Connexion…');

  // ── UI state ────────────────────────────────────────────────────────────────
  const [tab,       setTab]       = useState('chart');
  const [chartMode, setChartMode] = useState('avg');
  const [modal,     setModal]     = useState(null); // 'temp' | 'hum' | null
  const [toast,     setToast]     = useState('');
  const [startTime] = useState(Date.now());

  const lastIdRef = useRef(0);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }, []);

  // ── Auth bootstrap / listener ───────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setAuthError("Impossible de vérifier la session.");
      }

      setSession(data?.session ?? null);
      setAuthChecking(false);
    }

    bootstrapAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError('');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleLogin(email, password) {
    setAuthBusy(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message || "Erreur d'authentification.");
    }

    setAuthBusy(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setHistory([]);
    lastIdRef.current = 0;
    setLastId(0);
    setConnected(false);
    setEspOnline(false);
    setLastSeenTs(null);
    setTotalPts(0);
    setStatus('⏳ Connexion…');
  }

  // ── Load history from Supabase ───────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    async function load() {
      const { data, error } = await supabase
        .from('data')
        .select('id, temperature, humidity, created_at')
        .order('id', { ascending: false })
        .limit(MAX_PTS);

      if (error || !data) { showToast('❌ Erreur Supabase'); return; }

      const rows = data.reverse().map(r => ({
        id:  r.id,
        avg: r.temperature,
        hum: r.humidity,
        created_at: r.created_at,
        label: formatTS(r.created_at)
      }));

      setHistory(rows);
      if (rows.length > 0) {
        const last = rows[rows.length - 1];
        lastIdRef.current = last.id;
        setLastId(last.id);
        setLastSeenTs(last.created_at);
        setTotalPts(last.id);
        setConnected(true);
        setStatus('✅ Supabase · Live');
      }
      showToast(`✅ ${rows.length} points chargés depuis Supabase`);
    }
    load();
  }, [session, showToast]);

  // ── Poll new data every second ───────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('data')
        .select('id, temperature, humidity, created_at')
        .order('id', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        setEspOnline(false);
        setStatus(`⚠️ ESP hors ligne · dernier: ${formatTS(lastSeenTs)}`);
        return;
      }

      const row = data[0];
      const age = (Date.now() - new Date(row.created_at).getTime()) / 1000;
      const online = age < 10;
      setEspOnline(online);
      setLastSeenTs(row.created_at);

      if (online) {
        setStatus('✅ ESP8266 · Live');
      } else {
        setStatus(`⚠️ ESP hors ligne · dernier: ${formatTS(row.created_at)}`);
      }

      if (row.id === lastIdRef.current) return;
      lastIdRef.current = row.id;
      setLastId(row.id);
      setTotalPts(row.id);

      const point = {
        id:  row.id,
        avg: row.temperature,
        hum: row.humidity,
        created_at: row.created_at,
        label: formatTS(row.created_at)
      };

      setHistory(prev => {
        const next = [...prev, point];
        return next.length > MAX_PTS ? next.slice(next.length - MAX_PTS) : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, lastSeenTs]);

  if (authChecking) {
    return <main className="loading-screen">Vérification de la session...</main>;
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} busy={authBusy} error={authError} />;
  }

  // ── Computed KPIs ────────────────────────────────────────────────────────────
  const latest  = history[history.length - 1] || null;
  const temps   = history.map(d => d.avg);
  const hums    = history.map(d => d.hum);
  const tempMin = temps.length ? Math.min(...temps) : null;
  const tempMax = temps.length ? Math.max(...temps) : null;
  const humMin  = hums.length  ? Math.min(...hums)  : null;
  const humMax  = hums.length  ? Math.max(...hums)  : null;
  const rec30   = temps.slice(-30);
  const sigma   = sd(rec30);
  const n       = rec30.length || 1;
  const uR      = 0.1 / (2 * Math.sqrt(3));
  const uE      = 0.025;
  const uRep    = sigma / Math.sqrt(n);
  const uc      = Math.sqrt(uR ** 2 + uE ** 2 + uRep ** 2);
  const U       = 2 * uc;
  const hom     = (tempMax !== null && tempMin !== null) ? tempMax - tempMin : 0;
  const slope   = rec30.length > 2
    ? ((rec30[rec30.length - 1] - rec30[0]) / rec30.length * 60).toFixed(3)
    : '0.000';

  // ── Export CSV ───────────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = ['Timestamp          ID                Temperature          Cible_T          Ecart_T          Humidite          H_cible          '];
    history.forEach(d => {
      const td = (d.avg - settings.tempTarget).toFixed(2);
      rows.push(`${d.label}               ${d.id}          ${d.avg.toFixed(2)}                           ${settings.tempTarget.toFixed(1)}                ${td}                ${d.hum.toFixed(1)}                     ${settings.humTarget.toFixed(1)}            `);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `LEST_${new Date().toISOString().slice(0,40).replace(/:/g,'-')}.csv`;
    a.click();
    showToast('⬇ Export CSV téléchargé');
  }

  // ── Reset session ─────────────────────────────────────────────────────────────
  async function resetSession() {
    setHistory([]);
    lastIdRef.current = 0;
    setLastId(0);
    showToast('🔄 Session réinitialisée — rechargement…');
    const { data } = await supabase
      .from('data').select('id, temperature, humidity, created_at')
      .order('id', { ascending: false }).limit(MAX_PTS);
    if (data) {
      const rows = data.reverse().map(r => ({
        id: r.id, avg: r.temperature, hum: r.humidity,
        created_at: r.created_at, label: formatTS(r.created_at)
      }));
      setHistory(rows);
      if (rows.length > 0) {
        lastIdRef.current = rows[rows.length - 1].id;
        setLastId(rows[rows.length - 1].id);
      }
    }
  }

  return (
    <>
      <Header
        onExport={exportCSV}
        onUpload={(parsed) => showToast(`✅ ${parsed.length} points chargés`)}
        onLogout={handleLogout}
      />

      <div className="top-row">
        <SensorCard
          type="temp"
          value={latest?.avg ?? null}
          target={settings.tempTarget}
          threshold={settings.tempThreshold}
          uncert={U}
          min={tempMin}
          max={tempMax}
          homog={hom}
          slope={slope}
          onSettings={() => setModal('temp')}
        />
        <SensorCard
          type="hum"
          value={latest?.hum ?? null}
          target={settings.humTarget}
          threshold={settings.humThreshold}
          uncert={null}
          min={humMin}
          max={humMax}
          onSettings={() => setModal('hum')}
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
        uc={uc} U={U} hom={hom} sigma={sigma}
      />

      <StatusBar
        startTime={startTime}
        totalDur={settings.totalDur}
        testName={settings.testName}
        onReset={resetSession}
      />

      {modal && (
        <SettingsModal
          type={modal}
          settings={settings}
          onSave={(updated) => {
            setSettings(s => ({ ...s, ...updated }));
            setModal(null);
            showToast('✅ Paramètres mis à jour');
          }}
          onClose={() => setModal(null)}
        />
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}
