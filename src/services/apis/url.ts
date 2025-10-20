// src/services/apis/url.ts
type Primitive = string | number | boolean;
type ParamValue = Primitive | Date | Primitive[];

export type QueryParams = Record<string, ParamValue | null | undefined>;

function toParamString(v: ParamValue): string {
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(String).join(','); // ajusta si prefieres repetir clave
  return String(v);
}

export function buildUrl(path: string, params?: QueryParams): string {
  if (!params) return path;
  const usp = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      // Si prefieres ?k=a&k=b en vez de "a,b", usa append por elemento:
      // v.forEach(item => usp.append(k, String(item)));
      usp.append(k, toParamString(v));
    } else {
      usp.append(k, toParamString(v));
    }
  }

  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}
