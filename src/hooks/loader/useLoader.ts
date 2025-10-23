// src/hooks/loader/useLoader.ts
import { useContext } from "react";
import { LoaderCtx } from "@/features/loader/LoaderCtx";
import type { Ctx } from "@/features/loader/types";

export function useLoader(): Ctx {
  const ctx = useContext(LoaderCtx);
  if (!ctx) throw new Error("useLoader must be used within LoaderProvider");
  return ctx;
}
