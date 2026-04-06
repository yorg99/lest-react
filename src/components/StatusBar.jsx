import React, { useState, useEffect } from 'react';

function fd(s) {
  return [Math.floor(s/3600), Math.floor((s%3600)/60), s%60]
    .map(v => String(v).padStart(2,'0')).join(':');
}
function fr(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sc = s%60;
  return `${h}h ${String(m).padStart(2,'0')}m ${String(sc).padStart(2,'0')}s`;
}

export default function StatusBar({ startTime, totalDur, testName, onReset }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const remaining = Math.max(0, totalDur - elapsed);
  const end = new Date(startTime + totalDur * 1000);
  const endStr = end.toLocaleString('fr-FR', {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  return (
    <footer className="status-bar">
      <button className="pwr-btn">⏻</button>

      <div className="t-info">
        <div className="t-lbl">Essai en cours</div>
        <div className="t-name">{testName}</div>
        <div className="t-meta">NF EN 60068-3-5 · LoLin NodeMCU V3 · Supabase Cloud</div>
        <div className="t-mode">Acquisition 1 Hz</div>
      </div>

      <div className="tm-blk">
        <div className="tm-lbl">⏱ Temps écoulé</div>
        <div className="tm-val">{fd(elapsed)}</div>
      </div>

      <div className="rm-blk">
        <div className="tm-lbl" style={{justifyContent:'flex-end'}}>⏰ Temps restant</div>
        <div className="rm-val">{fr(remaining)}</div>
        <div className="rm-sub">Fin prévue le <strong>{endStr}</strong></div>
      </div>

      <button className="act-btn" onClick={onReset}>↻</button>
    </footer>
  );
}
