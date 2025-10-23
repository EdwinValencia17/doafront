// src/services/reglasdn/mapper.ts
import type { Regla, Aprobador, CentroDTO, CategoriaDTO } from '@/services/reglasdn/types';

/* ----------------------------- Helpers seguros ----------------------------- */

type Recordish = Record<string, unknown>;
const isObject = (x: unknown): x is Recordish => typeof x === 'object' && x !== null;

const S = (v: unknown): string => String(v ?? '').trim();
const U = (v: unknown): string => S(v).toUpperCase();
const N = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------ Tipos “laxos” del backend ------------------------ */

type BackendAprobador = {
  tipo?: unknown;
  nivel?: unknown;
} | Record<string, unknown>;

type BackendRegla = {
  id?: unknown;
  reglaNegocio?: unknown;
  centroCosto?: unknown;
  compania?: unknown;
  montoMax?: unknown;
  aprobadores?: unknown;
  vigente?: unknown;
  updatedAt?: unknown;
  __min?: unknown;
  categoria?: unknown;
  __categoria?: unknown;
  ccNivel?: unknown;
} | Record<string, unknown>;

type BackendCentro = {
  centroCosto?: unknown;
  compania?: unknown;
} | Record<string, unknown>;

type BackendCategoria = {
  id?: unknown;
  categoria?: unknown;
  descripcion?: unknown;
} | Record<string, unknown>;

/* ----------------------------- Normalizadores ----------------------------- */

const normalizeRegla = (v: unknown): string => (U(v) === 'INDIRECTO' ? 'INDIRECT' : U(v));

const toAprobador = (a: unknown): Aprobador | null => {
  if (!isObject(a)) return null;
  const tipo = U((a as BackendAprobador)?.tipo ?? 'COMPRAS');
  const nivel = S((a as BackendAprobador)?.nivel ?? '');
  if (!nivel) return null;
  return { tipo, nivel };
};

/* -------------------------------- Mappers --------------------------------- */

export function sanitizeRegla(x: unknown): Regla {
  const rx = (isObject(x) ? (x as BackendRegla) : {}) as BackendRegla;

  const aprobadoresRaw = Array.isArray(rx.aprobadores) ? rx.aprobadores : [];
  const aprobadores: Aprobador[] = aprobadoresRaw
    .map(toAprobador)
    .filter((z): z is Aprobador => Boolean(z));

  const updatedIso = (() => {
    const d = new Date(S(rx.updatedAt) || Date.now());
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  })();

  const minVal = typeof rx.__min === 'number' ? rx.__min : undefined;

  return {
    id: S(rx.id),
    reglaNegocio: normalizeRegla(rx.reglaNegocio),
    centroCosto: U(rx.centroCosto),
    compania: S(rx.compania),
    montoMax: N(rx.montoMax),
    aprobadores,
    vigente: rx.vigente !== false,
    updatedAt: updatedIso,
    __min: minVal,
    categoria: S((rx.categoria ?? rx.__categoria) ?? ''),
    ccNivel: S(rx.ccNivel ?? ''),
  };
}

export function toAPIBody(r: Partial<Regla>) {
  const aprobadores = Array.isArray(r.aprobadores)
    ? r.aprobadores
        .filter(Boolean)
        .map((a) => ({ tipo: U(a?.tipo), nivel: S(a?.nivel) }))
    : [];

  return {
    id: r.id ? String(r.id) : undefined,
    reglaNegocio: normalizeRegla(r.reglaNegocio || 'INDIRECT'),
    centroCosto: U(r.centroCosto || ''),
    compania: S(r.compania || ''),
    montoMax: N(r.montoMax),
    aprobadores,
    vigente: r.vigente !== false,
    updatedAt: r.updatedAt || new Date().toISOString(),
    categoria: S(r.categoria || ''),
    ccNivel: S(r.ccNivel || ''),
    __min: typeof r.__min === 'number' ? r.__min : undefined,
  };
}

export const toCentroDTO = (x: unknown): CentroDTO => {
  const o = isObject(x) ? (x as BackendCentro) : {};
  return { centroCosto: U(o.centroCosto), compania: S(o.compania) };
};

export const toCategoriaDTO = (x: unknown): CategoriaDTO => {
  const o = isObject(x) ? (x as BackendCategoria) : {};
  return { id: N(o.id), categoria: U(o.categoria), descripcion: S(o.descripcion) };
};

/* --------------------- Utilidad para nombres de archivo -------------------- */

export function filenameFromDisposition(h?: string, fallback = 'archivo.xlsx'): string {
  if (!h) return fallback;
  // sin escapes innecesarios de comillas
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(h);
  const raw = decodeURIComponent((m?.[1] || m?.[2] || '').trim());
  return raw || fallback;
}
