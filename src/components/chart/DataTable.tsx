import { useMemo } from "react";
import { buildPt100FilteredMap } from "../../lib/pt100";
import type { DataRow, Settings } from "../../lib/types";

export interface DataTableProps {
  history: DataRow[];
  settings: Settings;
  U: number;
}

const ROWS = 40;

function fmtSigned(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}

export default function DataTable({ history, settings, U }: DataTableProps) {
  const filteredById = useMemo(() => buildPt100FilteredMap(history), [history]);
  const rows = history.slice(0, ROWS);

  return (
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
          {rows.map((d) => {
            const tdRef =
              d.avg !== null ? +(d.avg - settings.tempTarget).toFixed(2) : null;
            const pt100FilteredVal = filteredById.get(d.id) ?? null;
            const delta =
              d.pt100 !== null && d.avg !== null && pt100FilteredVal !== null
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
                <td style={{ fontSize: 10, color: "#7d8590" }}>{d.label}</td>
                <td className="td-r">
                  {d.avg !== null ? d.avg.toFixed(1) : "—"}
                </td>
                <td className="td-r">
                  {d.pt100 !== null ? Number(d.pt100).toFixed(2) : "—"}
                </td>
                <td className="td-r">
                  {pt100FilteredVal !== null ? pt100FilteredVal.toFixed(2) : "—"}
                </td>
                <td
                  className={
                    delta !== null && Math.abs(delta) > settings.tempThreshold
                      ? "td-r"
                      : "td-c"
                  }
                >
                  {delta === null ? "—" : fmtSigned(delta)}
                </td>
                <td className="td-c">
                  {d.hum !== null ? d.hum.toFixed(1) : "—"}
                </td>
                <td>{settings.humTarget.toFixed(1)}</td>
                <td className="td-y">±{U.toFixed(3)}°C</td>
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
  );
}
