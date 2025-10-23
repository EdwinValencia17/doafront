import type { BandejaFiltro } from "./types";
import type { QueryParams, ParamValue } from "@/services/apis/url";

/* ------------------ utils de tipo ------------------ */
const cleanStr = (s?: string | null): string => (s ?? "").toString().trim();
const isEmpty = (v: unknown): boolean =>
  v === undefined || v === null || v === "" || v === "-1";
const toYMD = (d?: string): string | undefined => (d ? d.slice(0, 10) : undefined);

/** Narrowing: unknown -> ParamValue (string | number | boolean | Date | Primitive[]) */
function isPrimitive(v: unknown): v is string | number | boolean {
  return ["string", "number", "boolean"].includes(typeof v);
}
function isParamArray(v: unknown): v is Array<string | number | boolean> {
  return Array.isArray(v) && v.every(isPrimitive);
}
function isParamValue(v: unknown): v is ParamValue {
  return isPrimitive(v) || v instanceof Date || isParamArray(v);
}

/* ------------------ builders ------------------ */
/** Mantiene el shape como QueryParams sin usar `any` */
export const cleanObj = (
  obj: Readonly<Record<string, ParamValue | null | undefined>>
): QueryParams => {
  const out: QueryParams = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isEmpty(v)) continue;
    // v ya es ParamValue | null | undefined por tipo de entrada; filtrado de arriba descarta null/undef
    if (isParamValue(v)) out[k] = v;
  }
  return out;
};

export const buildParams = (f: BandejaFiltro = {}): QueryParams =>
  cleanObj({
    numeroSolicitud: cleanStr(f.numeroSolicitud),
    numeroOc:        cleanStr(f.numeroOc),
    centroCosto:     cleanStr(f.centroCosto),
    compania:        cleanStr(f.compania),
    solicitante:     cleanStr(f.solicitante),
    sistema:         cleanStr(f.sistema),
    proveedorNit:    cleanStr(f.proveedorNit),
    prioridad:       cleanStr(f.prioridad),
    fechaInicio:     toYMD(f.fechaInicio),
    fechaFin:        toYMD(f.fechaFin),
    page:            f.page ?? 1,
    pageSize:        f.pageSize ?? 20,
    sortField:       f.sortField ?? "c0p.fecha_orden_compra",
    sortOrder:       f.sortOrder ?? "DESC",
  });

/* ------------------ combos (sin any) ------------------ */
function pick(obj: Readonly<Record<string, unknown>>, key: string): string | undefined {
  const v = obj[key];
  return v == null ? undefined : String(v);
}

/**
 * Normaliza objetos heterogéneos a { value, label } sin `any`.
 * Busca: value/label; si no, usa claves alternativas (code/name).
 */
export const normalizeCombo = (
  x: Readonly<Record<string, unknown>>,
  code: string = "codigo",
  name: string = "descripcion"
): { value: string; label: string } => {
  const value = pick(x, "value") ?? pick(x, code) ?? "";
  const label = pick(x, "label") ?? pick(x, name) ?? "";
  return { value, label: label || value };
};
