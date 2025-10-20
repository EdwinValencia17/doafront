// src/services/apis/interceptors.ts
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { DEV } from './config';
import { normalizeError } from './errors';
import { attachAuthHeader } from './auth';

function genCorrelationId() {
  return 'corr-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Extendemos localmente para guardar un timestamp sin usar any
type CfgWithTs = InternalAxiosRequestConfig & { _ts?: number };

export function installInterceptors(api: AxiosInstance) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // headers es AxiosHeaders: usar set()
    config.headers.set('X-Correlation-Id', genCorrelationId());

    attachAuthHeader(config);

    // marca tiempo para métricas simples
    (config as CfgWithTs)._ts = Date.now();

    if (DEV) {
      console.debug(
        `[req] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url}`,
        { params: config.params, data: (config as CfgWithTs).data }
      );
    }
    return config;
  });

  api.interceptors.response.use(
    (res: AxiosResponse) => {
      if (DEV) {
        const cfg = res.config as CfgWithTs;
        const dur = cfg._ts ? Date.now() - cfg._ts : undefined;
        console.debug(`[res] ${res.status} ${res.config.url} ${dur ? `(${dur}ms)` : ''}`, res.data);
      }
      return res;
    },
    (error) => {
      const info = normalizeError(error);
      if (DEV) console.error('[err]', info, error);
      return Promise.reject(error);
    }
  );
}
