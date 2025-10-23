import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { dedupeAndSortRefs } from '@/features/homologaciones/domain/ref-utils';
import { useClipboardCopy } from '@/hooks/homologaciones/useClipboard';
import { useCSVDownload } from '@/hooks/homologaciones/useCSV';

export interface ModalHomolgacionesXItemProps {
  open: boolean;
  referencias: string[];
  homoIds?: number[];
  onClose: () => void;
  onForzar: () => Promise<void>;
}

type RowRef = { referencia: string };

export default function ModalHomolgacionesXItem({
  open, referencias, homoIds, onClose, onForzar,
}: ModalHomolgacionesXItemProps) {
  const [q, setQ] = useState('');
  const [forcing, setForcing] = useState(false);

  const { copy } = useClipboardCopy();
  const { downloadCSV, downloading } = useCSVDownload();

  const uniques = useMemo(() => dedupeAndSortRefs(referencias), [referencias]);

  const tableData: RowRef[] = useMemo(() => {
    const base = q ? uniques.filter(r => r.toLowerCase().includes(q.toLowerCase())) : uniques;
    return base.map(r => ({ referencia: r }));
  }, [q, uniques]);

  useEffect(() => { if (open) setQ(''); }, [open]);

  const descargarCSV = () =>
    downloadCSV({
      filename: 'referencias_sin_homologar.csv',
      header: ['referencia'],
      rows: uniques.map(r => [r]),
    });

  const copiarTodas = async () => { await copy(uniques.join('\n')); };

  const handleForzar = async () => {
    if (forcing) return;
    setForcing(true);
    try { await onForzar(); } finally { setForcing(false); }
  };

  return (
    <Dialog header="Homologación requerida" visible={open} onHide={onClose}
      className="rg-dialog" modal style={{ width: 780 }}>
      <div className="cc-card" style={{ marginBottom: 12 }}>
        <div className="flex justify-between items-center" style={{ gap: 12 }}>
          <div>
            <div className="title" style={{ fontWeight: 700 }}>Referencias sin homologar</div>
            <div className="muted">
              Se encontraron <b>{uniques.length}</b> referencias que deben homologarse.
              {homoIds?.length ? <> &nbsp;|&nbsp; OCs afectadas: <b>{homoIds.length}</b></> : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon="pi pi-copy" label="Copiar" className="btn-excel" onClick={copiarTodas} />
            <Button icon="pi pi-download" label="Descargar CSV" className="btn-excel"
              onClick={descargarCSV} loading={downloading} />
          </div>
        </div>
      </div>

      <div className="cc-card" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <i className="pi pi-search" />
          <InputText value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar referencia…" className="w-full" />
        </div>

        <DataTable value={tableData} paginator rows={10} responsiveLayout="scroll"
          className="dt-violet" emptyMessage="Sin referencias pendientes.">
          <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 80 }} />
          <Column header="Referencia" field="referencia"
            body={(r: RowRef) => <code>{r.referencia}</code>} />
        </DataTable>
      </div>

      <div className="flex justify-end gap-2">
        <Button label="Cerrar" className="p-button-text" onClick={onClose} />
        <Button icon="pi pi-send" label="Forzar inicio sin validación"
          onClick={handleForzar} className="btn-excel" loading={forcing}
          tooltip="Marca las OCs como gestionadas sin exigir homologación (usa con cuidado)."
          tooltipOptions={{ position: 'top' }} />
      </div>
    </Dialog>
  );
}
