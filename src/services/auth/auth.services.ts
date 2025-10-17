// src/services/auth/auth.services.ts
import { http } from "@services/base.api";

export type LoginInput = { globalId: string; password: string };
export type LoginOutput = {
  token: string;
  user: { id: string; globalId: string; email: string; name: string; role: string; roles?: string[] };
};

export async function loginApi(input: LoginInput): Promise<LoginOutput> {
  const gid = String(input.globalId || "").trim().toUpperCase();
  const payload = { globalId: gid, username: gid, login: gid, password: String(input.password || "") };
  const { data } = await http.post<LoginOutput>("/api/auth/login", payload);
  return data;
}

export async function logoutApi(): Promise<void> {
  await http.post("/api/auth/logout", null, { validateStatus: (s) => (s >= 200 && s < 300) || s === 401 });
}

export async function meApi(): Promise<{
  id: string | number; globalId: string; email?: string; name?: string; role?: string; roles?: string[];
}> {
  const { data } = await http.get("/api/auth/me");
  return data;
}
