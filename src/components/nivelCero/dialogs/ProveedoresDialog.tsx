// src/components/nivelcero/dialogs/ProveedoresDialog.tsx
import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { ComboItem } from '@/services/nivelcero/types';

export function ProveedoresDialog({
  visible, onHide, loadAll, data, onSelect,
}: {
  visible: boolean;
  onHide: () => void;
  loadAll: () => Promise<void>;
  data: ComboItem[];
  onSelect: (it: ComboItem) => void;
}) {
  const [q, setQ] = useState('');
  useEffect(() => { if (visible && data.length === 0) loadAll(); }, [visible, data.length, loadAll]);

  const filtered = data.filter(p => (p.value + ' ' + (p.label || '')).toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog header="Proveedores" visible={visible} onHide={onHide} style={{ width: 700 }}>
      <div className="flex gap-2 mb-2">
        <InputText placeholder="Buscar proveedor/NIT" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button icon="pi pi-search" onClick={() => setQ(q.trim())} />
      </div>
      <DataTable value={filtered} paginator rows={10} responsiveLayout="scroll">
        <Column field="value" header="NIT" />
        <Column field="label" header="Proveedor" />
        <Column header="" body={(row: ComboItem) => <Button label="Seleccionar" onClick={() => onSelect(row)} />} />
      </DataTable>
    </Dialog>
  );
}
