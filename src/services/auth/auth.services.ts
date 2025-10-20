// src/services/auth/auth.services.ts
import { http } from '@/services/apis/client';

export type LoginInput = { globalId: string; password: string };

export type LoginUser = {
  id: string;
  globalId: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
};

export type LoginOutput = {
  token: string;
  user: LoginUser;
};

type MeOutput = {
  id: string | number;
  globalId: string;
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
};

export async function loginApi(input: LoginInput): Promise<LoginOutput> {
  const gid = String(input.globalId || '').trim().toUpperCase();
  const payload = {
    globalId: gid,
    username: gid, // por compatibilidad con back antiguos
    login: gid,    // por compatibilidad con back antiguos
    password: String(input.password || ''),
  };
  // http.post devuelve directamente T (no AxiosResponse)
  return http.post<LoginOutput>('/api/auth/login', payload);
}

export async function logoutApi(): Promise<void> {
  // Si tu back espera body vacío, pasa undefined en data
  await http.post<void>('/api/auth/logout', undefined, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 401,
  });
}

export async function meApi(): Promise<MeOutput> {
  return http.get<MeOutput>('/api/auth/me');
}
