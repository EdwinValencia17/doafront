import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { DetalleUI } from '@/features/modalsolicitante/oc.types';

const Right: React.FC<{ children: any }> = ({ children }) => (
  <div style={{ textAlign: 'right', width: '100%' }}>{children}</div>
);

const fmtMoney = (v?: number | null, c?: string | null) => {
  if (v == null) return '-';
  const cur = c ?? 'COP';
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Number(v));
  } catch {
    return new Intl.NumberFormat('es-CO').format(Number(v));
  }
};

export function OCDetalleTable({ items, moneda }: { items: DetalleUI[]; moneda?: string | null }) {
  return (
    <div className="cc-card" style={{ marginBottom: 16 }}>
      <DataTable value={items} dataKey="idDetalle" responsiveLayout="scroll" paginator rows={10} className="dt-violet" emptyMessage="Sin ítems.">
        <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 60 }} />
        <Column field="referencia" header="Referencia" />
        <Column field="descripcion" header="Descripción" />
        <Column field="unidadMedida" header="UM" style={{ width: 90 }} />
        <Column field="cantidad" header="Cantidad" body={(r: DetalleUI) => <Right>{r.cantidad}</Right>} style={{ width: 120 }} />
        <Column field="valorUnitario" header="Valor Und" body={(r: DetalleUI) => <Right>{fmtMoney(r.valorUnitario, moneda)}</Right>} style={{ width: 160 }} />
        <Column field="valorTotal" header="Valor Total" body={(r: DetalleUI) => <Right>{fmtMoney(r.valorTotal, moneda)}</Right>} style={{ width: 180 }} />
      </DataTable>
    </div>
  );
}
