// src/components/reglas/ReglasTable.tsx
import React, { useMemo } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { Regla } from '@/services/reglasdn/types';
import { fmtMoney, toNum, prettyMaxCell } from '@/features/reglasdn/domain/format';
import { apByBase, lastNivel } from '@/features/reglasdn/domain/filters';

// ——— Breakpoints mínimos para ocultar columnas en XS/SM ———
function useMedia() {
  const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;
  return {
    sm: mq('(max-width: 900px)'),
    md: mq('(max-width: 1200px)'),
  };
}

export type PageState = { page: number; rows: number; total: number };

export function ReglasTable(props: {
  rows: Regla[]; loading: boolean; page: PageState;
  onPage: (ev: DataTablePageEvent) => void;
  onEdit: (r: Regla) => void; onDelete: (r: Regla) => void;
  allowMutations: boolean;
  headerLeft?: React.ReactNode; headerRight?: React.ReactNode;
}) {
  const {
    rows, loading, page, onPage, onEdit, onDelete, allowMutations,
    headerLeft, headerRight
  } = props;

  const { sm, md } = useMedia();               // ← breakpoints
  const showGerente  = !md;                    // oculta GERENTE OPS en ≤1200
  const showFinanzas = !sm;                    // oculta FINANZAS en ≤900

  const categoriaCell = (r: Regla) => (r.categoria || '').toUpperCase();
  const ccNivelCell   = (r: Regla) => r.ccNivel || (r.centroCosto ? `${r.centroCosto} / ${lastNivel(r)}` : '');

  const showingFrom = (page.total ? (page.page - 1) * page.rows + 1 : 0);
  const showingTo   = Math.min(page.page * page.rows, page.total || rows.length);
  const total       = page.total || rows.length;

  const TableHeader = useMemo(() => (
    <div className="dt-header-violet">
      <div className="left">
        {headerLeft ?? (<><div className="title">REGLAS DE NEGOCIO</div><div className="subtitle">Listado</div></>)}
      </div>
      <div className="right">
        {headerRight ?? (<small>Mostrando {showingFrom} a {showingTo} de {total} registros</small>)}
      </div>
    </div>
  ), [headerLeft, headerRight, showingFrom, showingTo, total]);

  return (
    <div className="doa-card">
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
        /** clave: ancho mínimo total para evitar squeeze */
        tableStyle={{ minWidth: 1200 }}
        className="doa-table table--violet table--responsive"
        loading={loading}
        header={TableHeader}
        paginator
        paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
        rows={page.rows}
        totalRecords={page.total}
        first={(page.page - 1) * page.rows}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 30, 50, 100]}
      >
        <Column header="#" body={(_, i) => i.rowIndex + 1 + (page.page - 1) * page.rows}
          headerClassName="th th--num" bodyClassName="td td--num"
          headerStyle={{ minWidth: 60, width: 72 }} />

        <Column field="reglaNegocio" header="Reglas de negocio" sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 180 }} />

        <Column header="Si la categoría es" body={categoriaCell} sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 180 }} />

        <Column header="Si el valor de la orden de compra es mayor o igual a"
          body={(r: Regla & { __min?: number }) => fmtMoney.format(toNum(r.__min ?? 0))}
          sortable headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 260 }} />

        <Column header="Si el valor de la orden de compra es menor o igual a"
          body={prettyMaxCell} sortField="montoMax" dataType="numeric" sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 260 }} />

        <Column field="centroCosto" header="Si el centro de costo es" sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 180 }} />

        <Column header="El centro de costo y nivel autorizador es"
          body={ccNivelCell}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 260 }} />

        <Column header="El tipo de autorizador y nivel autorizador es COMPRAS"
          body={(r) => apByBase(r, 'COMPRAS')}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 240 }} />

        {showFinanzas && (
          <Column header="El tipo de autorizador y nivel autorizador es FINANZAS"
            body={(r) => apByBase(r, 'FINANZAS')}
            headerClassName="th" bodyClassName="td"
            headerStyle={{ minWidth: 240 }} />
        )}

        {showGerente && (
          <Column header="El tipo de autorizador y nivel autorizador es GERENTE OPS"
            body={(r) => apByBase(r, 'GERENTE OPS')}
            headerClassName="th" bodyClassName="td"
            headerStyle={{ minWidth: 260 }} />
        )}

        <Column header="Vigente"
          body={(r) => <Tag value={r.vigente ? 'Sí' : 'No'} severity={r.vigente ? 'success' : 'danger'} />}
          headerClassName="th th--center" bodyClassName="td td--center"
          headerStyle={{ minWidth: 110, width: 120 }} />

        <Column header=""
          body={(r: Regla) => (
            <div className="row-actions">
              <Button icon="pi pi-pencil" text rounded onClick={() => onEdit(r)} disabled={!allowMutations} />
              <Button icon="pi pi-trash"  text rounded severity="danger" onClick={() => onDelete(r)} disabled={!allowMutations} />
            </div>
          )}
          headerClassName="th th--center" bodyClassName="td td--center"
          headerStyle={{ minWidth: 120, width: 130 }} />
      </DataTable>
    </div>
  );
}
