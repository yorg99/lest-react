import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

export interface UseSupabaseAuth {
  session: Session | null;
  authChecking: boolean;
  authBusy: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useSupabaseAuth(): UseSupabaseAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) setAuthError("Impossible de vérifier la session.");
      setSession(data?.session ?? null);
      setAuthChecking(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message || "Erreur d'authentification.");
    }
    setAuthBusy(false);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, authChecking, authBusy, authError, login, logout };
}
