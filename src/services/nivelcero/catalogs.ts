
import { http } from "@/services/apis/client";
import { makeCache } from "./cache";
import { normalizeCombo } from "./params";
import type { ComboItem } from "./types";

const cache = makeCache(60_000);
const base = "/api/doa/po/catalogos";

/* ---------- Utilidades 100% type-safe ---------- */
type JR = Record<string, unknown>;

const isPrim = (v: unknown): v is string | number | boolean =>
  typeof v === "string" || typeof v === "number" || typeof v === "boolean";

const hasVL = (o: JR): o is { value: string | number; label: string | number } =>
  isPrim(o.value) && isPrim(o.label);

/** Toma el primer valor “stringificable” según el orden de llaves dado */
const pickStr = (o: JR, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = o[k];
    if (isPrim(v)) return String(v);
  }
  return undefined;
};

/** Normaliza con preferencia de llaves (sin any, sin castings peligrosos) */
const normalizeWithPrefs = (
  o: JR,
  valueKeys: string[],
  labelKeys: string[],
  fallbackCode = "codigo",
  fallbackName = "descripcion"
): ComboItem => {
  const value = pickStr(o, valueKeys) ?? pickStr(o, [fallbackCode]) ?? "";
  const label = pickStr(o, labelKeys) ?? pickStr(o, [fallbackName]) ?? value;
  return { value, label };
};

export const CatalogsService = {
  getCentrosCosto: (): Promise<ComboItem[]> =>
    cache.get("bnc.centros", async () => {
      const data = await http.get<JR[]>(`${base}/centros-costo`);
      return (data ?? []).map((item) => {
        if (hasVL(item)) return { value: String(item.value), label: String(item.label) };
        // fallback usual: codigo + descripcion
        return normalizeCombo(item);
      });
    }),

  getCompanias: (): Promise<ComboItem[]> =>
    cache.get("bnc.companias", async () => {
      const data = await http.get<JR[]>(`${base}/companias`);
      return (data ?? []).map((item) =>
        // value: value|codigo | label: label|nombre
        normalizeWithPrefs(item, ["value", "codigo"], ["label", "nombre"], "codigo", "nombre")
      );
    }),

  getSolicitantes: (): Promise<ComboItem[]> =>
    cache.get("bnc.solicitantes", async () => {
      const data = await http.get<JR[]>(`${base}/solicitantes`);
      return (data ?? []).map((item) =>
        // value: value|solicitante | label: label|solicitante
        normalizeWithPrefs(item, ["value", "solicitante"], ["label", "solicitante"], "solicitante", "solicitante")
      );
    }),

  getSistemas: (): Promise<ComboItem[]> =>
    cache.get("bnc.sistemas", async () => {
      const data = await http.get<JR[]>(`${base}/sistemas`);
      return (data ?? []).map((item) =>
        // value: value|label | label: label|value
        normalizeWithPrefs(item, ["value", "label"], ["label", "value"], "label", "value")
      );
    }),

  getProveedores: (): Promise<ComboItem[]> =>
    cache.get("bnc.proveedores", async () => {
      const data = await http.get<JR[]>(`${base}/proveedores`);
      return (data ?? []).map((item) =>
        // value: value|nit | label: label|nombre|razonSocial
        normalizeWithPrefs(item, ["value", "nit"], ["label", "nombre", "razonSocial"], "nit", "nombre")
      );
    }),
};
