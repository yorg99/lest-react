import type { DataRow } from "./types";

export function buildPt100FilteredMap(
  history: DataRow[],
): Map<number, number | null> {
  const m = new Map<number, number | null>();
  let sum = 0;
  let count = 0;
  for (const item of history) {
    const raw = item.pt100;
    const num = raw === null || raw === undefined ? NaN : Number(raw);
    if (Number.isFinite(num)) {
      sum += num;
      count += 1;
    }
    m.set(item.id, count > 0 ? sum / count : null);
  }
  return m;
}
