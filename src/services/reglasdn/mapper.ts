// src/services/reglasdn/mapper.ts
import type { Regla, Aprobador, CentroDTO, CategoriaDTO } from '@/services/reglasdn/types';

const S = (v: any) => String(v ?? '').trim();
const U = (v: any) => S(v).toUpperCase();
const normalizeRegla = (v: any) => (U(v) === 'INDIRECTO' ? 'INDIRECT' : U(v));

export function sanitizeRegla(x: any): Regla {
  const aprob = Array.isArray(x?.aprobadores) ? x.aprobadores : [];
  return {
    id: S(x.id),
    reglaNegocio: normalizeRegla(x.reglaNegocio),
    centroCosto: U(x.centroCosto),
    compania: S(x.compania),
    montoMax: Number(x.montoMax || 0),
    aprobadores: aprob.filter(Boolean).map((a: any): Aprobador => ({
      tipo: U(a?.tipo ?? 'COMPRAS'),
      nivel: S(a?.nivel ?? ''),
    })),
    vigente: x.vigente !== false,
    updatedAt: new Date(x.updatedAt || Date.now()).toISOString(),
    __min: typeof x.__min === 'number' ? x.__min : undefined,
    categoria: S(x?.categoria || x?.__categoria || ''),
    ccNivel: S(x?.ccNivel || ''),
  };
}

export function toAPIBody(r: Partial<Regla>) {
  const aprobadores = Array.isArray(r.aprobadores)
    ? r.aprobadores.filter(Boolean).map(a => ({ tipo: U(a.tipo), nivel: S(a.nivel) }))
    : [];
  return {
    id: r.id ? String(r.id) : undefined,
    reglaNegocio: normalizeRegla(r.reglaNegocio || 'INDIRECT'),
    centroCosto: U(r.centroCosto || ''),
    compania: S(r.compania || ''),
    montoMax: Number(r.montoMax || 0),
    aprobadores,
    vigente: r.vigente !== false,
    updatedAt: r.updatedAt || new Date().toISOString(),
    categoria: S(r.categoria || ''),
    ccNivel: S(r.ccNivel || ''),
    __min: typeof r.__min === 'number' ? r.__min : undefined,
  };
}

export const toCentroDTO = (x: any): CentroDTO => ({ centroCosto: U(x.centroCosto), compania: S(x.compania) });
export const toCategoriaDTO = (x: any): CategoriaDTO => ({ id: Number(x.id), categoria: U(x.categoria), descripcion: S(x.descripcion) });

// Opcional: filename desde Content-Disposition por si usas fetch en otro lado
export function filenameFromDisposition(h?: string, fallback = 'archivo.xlsx') {
  if (!h) return fallback;
  const m = /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(h);
  const raw = decodeURIComponent((m?.[1] || m?.[2] || '').trim());
  return raw || fallback;
}
