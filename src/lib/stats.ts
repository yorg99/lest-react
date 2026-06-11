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

  const tempMin = temps.length > 0 ? Math.min(...temps) : null;
  const tempMax = temps.length > 0 ? Math.max(...temps) : null;
  const humMin = hums.length > 0 ? Math.min(...hums) : null;
  const humMax = hums.length > 0 ? Math.max(...hums) : null;

  const rec30 = temps.slice(-UNCERTAINTY.window);
  const sigma = stddev(rec30);
  const n = rec30.length || 1;
  const uR = UNCERTAINTY.dhtResolution / (2 * Math.sqrt(3));
  const uE = UNCERTAINTY.reference;
  const uRep = sigma / Math.sqrt(n);
  const uc = Math.sqrt(uR ** 2 + uE ** 2 + uRep ** 2);
  const U = UNCERTAINTY.k * uc;
  const hom = tempMax !== null && tempMin !== null ? tempMax - tempMin : 0;
  // Endpoint slope (°C/min): total change across the last `window` points
  // extrapolated to one minute. Cheap and intuitive, but sensitive to noise
  // on the two endpoints — replace with a least-squares fit if a smoother
  // drift number is needed.
  const slope =
    rec30.length > 2
      ? (((rec30[rec30.length - 1]! - rec30[0]!) / rec30.length) * 60).toFixed(3)
      : "0.000";

  return { sigma, uc, U, hom, slope, tempMin, tempMax, humMin, humMax };
}
