// src/services/apis/auth.ts
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let accessToken: string | undefined;
let refreshing = false;
let waiters: Array<(t?: string) => void> = [];

export function setAuthToken(token?: string) {
  accessToken = token;
}

// 👉 Recibe InternalAxiosRequestConfig y usa headers.set
export function attachAuthHeader(config: InternalAxiosRequestConfig) {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
}

export function onUnauthorizedStart() { refreshing = true; }
export function onUnauthorizedDone(newToken?: string) {
  refreshing = false;
  accessToken = newToken ?? accessToken;
  waiters.forEach(w => w(accessToken));
  waiters = [];
}

export function enqueueWhileRefreshing(): Promise<string | undefined> {
  return new Promise(res => waiters.push(res));
}

export function wire401Refresh(api: AxiosInstance, refreshFn: () => Promise<string | undefined>) {
  api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error) => {
      if (error?.response?.status !== 401) throw error;

      if (!refreshing) {
        onUnauthorizedStart();
        try {
          const newTok = await refreshFn();
          onUnauthorizedDone(newTok);
        } catch {
          onUnauthorizedDone(undefined);
          throw error;
        }
      } else {
        await enqueueWhileRefreshing();
      }

      if (accessToken) {
        const cfg = error.config!;
        // Axios volverá a construir headers; Authorization ya la pondrá attachAuthHeader en request
        return api.request(cfg);
      }
      throw error;
    }
  );
}
