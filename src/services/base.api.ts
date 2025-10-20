
/*import axios, {
  AxiosHeaders,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import { useAuthStore } from "@/context/StoreAuth";

const ENV_BASE = import.meta.env.VITE_API_URL as string | undefined;

function resolveBaseURL(): string {
  if (!ENV_BASE) {
    throw new Error(
      "[http] VITE_API_URL no está definido. Configura .env (p.ej. http://10.4.55.81:3001)."
    );
  }
  try {
    const frontIsLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const apiIsLocal = /:\/\/(localhost|127\.0\.0\.1)/.test(ENV_BASE);
    if (!frontIsLocal && apiIsLocal) {
      console.warn(
        "[http] Front no-local y API en localhost → PNA. Usa la IP LAN del back."
      );
    }
  } catch {
    // no-op (SSR)
  }
  return ENV_BASE;
}

export const http = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
});

// Helper: asegura AxiosHeaders y setea Authorization sin casts raros
function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) config.headers = new AxiosHeaders();
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers);
  }
  (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  return config;
}

// 🔐 Adjunta Bearer si existe (store || storages)
http.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().accessToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  return token ? setAuthHeader(config, token) : config;
});

// Tipo opcional de la respuesta de error del back
type ErrorResponse = {
  message?: string;
  code?: string;
  status?: number;
  errors?: Record<string, unknown>;
};

// 🛡️ 401 → limpia SOLO local (evita loops si /logout también responde 401)
http.interceptors.response.use(
  (r) => r,
  (err: unknown) => {
    if (isAxiosError<ErrorResponse>(err) && err.response?.status === 401) {
      try {
        useAuthStore.getState().logout({ remote: false });
      } catch {
        // fallback por si el store aún no está listo
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
    return Promise.reject(err);
  }
);
*/