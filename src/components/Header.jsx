import React, { useRef } from 'react';

export default function Header({ onExport, onUpload }) {
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const lines  = ev.target.result.split('\n').filter(l => l.trim());
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,|\t]/);
          if (cols.length < 3) continue;
          parsed.push({ tt: parseFloat(cols[1]) || 25, ht: parseFloat(cols[2]) || 60 });
        }
        if (parsed.length) onUpload(parsed);
      } catch {}
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  return (
    <header className="header">
      <div className="h-left">
        <div className="logo">🔬</div>
        <div>
          <div className="h-title">LEST — Étalonnage d'Étuves Thermiques</div>
          <div className="h-sub">ESP8266 NodeMCU · DHT11 · Supabase Cloud · 1 Hz</div>
        </div>
      </div>

      <div className="h-badges">
        <span className="badge b-iso">ISO 17025</span>
        <span className="badge b-iso">NF EN 60068-3-5</span>
        <span className="badge b-tun">TUNAC</span>
        <span className="badge b-live">
          <span className="live-dot"/>Live · 1 Hz
        </span>
      </div>

      <div className="h-right">
        <button className="export-btn" onClick={onExport}>⬇ Export CSV</button>
        <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{display:'none'}} onChange={handleFile}/>
        <button className="upload-btn" onClick={() => fileRef.current.click()}>⬆ Charger Profil</button>
      </div>
    </header>
  );
}
