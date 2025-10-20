const hasWindow = typeof window !== "undefined";
const L = {
  get: (k: string) => (hasWindow ? localStorage.getItem(k) : null),
  set: (k: string, v: string) => { if (hasWindow) localStorage.setItem(k, v); },
  del: (k: string) => { if (hasWindow) localStorage.removeItem(k); },
};
const S = {
  get: (k: string) => (hasWindow ? sessionStorage.getItem(k) : null),
  set: (k: string, v: string) => { if (hasWindow) sessionStorage.setItem(k, v); },
  del: (k: string) => { if (hasWindow) sessionStorage.removeItem(k); },
};

export type StoredUser = {
  id: string; globalId: string; email: string; name: string; role: string; roles?: string[]; personaId?: number|string;
};

export function writeSession(token: string, user: StoredUser, remember: boolean) {
  const D = remember ? L : S;
  D.set("token", token);
  D.set("user", JSON.stringify(user));
  if (user.personaId != null && Number.isFinite(Number(user.personaId))) {
    D.set("personaId", String(user.personaId));
  }
}

export function readSession():
  | { token: string; user: StoredUser; remember: boolean }
  | null {
  const tokenLS = L.get("token");
  const tokenSS = S.get("token");
  const token = tokenLS || tokenSS;
  const rawUser = L.get("user") || S.get("user");
  if (!token || !rawUser) return null;
  const user = JSON.parse(rawUser) as StoredUser;
  return { token, user, remember: !!tokenLS };
}

export function clearSessionStorages() {
  for (const k of ["token","user","personaId"]) { L.del(k); S.del(k); }
}
