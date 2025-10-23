import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Fieldset } from 'primereact/fieldset';
import { useState } from 'react';
import type { FlujoRow } from '@/services/solicitante';
import { PersonasPanel } from './PersonasPanel';

export function OCFlujoTable({ flujo }: { flujo: FlujoRow[] }) {
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  return (
    <Fieldset legend="Flujo de aprobación" className="cc-card" style={{ marginBottom: 16 }}>
      <DataTable
        value={flujo.map((r: any, i: number) => ({ id: r.id ?? i, ...r }))}
        dataKey="id"
        responsiveLayout="scroll"
        className="dt-violet"
        emptyMessage="Sin datos."
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data as any[])}
        rowExpansionTemplate={(row) => <PersonasPanel personas={row.personas || []} />}
      >
        <Column expander style={{ width: 60 }} />
        <Column field="tipoAutorizador" header="Tipo" />
        <Column field="nivel" header="Nivel" />
        <Column field="centroCosto" header="Centro de Costo" />
        <Column field="estado" header="Estado" />
        <Column field="motivoRechazo" header="Motivo" />
        <Column field="observaciones" header="Observación" />
      </DataTable>
    </Fieldset>
  );
}
