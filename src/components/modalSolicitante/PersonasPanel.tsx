import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export function PersonasPanel({ personas }: { personas: Array<{ nombre?: string; email?: string | null }> }) {
  return (
    <div className="cc-card" style={{ margin: '8px 0' }}>
      <div className="muted" style={{ marginBottom: 6 }}>Personas asignadas</div>
      <DataTable value={personas} responsiveLayout="scroll" emptyMessage="Sin personas asignadas">
        <Column field="nombre" header="Nombre" />
        <Column header="Email" body={(p: any) => p?.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : <span className="muted">-</span>} />
      </DataTable>
    </div>
  );
}
