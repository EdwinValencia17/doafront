// src/services/apis/client.ts
import axios, { type AxiosRequestConfig } from 'axios';
import { resolveBaseURL, DEFAULT_TIMEOUT } from './config';
import { installInterceptors } from './interceptors';
import { retryOnNetwork } from './retry';
import { wire401Refresh, setAuthToken } from './auth';

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
  timeout: DEFAULT_TIMEOUT,
  headers: { Accept: 'application/json, text/plain, */*', 'X-Requested-With': 'XMLHttpRequest' },
});

installInterceptors(api);

// (Opcional) Refresh: implementa si tu back lo soporta.
async function refreshToken(): Promise<string | undefined> {
  // const { data } = await api.post<{ token: string }>('/auth/refresh');
  // setAuthToken(data.token);
  // return data.token;
  return undefined;
}
wire401Refresh(api, refreshToken);

// Usa AxiosRequestConfig en vez de Parameters<typeof api.request<T>>[0] para evitar any implícitos
async function request<T>(cfg: AxiosRequestConfig): Promise<T> {
  return retryOnNetwork(() => api.request<T>(cfg).then(r => r.data));
}

// Define un alias sin 'method'|'url'|'data' para configs por operación
type RequestOpts = Omit<AxiosRequestConfig, 'method' | 'url' | 'data'>;

export const http = {
  get:   <T = unknown>(url: string, config?: RequestOpts) =>
    request<T>({ method: 'get', url, ...config }),

  post:  <T = unknown, D = unknown>(url: string, data?: D, config?: RequestOpts) =>
    request<T>({ method: 'post', url, data, ...config }),

  put:   <T = unknown, D = unknown>(url: string, data?: D, config?: RequestOpts) =>
    request<T>({ method: 'put', url, data, ...config }),

  patch: <T = unknown, D = unknown>(url: string, data?: D, config?: RequestOpts) =>
    request<T>({ method: 'patch', url, data, ...config }),

  delete:<T = unknown>(url: string, config?: RequestOpts) =>
    request<T>({ method: 'delete', url, ...config }),
};

export { api, setAuthToken };
export * from './url';
