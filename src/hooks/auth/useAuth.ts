import { useCallback } from "react";
import { useAuthStore, type User } from "@/context/StoreAuth";
import { loginApi, logoutApi, meApi } from "@/services/auth/auth.services"; // ajusta si tu ruta es diferente
import { writeSession, readSession, clearSessionStorages } from "@/auth/session.adapter";

function syncGlobalPersona(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user?.personaId) return;
  const n = Number(user.personaId);
  if (Number.isFinite(n)) {
    window.__APP_USER = { ...(window.__APP_USER ?? {}), personaId: n };
  }
}

export function useAuth() {
  const { setSession, clearSession, markHydrated, accessToken, user, hydrated } = useAuthStore();

  const initFromStorage = useCallback(async () => {
    const saved = readSession();
    if (!saved) { markHydrated(); return; }

    setSession({ token: saved.token, user: saved.user as User, remember: saved.remember });

    try {
      const fresh = await meApi();
      const newUser: User = {
        id: String(fresh.id),
        globalId: fresh.globalId,
        email: fresh.email ?? "",
        name: fresh.name ?? fresh.globalId,
        role: fresh.role ?? "USUARIO",
        roles: fresh.roles ?? [],
        personaId: (fresh as unknown as { personaId?: number | string })?.personaId,
      };
      writeSession(saved.token, newUser, saved.remember);
      setSession({ token: saved.token, user: newUser, remember: saved.remember });
      syncGlobalPersona(newUser);
    } catch {
      clearSessionStorages();
      clearSession();
    } finally {
      markHydrated();
    }
  }, [setSession, clearSession, markHydrated]);

  const login = useCallback(async (p: { globalId: string; password: string; remember: boolean }) => {
    const globalId = String(p.globalId || "").trim().toUpperCase();
    const password = String(p.password || "");
    const { token, user } = await loginApi({ globalId, password });
    writeSession(token, user, p.remember);
    setSession({ token, user: user as User, remember: p.remember });
    syncGlobalPersona(user as User);
    return { token, user };
  }, [setSession]);

  const logout = useCallback(async ({ remote = true }: { remote?: boolean } = {}) => {
    try { if (remote) await logoutApi(); } catch { /* noop */ }
    finally {
      clearSessionStorages();
      clearSession();
    }
  }, [clearSession]);

  return { accessToken, user, hydrated, initFromStorage, login, logout };
}
