import { HISTORY_LIMIT } from "../config";
import { formatTS } from "./format";
import { supabase } from "./client";
import type { DataRow } from "../types";

interface RawRow {
  id: number;
  temperature: number | null;
  pt100_temp: number | null;
  humidity: number | null;
  created_at: string;
}

export interface HistoryFetchResult {
  rows: DataRow[];
  lastId: number;
  lastSeenTs: string | null;
  error: string | null;
}

function mapRows(data: RawRow[]): DataRow[] {
  // Supabase returns id-DESC (newest first). Flip to ascending so
  // callers can read history chronologically: rows[0] = oldest, last row = newest.
  return data
    .map((r) => ({
      id: r.id,
      avg: r.temperature,
      pt100: r.pt100_temp ?? null,
      hum: r.humidity,
      created_at: r.created_at,
      label: formatTS(r.created_at),
    }))
    .reverse();
}

export async function fetchHistory(limit = HISTORY_LIMIT): Promise<HistoryFetchResult> {
  const { data, error } = await supabase
    .from("data")
    .select("id, temperature, pt100_temp, humidity, created_at")
    .order("id", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return { rows: [], lastId: 0, lastSeenTs: null, error: error?.message ?? "fetch failed" };
  }

  const rows = mapRows(data);
  const last = rows[rows.length - 1];
  return {
    rows,
    lastId: last ? last.id : 0,
    lastSeenTs: last ? last.created_at : null,
    error: null,
  };
}

export async function fetchLatestPoint(): Promise<{
  row: RawRow | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("data")
    .select("id, temperature, pt100_temp, humidity, created_at")
    .order("id", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { row: null, error: error?.message ?? "no data" };
  }
  return { row: data[0] as RawRow, error: null };
}
