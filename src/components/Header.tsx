export interface HeaderProps {
  onExport: () => void;
  onLogout?: () => void;
}

export default function Header({ onExport, onLogout }: HeaderProps) {
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
          <span className="live-dot" />Live · 1 Hz
        </span>
      </div>

      <div className="h-right">
        <button className="export-btn" onClick={onExport}>⬇ Export CSV</button>
        {onLogout ? (
          <button className="logout-btn" onClick={onLogout}>🔓 Se déconnecter</button>
        ) : null}
      </div>
    </header>
  );
}
