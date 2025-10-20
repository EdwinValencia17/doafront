// src/auth/useLogin.ts
import { useState, useCallback } from "react";
import { isAxiosError } from "axios";
import { useAuth } from "./useAuth";

type ApiError = { error?: string; message?: string };

export function useLogin() {
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (p: { globalId: string; password: string; remember: boolean }) => {
    setError(null);
    const globalId = String(p.globalId || "").trim();
    const password = String(p.password || "");
    if (!globalId) { setError("Ingresa tu Global ID."); return false; }
    if (!password) { setError("Ingresa tu contraseña."); return false; }

    try {
      setBusy(true);
      await login({ globalId, password, remember: !!p.remember });
      return true;
    } catch (err: unknown) {
      let msg = "Error de autenticación";
      if (isAxiosError(err)) {
        const data = err.response?.data as ApiError | undefined;
        msg = data?.error ?? data?.message ?? err.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      setError(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }, [login]);

  return { busy, error, submit, setError };
}
