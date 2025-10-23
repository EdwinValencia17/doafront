export type ApiArray<T> = T[];
export type ApiRows<T>  = { rows: T[] };
export type ApiData<T>  = { data: T[] };
export type ApiPayload<T> = ApiArray<T> | ApiRows<T> | ApiData<T>;

export function toArray<T>(p: ApiPayload<T>): T[] {
  if (Array.isArray(p)) return p;
  if ('rows' in p) return p.rows;
  if ('data' in p) return p.data;
  return [];
}

export function safeParseArray<T>(s: string | null | undefined): T[] {
  try {
    const v = JSON.parse(s ?? '[]');
    return Array.isArray(v) ? (v as T[]) : [];
  } catch { return []; }
}
