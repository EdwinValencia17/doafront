import React, { useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import type { OCRow } from '@/services/solicitante';
import { centroCostoDisplay, type CecoIndex } from '@/features/solicitante/domain/cc-format';
import { PrioridadTag, EstadoTag } from '@/components/tags/OrderTags';

export type PageState = { page: number; rows: number; total: number };

const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return m ? m[1] : new Date(iso).toLocaleDateString('es-CO');
};
const fmtMoney = (v?: number | null) =>
  typeof v === 'number'
    ? v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : '';

export function SolicitanteTable(props: {
  title?: string;
  rows: OCRow[];
  loading: boolean;
  page: PageState;
  onPage: (ev: DataTablePageEvent) => void;
  onSort: (ev: DataTableSortEvent) => void;
  onView: (r: OCRow) => void;

  // acciones opcionales en el header derecho
  onOpenFilters?: () => void;
  onBackToLogin?: () => void;

  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;

  /** Índice id_ceco -> {codigo, descripcion} para resolver cecos faltantes */
  cecoIndex?: CecoIndex;
}) {
  const {
    title = 'BANDEJA DEL SOLICITANTE',
    rows, loading, page, onPage, onSort, onView,
    onOpenFilters, onBackToLogin,
    headerLeft, headerRight,
    cecoIndex,
  } = props;

  const showingFrom = page.total ? (page.page - 1) * page.rows + 1 : 0;
  const showingTo = Math.min(page.page * page.rows, page.total || rows.length);
  const total = page.total || rows.length;

  // ⚠️ Ya no envolvemos con .right aquí; sólo el contenido
  const DefaultRight = useMemo(() => (
    <>
      {/* Bloque 1: contador + Filtros */}
      <div className="dt-actions flex align-items-center gap-2">
        <small className="mr-3">
          Mostrando {showingFrom} a {showingTo} de {total} registros
        </small>

        {onOpenFilters && (
          <Button
            icon="pi pi-filter"
            label="Filtros"
            className="p-button-outlined"
            onClick={onOpenFilters}
          />
        )}
      </div>

      {/* Bloque 2: botón independiente */}
      {onBackToLogin && (
        <div className="dt-login-wrap">
          <Button
            icon="pi pi-arrow-left"
            label="Volver al login"
            className="p-button-outlined btn-login-standalone"
            onClick={onBackToLogin}
          />
        </div>
      )}
    </>
  ), [onOpenFilters, onBackToLogin, showingFrom, showingTo, total]);

  const TableHeader = useMemo(() => (
    <div className="dt-header-violet">
      <div className="left">
        {headerLeft ?? (
          <>
            <div className="title">{title}</div>
            <div className="subtitle">Órdenes de compra</div>
          </>
        )}
      </div>

      {/* ÚNICO contenedor .right */}
      <div className="right flex align-items-center w-full justify-content-between">
        {headerRight ?? DefaultRight}
      </div>
    </div>
  ), [headerLeft, headerRight, DefaultRight, title]);

  return (
    <div className="doa-card">
      <DataTable
        value={rows}
        dataKey="id_cabecera"
        size="small"
        stripedRows
        rowHover
        showGridlines
        responsiveLayout="scroll"
        scrollable
        scrollHeight="calc(100vh - 280px)"
        tableStyle={{ minWidth: 1200 }}
        className="doa-table table--violet table--responsive"
        loading={loading}
        header={TableHeader}
        lazy
        paginator
        paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
        rows={page.rows}
        totalRecords={page.total}
        first={(page.page - 1) * page.rows}
        onPage={onPage}
        onSort={onSort}
        sortMode="single"
        rowsPerPageOptions={[10, 20, 30, 50, 100]}
        emptyMessage="Sin registros."
      >
        {/* ORDEN EXACTO SOLICITADO */}
        <Column header="Prioridad"
          body={(r: OCRow) => <PrioridadTag p={r.prioridad} />}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 140 }} />

        <Column field="numero_solicitud" header="Número de Solicitud" sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 180 }} />

        <Column field="numero_oc" header="Número de Orden de Compra" sortable
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 220 }} />

        <Column field="fecha_oc" header="Fecha Orden de Compra" sortable
          body={(r: OCRow) => fmtDate(r.fecha_oc)}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 170 }} />

        {/* Centro de Costo */}
        <Column header="Centro de Costo"
          body={(r: OCRow) => centroCostoDisplay(r, cecoIndex)}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 240 }} />

        <Column field="compania" header="Compañía"
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 160 }} />

        <Column field="proveedor" header="Proveedor"
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 220 }} />

        <Column field="estado" header="Estado General"
          body={(r: OCRow) => <EstadoTag s={r.estado || ''} />}
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 160 }} />

        <Column field="solicitante" header="Solicitante"
          headerClassName="th" bodyClassName="td"
          headerStyle={{ minWidth: 180 }} />

        <Column field="total_neto" header="Valor" sortable
          body={(r: OCRow) => fmtMoney(r.total_neto)}
          headerClassName="th th--num" bodyClassName="td td--num"
          headerStyle={{ minWidth: 140, textAlign: 'right' }} />

        <Column header=""
          body={(r: OCRow) => (
            <div className="row-actions">
              <Button
                icon="pi pi-eye"
                text
                rounded
                aria-label="Ver"
                onClick={() => onView(r)}
              />
            </div>
          )}
          headerClassName="th th--center" bodyClassName="td td--center"
          headerStyle={{ minWidth: 110, width: 120 }} />
      </DataTable>
    </div>
  );
}
