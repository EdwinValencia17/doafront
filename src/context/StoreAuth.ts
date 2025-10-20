// store/contextAuth.ts
import { create } from "zustand";

export type User = {
  id: string;
  globalId: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
  personaId?: number | string;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  remember: boolean;
  hydrated: boolean;

  setSession: (p: { token: string; user: User; remember: boolean }) => void;
  clearSession: () => void;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  remember: true,
  hydrated: false,

  setSession: ({ token, user, remember }) => set({ accessToken: token, user, remember }),
  clearSession: () => set({ accessToken: null, user: null, remember: true }),
  markHydrated: () => set({ hydrated: true }),
}));

declare global {
  interface Window {
    __APP_USER?: { personaId?: number } & Record<string, unknown>;
  }
}
export {};
