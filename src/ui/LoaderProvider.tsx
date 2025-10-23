// src/ui/LoaderProvider.tsx  (SOLO componente)
import React, { useMemo, useRef, useState } from "react";
import { LoaderCtx } from "@/features/loader/LoaderCtx";
import type { Ctx } from "@/features/loader/types";
import spinLogo from "@/assets/images__9_loading-removebg-preview.png";
import NeonImageLoader from "@/context/NeonRingLoader";

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const lock = useRef(0);

  const api = useMemo<Ctx>(() => ({
    show(){ lock.current++; setPending(p => p + 1); },
    hide(){ if (lock.current > 0) lock.current--; setPending(p => Math.max(0, p - 1)); if (!lock.current) setProgress(undefined); },
    setProgress(n?: number){ setProgress(typeof n === "number" ? Math.max(0, Math.min(100, n)) : undefined); },
    busy: pending > 0,
  }), [pending]);

  return (
    <LoaderCtx.Provider value={api}>
      {children}
      <NeonImageLoader visible={pending > 0} percent={progress} imageUrl={spinLogo} />
    </LoaderCtx.Provider>
  );
}
