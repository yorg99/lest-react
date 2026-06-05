import { UNCERTAINTY } from "../../lib/config";

export interface UncertaintyViewProps {
  uc: number;
  U: number;
  hom: number;
  sigma: number;
}

const CARDS: ReadonlyArray<{
  title: string;
  val: (p: UncertaintyViewProps) => string;
  color: string;
  sub: string;
}> = [
  {
    title: "Incertitude type uc(T)",
    val: ({ uc }) => `±${uc.toFixed(4)}°C`,
    color: "var(--yellow)",
    sub: "Combinée standard",
  },
  {
    title: "Incertitude élargie U(T)",
    val: ({ U }) => `±${U.toFixed(4)}°C`,
    color: "var(--red)",
    sub: `k=${UNCERTAINTY.k} · conf. 95%`,
  },
  {
    title: "Variation ΔT",
    val: ({ hom }) => `${hom.toFixed(3)}°C`,
    color: "var(--cyan)",
    sub: "Max − Min session",
  },
  {
    title: "Stabilité σ",
    val: ({ sigma }) => `${sigma.toFixed(4)}°C`,
    color: "var(--purple)",
    sub: `Écart-type ${UNCERTAINTY.window}s`,
  },
  {
    title: "Résolution DHT11",
    val: () => `${UNCERTAINTY.dhtResolution}°C`,
    color: "var(--green)",
    sub: "Résolution capteur",
  },
  {
    title: "Étalon référence",
    val: () => `±${UNCERTAINTY.reference}°C`,
    color: "var(--muted)",
    sub: "Référence COFRAC",
  },
];

export default function UncertaintyView(props: UncertaintyViewProps) {
  return (
    <div className="uncert-wrap">
      <div className="u-grid">
        {CARDS.map((c) => (
          <div key={c.title} className="u-card">
            <div className="u-title">{c.title}</div>
            <div className="u-val" style={{ color: c.color }}>
              {c.val(props)}
            </div>
            <div className="u-sub">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="u-formula">
        <span>U(T)</span> = k × uc(T) = k × √[ u²résol + u²répéta + u²étalon ]
        <br />
        <span>urésol</span> = {UNCERTAINTY.dhtResolution} / (2√3) ≈{" "}
        {(UNCERTAINTY.dhtResolution / (2 * Math.sqrt(3))).toFixed(3)}°C (DHT11)
        <br />
        <span>urépéta</span> = σ / √n ← stabilité glissant {UNCERTAINTY.window}s
        <br />
        <span>uétalon</span> = {UNCERTAINTY.reference}°C (référence COFRAC)
      </div>
    </div>
  );
}
