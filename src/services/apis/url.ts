// src/services/apis/url.ts
export type Primitive = string | number | boolean;
export type ParamValue = Primitive | Date | Primitive[]; // 👈 ahora exportado

export type QueryParams = Record<string, ParamValue | null | undefined>;

function toParamString(v: ParamValue): string {
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(String).join(',');
  return String(v);
}

export function buildUrl(path: string, params?: QueryParams): string {
  if (!params) return path;
  const usp = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      usp.append(k, toParamString(v));
    } else {
      usp.append(k, toParamString(v));
    }
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}
