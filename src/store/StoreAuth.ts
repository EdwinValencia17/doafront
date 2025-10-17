import { create } from "zustand";
import { logoutApi, meApi } from "@services/auth/auth.services";

// ---- Tipos ----
type User = {
  id: string;
  globalId: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
  /** opcional, lo manda el back para la bandeja */
  personaId?: number | string;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  remember: boolean;
  clearSession: () => void;
  logout: (opts?: { remote?: boolean }) => void;
  login: (p: { token: string; user: User; remember: boolean }) => void;
  initFromStorage: () => Promise<void>;
};

// Tipado del objeto global que usas para compartir info
declare global {
  interface Window {
    __APP_USER?: { personaId?: number } & Record<string, unknown>;
  }
}

// ---- Implementación ----
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  remember: true,

  clearSession: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("personaId");
    sessionStorage.removeItem("personaId");
    set({ accessToken: null, user: null, remember: true });
  },

  logout: ({ remote = true } = {}) => {
    const doClear = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("personaId");
      sessionStorage.removeItem("personaId");
      set({ accessToken: null, user: null, remember: true });
    };
    if (remote) {
      logoutApi().catch(() => {}).finally(doClear);
    } else {
      doClear();
    }
  },

  login: ({ token, user, remember }) => {
    const persist = remember ? localStorage : sessionStorage;
    persist.setItem("token", token);
    persist.setItem("user", JSON.stringify(user));

    // personaId tipado (sin any)
    const personaIdRaw = user.personaId;
    const personaId =
      personaIdRaw !== undefined && personaIdRaw !== null
        ? Number(personaIdRaw)
        : undefined;

    if (personaId !== undefined && Number.isFinite(personaId)) {
      persist.setItem("personaId", String(personaId));
      window.__APP_USER = { ...(window.__APP_USER ?? {}), personaId };
    }

    set({ accessToken: token, user, remember });
  },

  initFromStorage: async () => {
    const tokenLS = localStorage.getItem("token");
    const tokenSS = sessionStorage.getItem("token");
    const token = tokenLS || tokenSS;

    const rawUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = rawUser ? (JSON.parse(rawUser) as User) : null;

    if (token && user) {
      set({ accessToken: token, user, remember: !!tokenLS });
      try {
        const fresh = await meApi();
        const newUser: User = {
          id: String(fresh.id),
          globalId: fresh.globalId,
          email: fresh.email ?? "",
          name: fresh.name ?? fresh.globalId,
          role: fresh.role ?? "USUARIO",
          roles: fresh.roles ?? [],
          // si tu /me también devuelve personaId, lo respetamos
          personaId: (fresh as unknown as { personaId?: number | string })?.personaId,
        };
        (tokenLS ? localStorage : sessionStorage).setItem("user", JSON.stringify(newUser));

        // sincroniza personaId almacenado (si aplica)
        const personaId =
          newUser.personaId !== undefined && newUser.personaId !== null
            ? Number(newUser.personaId)
            : undefined;
        if (personaId !== undefined && Number.isFinite(personaId)) {
          (tokenLS ? localStorage : sessionStorage).setItem("personaId", String(personaId));
          window.__APP_USER = { ...(window.__APP_USER ?? {}), personaId };
        }

        set({ user: newUser });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        localStorage.removeItem("personaId");
        sessionStorage.removeItem("personaId");
        set({ accessToken: null, user: null, remember: true });
      }
    } else {
      set({ accessToken: null, user: null, remember: true });
    }
  },
}));

export {}; // para que el `declare global` sea válido en módulo
