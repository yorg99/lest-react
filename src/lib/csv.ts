import { buildPt100FilteredMap } from "./pt100";
import type { DataRow, Settings } from "./types";

export const CSV_HEADER =
  "Timestamp,ID,Temperature,PT100,PT100_Filtered,Ecart_T,Humidite";

function fullTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function buildCsvRows(
  history: DataRow[],
  settings: Settings,
): string[] {
  const filterMap = buildPt100FilteredMap(history);
  const rows: string[] = [CSV_HEADER];
  for (const d of history) {
    const filtered = filterMap.get(d.id);
    const filteredStr = filtered !== null && filtered !== undefined ? filtered.toFixed(2) : "";
    const td =
      d.avg !== null && d.avg !== undefined && settings.tempTarget !== null
        ? (d.avg - settings.tempTarget).toFixed(2)
        : "";
    const pt100 = d.pt100 !== null && d.pt100 !== undefined ? d.pt100.toFixed(2) : "";
    const temp = d.avg !== null && d.avg !== undefined ? d.avg.toFixed(2) : "";
    const hum = d.hum !== null && d.hum !== undefined ? d.hum.toFixed(1) : "";
    rows.push(
      `${fullTimestamp(d.created_at)},${d.id},${temp},${pt100},${filteredStr},${td},${hum}`,
    );
  }
  return rows;
}

export function downloadCsv(rows: string[], filename: string): void {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function defaultCsvFilename(): string {
  // Minute-granularity keeps filenames unique enough for human exports
  // while staying readable (e.g. LEST_2026-06-05T01-06.csv).
  return `LEST_${new Date().toISOString().slice(0, 16).replace(/:/g, "-")}.csv`;
}
