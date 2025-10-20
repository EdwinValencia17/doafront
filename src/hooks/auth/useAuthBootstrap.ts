// src/auth/useAuthBootstrap.ts
import { useEffect } from "react";
import { useAuth } from "./useAuth";

export function useAuthBootstrap() {
  const { initFromStorage, hydrated } = useAuth();
  useEffect(() => { void initFromStorage(); }, [initFromStorage]);
  return { hydrated };
}
