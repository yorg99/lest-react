import { buildPt100FilteredMap } from "./pt100";
import type { DataRow, Settings } from "./types";

export const CSV_HEADER =
  "Timestamp,ID,Temperature,PT100,PT100_Filtered,Ecart_T,Humidite";

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
      `${d.label},${d.id},${temp},${pt100},${filteredStr},${td},${hum}`,
    );
  }
  return rows;
}

export function downloadCsv(rows: string[], filename: string): void {
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function defaultCsvFilename(): string {
  return `LEST_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
}
