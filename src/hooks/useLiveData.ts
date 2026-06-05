import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ESP_ONLINE_THRESHOLD_S,
  MAX_CHART_POINTS,
  POLL_INTERVAL_MS,
} from "../lib/config";
import { fetchHistory, fetchLatestPoint } from "../lib/supabase/data";
import { formatTS } from "../lib/supabase/format";
import type { DataRow } from "../lib/types";

export interface UseLiveData {
  history: DataRow[];
  lastId: number;
  espOnline: boolean;
  lastSeenTs: string | null;
  totalPts: number;
  status: string;
  reload: () => Promise<void>;
}

export function useLiveData(session: Session | null): UseLiveData {
  const [history, setHistory] = useState<DataRow[]>([]);
  const [lastId, setLastId] = useState(0);
  const [espOnline, setEspOnline] = useState(false);
  const [lastSeenTs, setLastSeenTs] = useState<string | null>(null);
  const [totalPts, setTotalPts] = useState(0);
  const [status, setStatus] = useState("⏳ Connexion…");

  const lastIdRef = useRef(0);
  const lastSeenRef = useRef<string | null>(null);

  useEffect(() => {
    lastSeenRef.current = lastSeenTs;
  }, [lastSeenTs]);

  const reload = useCallback(async () => {
    const result = await fetchHistory();
    if (result.error) {
      setStatus("❌ Erreur Supabase");
      return;
    }
    setHistory(result.rows);
    if (result.rows.length > 0) {
      lastIdRef.current = result.lastId;
      setLastId(result.lastId);
      setLastSeenTs(result.lastSeenTs);
      setTotalPts(result.totalPts);
      setStatus("✅ Supabase · Live");
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setHistory([]);
      lastIdRef.current = 0;
      setLastId(0);
      setEspOnline(false);
      setLastSeenTs(null);
      setTotalPts(0);
      setStatus("⏳ Connexion…");
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await fetchHistory();
      if (cancelled) return;
      if (result.error) {
        setStatus("❌ Erreur Supabase");
        return;
      }
      setHistory(result.rows);
      if (result.rows.length > 0) {
        lastIdRef.current = result.lastId;
        setLastId(result.lastId);
        setLastSeenTs(result.lastSeenTs);
        setTotalPts(result.totalPts);
        setStatus("✅ Supabase · Live");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      void (async () => {
        const { row, error } = await fetchLatestPoint();
        if (error || !row) {
          setEspOnline(false);
          setStatus(
            `⚠️ ESP hors ligne · dernier: ${formatTS(lastSeenRef.current)}`,
          );
          return;
        }
        const age = (Date.now() - new Date(row.created_at).getTime()) / 1000;
        const online = age < ESP_ONLINE_THRESHOLD_S;
        setEspOnline(online);
        setLastSeenTs(row.created_at);
        setStatus(
          online
            ? "✅ ESP8266 · Live"
            : `⚠️ ESP hors ligne · dernier: ${formatTS(row.created_at)}`,
        );

        if (row.id === lastIdRef.current) return;
        lastIdRef.current = row.id;
        setLastId(row.id);
        setTotalPts(row.id);

        const point: DataRow = {
          id: row.id,
          avg: row.temperature,
          pt100: row.pt100_temp ?? null,
          hum: row.humidity,
          created_at: row.created_at,
          label: formatTS(row.created_at),
        };
        setHistory((prev) => {
          const next = [...prev, point];
          return next.length > MAX_CHART_POINTS
            ? next.slice(next.length - MAX_CHART_POINTS)
            : next;
        });
      })();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [session]);

  return { history, lastId, espOnline, lastSeenTs, totalPts, status, reload };
}
