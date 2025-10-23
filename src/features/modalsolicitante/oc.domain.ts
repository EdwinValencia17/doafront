import type { DetalleUI, TotalesUI } from './oc.types';
import type { FlujoRow } from '@/services/solicitante';

export function computeTotales(items: DetalleUI[] = []): TotalesUI {
  let valorIva = 0, totalNeto = 0, totalBruto = 0;
  for (const it of items) {
    const cant = Number(it.cantidad ?? 0);
    const vu   = Number(it.valorUnitario ?? 0);
    const iva  = Number(it.ivaRef ?? 0);
    const tot  = Number(it.valorTotal ?? cant * vu + iva);

    valorIva   += Number.isFinite(iva) ? iva : 0;
    totalNeto  += Number.isFinite(tot) ? tot : 0;
    totalBruto += Number.isFinite(cant * vu) ? cant * vu : 0;
  }
  const dctoGlobal = 0;
  const subTotal = totalBruto;
  return { totalBruto, dctoGlobal, subTotal, valorIva, totalNeto };
}

export function estadoGeneralFromFlujo(pasos: FlujoRow[] = []) {
  const S = (s?: string | null) => String(s || '').trim().toUpperCase();
  if (!pasos.length) return 'INICIADA';
  const estados = pasos.map(p => S(p.estado));
  if (estados.some(e => e.includes('RECHAZ'))) return 'RECHAZADA';
  if (estados.every(e => e.includes('APROBA'))) return 'APROBADA';
  return 'INICIADA';
}
