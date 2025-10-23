import { Fieldset } from 'primereact/fieldset';
import type { TotalesUI } from '@/features/modalsolicitante/oc.types';

const fmtMoney = (v?: number | null, c?: string | null) => {
  if (v == null) return '-';
  const cur = c ?? 'COP';
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Number(v));
  } catch {
    return new Intl.NumberFormat('es-CO').format(Number(v));
  }
};

export function OCTotales({ tot, moneda }: { tot: TotalesUI; moneda?: string | null }) {
  return (
    <Fieldset legend="Totales" className="cc-card">
      <div className="rg-grid rg-5">
        <div><span className="muted">Total Bruto</span><div className="font-semibold">{fmtMoney(tot.totalBruto, moneda)}</div></div>
        <div><span className="muted">Dcto Global</span><div className="font-semibold">{fmtMoney(tot.dctoGlobal, moneda)}</div></div>
        <div><span className="muted">Subtotal</span><div className="font-semibold">{fmtMoney(tot.subTotal, moneda)}</div></div>
        <div><span className="muted">IVA</span><div className="font-semibold">{fmtMoney(tot.valorIva, moneda)}</div></div>
        <div><span className="muted">Total Neto</span><div className="font-semibold">{fmtMoney(tot.totalNeto, moneda)}</div></div>
      </div>
    </Fieldset>
  );
}
