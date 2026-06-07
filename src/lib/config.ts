import type { Settings } from "./types";

export const POLL_INTERVAL_MS = 1000;
export const ESP_ONLINE_THRESHOLD_S = 10;
export const HISTORY_LIMIT = 2000;
export const MAX_CHART_POINTS = 80;
export const TOAST_TTL_MS = 3500;
export const TOTAL_DUR_SECONDS = 72 * 3600;

export const UNCERTAINTY = {
  dhtResolution: 0.1,
  reference: 0.025,
  window: 30,
  k: 2,
} as const;

export const DEFAULTS: Settings = {
  tempTarget: 25.0,
  tempThreshold: 2.0,
  humTarget: 60.0,
  humThreshold: 5.0,
  testName: "Étalonnage — Étuve LEST #1",
  totalDur: TOTAL_DUR_SECONDS,
};
