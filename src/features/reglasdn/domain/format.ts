// src/features/reglasdn/domain/format.ts
export const OPEN_MAX = 9_007_199_254_740_991 as const;

export const fmtMoney = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const toNum = (v: any) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const prettyMaxCell = (r: any) =>
  (r as any).openEnded || toNum(r.montoMax) >= OPEN_MAX ? '∞' : fmtMoney.format(toNum(r.montoMax));
