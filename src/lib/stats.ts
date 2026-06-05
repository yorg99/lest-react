import { UNCERTAINTY } from "./config";
import type { DataRow, Kpis } from "./types";

export function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = arr.reduce((s, v) => s + v, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1),
  );
}

export function computeKpis(history: DataRow[]): Kpis {
  const temps = history
    .map((d) => d.avg)
    .filter((v): v is number => v != null);
  const hums = history
    .map((d) => d.hum)
    .filter((v): v is number => v != null);

  let tempMin: number | null = null;
  let tempMax: number | null = null;
  for (const t of temps) {
    if (tempMin === null || t < tempMin) tempMin = t;
    if (tempMax === null || t > tempMax) tempMax = t;
  }
  let humMin: number | null = null;
  let humMax: number | null = null;
  for (const h of hums) {
    if (humMin === null || h < humMin) humMin = h;
    if (humMax === null || h > humMax) humMax = h;
  }

  const rec30 = temps.slice(-UNCERTAINTY.window);
  const sigma = stddev(rec30);
  const n = rec30.length || 1;
  const uR = UNCERTAINTY.dhtResolution / (2 * Math.sqrt(3));
  const uE = UNCERTAINTY.reference;
  const uRep = sigma / Math.sqrt(n);
  const uc = Math.sqrt(uR ** 2 + uE ** 2 + uRep ** 2);
  const U = UNCERTAINTY.k * uc;
  const hom = tempMax !== null && tempMin !== null ? tempMax - tempMin : 0;
  const slope =
    rec30.length > 2
      ? (((rec30[rec30.length - 1]! - rec30[0]!) / rec30.length) * 60).toFixed(3)
      : "0.000";

  return { sigma, uc, U, hom, slope, tempMin, tempMax, humMin, humMax };
}
