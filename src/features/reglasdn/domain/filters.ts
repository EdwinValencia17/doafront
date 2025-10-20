// src/features/reglasdn/domain/filters.ts
import type { Regla } from '@/services/reglasdn/types';

const norm = (s?: string) =>
  String(s ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const nNum = (s?: string) => {
  const m = String(s ?? '').match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

export const baseOf = (tipo?: string): 'COMPRAS' | 'FINANZAS' | 'GERENTE OPS' | null => {
  const t = norm(tipo);
  if (!t) return null;
  if (t.includes('COMPRAS')) return 'COMPRAS';
  if (t.startsWith('FINANZAS')) return 'FINANZAS';
  if (t.includes('GERENTE') || t.includes('GERENCIA')) return 'GERENTE OPS';
  return null;
};

export const apByBase = (r: Regla, base: 'COMPRAS' | 'FINANZAS' | 'GERENTE OPS') => {
  const arr = (Array.isArray(r.aprobadores) ? r.aprobadores : [])
    .filter((x) => baseOf(x?.tipo) === base)
    .sort((a, b) => nNum(a.nivel) - nNum(b.nivel) || String(a.nivel).localeCompare(String(b.nivel)));
  const a = arr[0];
  return a ? `${a.tipo}, ${a.nivel}` : '—';
};

export const apOther = (r: Regla) => {
  const arr = (Array.isArray(r.aprobadores) ? r.aprobadores : []).filter((x) => baseOf(x?.tipo) === null);
  const a = arr[0];
  return a ? `${a.tipo}, ${a.nivel}` : '—';
};

export const lastNivel = (r: Regla) => {
  const arr = Array.isArray(r.aprobadores) ? r.aprobadores : [];
  return arr.length ? String(arr[arr.length - 1].nivel) : '';
};
