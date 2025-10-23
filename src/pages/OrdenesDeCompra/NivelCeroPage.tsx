// src/pages/nivelcero/NivelCeroPage.tsx
import { useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';

import { useAuthStore } from '@/context/StoreAuth';
import { IntegrationService } from '@/services/nivelcero';

import { useNivelCeroData } from '@/hooks/nivelCero/useNivelCeroData';
import { useNivelCeroActions } from '@/hooks/nivelCero/useNivelCeroActions';

import { NivelCeroFilters } from '@/components/nivelCero/NivelCeroFilters';
import { NivelCeroHeader } from '@/components/nivelCero/NivelCeroHeader';
import { CancelDialog } from '@/components/nivelCero/dialogs/CancelDialog';
import { ProveedoresDialog } from '@/components/nivelCero/dialogs/ProveedoresDialog';
import { PrioridadTag } from '@/components/tags/OrderTags';

import ModalVerOC from '@/Modales/NivelCero/ModalVerOCNivelCero';
import ModalEditarOC from '@/Modales/NivelCero/ModalEditarNivelCero';
import HomologarDialog from '@/Modales/Homologaciones/ModalHomologacionesXItem';

export default function NivelCeroPage() {
  const toast = useRef<Toast>(null);
  const tipRef = useRef<Tooltip>(null);

  // datos
  const { rows, loading, page, filters, setFilters, combos, onPage, applyFilters, clearFilters, fetchData } =
    useNivelCeroData(toast);

  // usuario
  const currentId = useAuthStore(s => s.user?.globalId || '');

  // acciones separadas
  const {
    setOpenVer, setOpenEditar,
    editarOrFallbackVer, iniciar,
    pedirCancelar, cerrarCancelar, confirmarCancelar,
    homologDialog, setHomologDialog,
    pendingId,
  } = useNivelCeroActions(toast, String(currentId));

  // UI local
  const [visibleFilters, setVisibleFilters] = useState(true);
  const [selected, setSelected] = useState<typeof rows>([]);
  const [verOpen, setVerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [gestionId, setGestionId] = useState<number | null>(null);

  // conectar acciones con modales
  setOpenVer((id) => { setGestionId(id); setVerOpen(true); });
  setOpenEditar((id) => { setGestionId(id); setEditOpen(true); });

  // proveedores
  const [provOpen, setProvOpen] = useState(false);
  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const loadAllProv = async () => {
    if (proveedores.length) return;
    const { CatalogsService } = await import('@/services/nivelcero');
    setProveedores(await CatalogsService.getProveedores());
  };

  const asCOP = (v?: number | null) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
      .format(Number(v ?? 0));

  const header = useMemo(() =>
    <NivelCeroHeader
      total={page.total}
      filtersVisible={visibleFilters}
      onToggleFilters={() => setVisibleFilters(v => !v)}
      onRefresh={() => IntegrationService.actualizarOrdenes().then(() => fetchData(page.page, page.rows))}
      onStart={() => iniciar(selected, () => fetchData(page.page, page.rows))}
      startDisabled={!selected.length}
    />
  , [page.total, visibleFilters, page.page, page.rows, selected, fetchData, iniciar]);

  return (
    <div className="pg-bandeja config-shell">
      <main className="cc-main">
        <div className="cc-card">
          <Tooltip
            key={`${page.page}-${rows.length}`}
            ref={tipRef}
            target=".cell-tip"
            className="violet-tip"
            appendTo={typeof window !== 'undefined' ? document.body : undefined}
            showDelay={200}
            hideDelay={0}
          />

          {/* === DataTable igual a la del solicitante === */}
          <DataTable
            value={rows}
            dataKey="id"
            size="small"
            stripedRows
            rowHover
            showGridlines
            responsiveLayout="scroll"
            scrollable
            scrollHeight="calc(100vh - 280px)"
            tableStyle={{ minWidth: 2900 }}
            className="doa-table table--violet table--responsive"
            loading={loading}
            header={header}
            lazy
            paginator
            paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
            rows={page.rows}
            totalRecords={page.total}
            first={(page.page - 1) * page.rows}
            onPage={(e: DataTablePageEvent) => onPage({ page: e.page!, rows: e.rows! })}
            rowsPerPageOptions={[10, 20, 30, 50, 100]}
            emptyMessage="Sin registros."
            selection={selected}
            onSelectionChange={(e) => setSelected(e.value)}
          >
            {/* ORDEN EXACTO COMO EN SOLICITANTE */}
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />

            <Column header="Prioridad"
              body={(r: any) => <PrioridadTag p={r.prioridadOrden} />}
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 140 }} />

            <Column field="numeroSolicitud" header="N° Solicitud" sortable
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 180 }} />

            <Column field="numOrden" header="N° Orden de Compra" sortable
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 220 }} />

            <Column field="fechaOrdenString" header="Fecha OC" sortable
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 170 }} />

            <Column field="centroCosto" header="Centro de Costo" sortable
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 240 }} />

            <Column field="empresa" header="Compañía" sortable
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 160 }} />

            <Column field="descProveedor" header="Proveedor"
              body={(r: any) => <span className="cell-tip">{r.descProveedor || ''}</span>}
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 220 }} />

            <Column field="observaciones" header="Observaciones"
              body={(r: any) => <span className="cell-tip">{r.observaciones || ''}</span>}
              headerClassName="th" bodyClassName="td"
              headerStyle={{ minWidth: 220 }} />

            <Column header="Valor" sortField="totalNeto" sortable
              body={(r: any) => (
                <div style={{ textAlign: 'right', width: '100%' }}>{asCOP(r.totalNeto)}</div>
              )}
              headerClassName="th th--num" bodyClassName="td td--num"
              headerStyle={{ minWidth: 140, textAlign: 'right' }} />

            <Column header=""
              body={(r: any) => (
                <div className="row-actions">
                  <Button icon="pi pi-pencil" text rounded aria-label="Editar" onClick={() => editarOrFallbackVer(r)} />
                  <Button icon="pi pi-search" text rounded aria-label="Ver" onClick={() => { setGestionId(r.id); setVerOpen(true); }} />
                  <Button icon="pi pi-trash" text rounded aria-label="Cancelar" onClick={() => pedirCancelar(r)} />
                </div>
              )}
              headerClassName="th th--center" bodyClassName="td td--center"
              headerStyle={{ minWidth: 200, width: 250 }} />
          </DataTable>
        </div>
      </main>

      {/* Sidebar filtros */}
      <Sidebar
        id="filters-sidebar-left"
        visible={visibleFilters}
        position="left"
        onHide={() => setVisibleFilters(false)}
        modal blockScroll showCloseIcon dismissable
        style={{ width: '380px', maxWidth: '92vw' }}
        pt={{ content: { className: 'cc-aside-shell' } }}
        header={<div className="flex align-items-center gap-2"><span className="font-bold">FILTROS</span></div>}
      >
        <div style={{ padding: 10 }}>
          <NivelCeroFilters
            value={filters}
            onChange={setFilters}
            onApply={() => { applyFilters(); setVisibleFilters(false); }}
            onClear={() => { clearFilters(); }}
            combos={combos}
          />
        </div>
      </Sidebar>

      {/* Diálogos puros */}
      <CancelDialog
        visible={!!pendingId}
        numOrden={rows.find(r => r.id === pendingId)?.numOrden}
        onConfirm={() => confirmarCancelar(rows.find(r => r.id === pendingId)?.numOrden ?? null, () => fetchData(page.page, page.rows))}
        onHide={cerrarCancelar}
      />

      <ProveedoresDialog
        visible={provOpen}
        onHide={() => setProvOpen(false)}
        loadAll={loadAllProv}
        data={proveedores}
        onSelect={(row) => { setFilters({ ...filters, proveedorNit: row.value }); setProvOpen(false); }}
      />

      {/* Modales existentes */}
      <ModalVerOC open={verOpen} ocId={gestionId} onClose={() => setVerOpen(false)} />
      <ModalEditarOC open={editOpen} ocId={gestionId} onClose={() => setEditOpen(false)} onAfterAction={() => fetchData(page.page, page.rows)} />

      <HomologarDialog
        key={homologDialog.open ? homologDialog.refs.join('|') : 'closed'}
        visible={homologDialog.open}
        onHide={() => setHomologDialog(s => ({ ...s, open: false }))}
        suggestedRefs={homologDialog.refs}
        initialQuery={homologDialog.refs[0] || ''}
      />

      <Toast ref={toast} />
    </div>
  );
}
