export type Toast = string;

export interface Settings {
  tempTarget: number;
  tempThreshold: number;
  humTarget: number;
  humThreshold: number;
  testName: string;
  totalDur: number;
}

export interface DataRow {
  id: number;
  avg: number | null;
  pt100: number | null;
  hum: number | null;
  created_at: string;
  label: string;
}

export type ChartMode = "avg" | "hum";

export type Tab = "chart" | "table" | "uncert";

export type ModalType = "temp" | "hum" | null;

export interface Kpis {
  sigma: number;
  uc: number;
  U: number;
  hom: number;
  slope: string;
  tempMin: number | null;
  tempMax: number | null;
  humMin: number | null;
  humMax: number | null;
}
