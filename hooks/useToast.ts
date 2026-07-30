"use client";

import { useCallback, useRef, useState } from "react";

export type ToastTone = "success" | "error" | "warning";
export type ToastState = { tone: ToastTone; title: string; message: string };

export function useToast(duration = 4500) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | null>(null);

  const showToast = useCallback(
    (nextToast: ToastState) => {
      if (timer.current) window.clearTimeout(timer.current);
      setToast(nextToast);
      timer.current = window.setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  const dismissToast = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}
