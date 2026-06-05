import { MINI_CARD_COUNT } from "../lib/config";
import type { DataRow } from "../lib/types";

export interface MiniCardsProps {
  history: DataRow[];
  tempTarget: number;
}

export default function MiniCards({ history, tempTarget }: MiniCardsProps) {
  const last9 = history.slice(-MINI_CARD_COUNT);

  return (
    <section className="ch-section">
      <div className="sec-hdr">
        <div className="sec-title">🌡 Historique — 9 Dernières Mesures Supabase</div>
        <div className="sbadge s-ok" style={{ fontSize: 10 }}>
          <span className="sp" />Données OK
        </div>
      </div>
      <div className="ch-grid">
        {Array.from({ length: MINI_CARD_COUNT }, (_, i) => {
          const d = last9[i];
          const diff = d ? +(d.avg! - tempTarget).toFixed(2) : null;
          const ab = diff !== null ? Math.abs(diff) : 0;
          const cls = ab > 2 ? "err" : ab > 1 ? "warn" : "ok";
          return (
            <div
              key={i}
              className={`ch-card ${ab > 2 ? "c-alert" : ab > 1 ? "c-warn" : ""}`}
            >
              <div className={`ch-ind ${ab > 2 ? "err" : ab > 1 ? "warn" : ""}`} />
              <div className="ch-num">mesure {i + 1}</div>
              <div className="ch-pos">{d ? d.label : "—"}</div>
              <div className="ch-tv">
                {d && d.avg !== null ? `${d.avg.toFixed(1)}°C` : "—"}
              </div>
              <div className={`ch-dv ${d ? cls : ""}`}>
                {diff !== null ? `${diff >= 0 ? "+" : ""}${diff}°C` : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
