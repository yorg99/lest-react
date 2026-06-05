import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_TTL_MS } from "../lib/config";

export interface UseToast {
  toast: string;
  show: (msg: string) => void;
}

export function useToast(): UseToast {
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), TOAST_TTL_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, show };
}
