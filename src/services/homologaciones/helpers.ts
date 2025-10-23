import type { Paged } from './types';

export const BASE = '/api/homologaciones';
export const LOG = true; // si quieres: import.meta.env.DEV && ...

export const normPaged = <T>(raw: any): Paged<T> => {
  if (LOG) console.log('[homologaciones] raw paged →', raw);
  if (raw?.pagination) {
    const { page, limit, total, totalPages } = raw.pagination;
    return { data: raw.data ?? [], page, limit, total, totalPages, raw };
  }
  return {
    data: raw?.data ?? [],
    page: raw?.page ?? 1,
    limit: raw?.limit ?? (Array.isArray(raw?.data) ? raw.data.length : 0),
    total: raw?.total ?? (Array.isArray(raw?.data) ? raw.data.length : 0),
    raw,
  };
};

export const pickParams = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    out[k] = v;
  });
  return out;
};

export const asNumber = (v: number | string | undefined | null) =>
  v === undefined || v === null ? v : Number(v);
