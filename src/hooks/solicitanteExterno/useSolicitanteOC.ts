import { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import type { DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';

import { AutorizacionesRepo, CatalogosRepo } from '@/services/solicitante';
import type { OCRow, ComboEstado, ComboCeco, ComboCompania, ComboPrioridad } from '@/services/solicitante';
import type { FiltersState } from '@/components/solicitante/SolicitanteFilters';
import { buildQuery, SORT_MAP, type SortState } from '@/features/solicitante/domain/query';
import { clearedFilters, defaultFilters } from '@/features/solicitante/filters/defaults';

export type PageState = { page: number; rows: number; total: number };

export function useSolicitanteOC(toastRef?: React.RefObject<Toast>) {
  // tabla
  const [rows, setRows] = useState<OCRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<PageState>({ page: 1, rows: 10, total: 0 });
  const [sort, setSort] = useState<SortState>({ field: 'fecha_oc', order: 'DESC' });

  // filtros
  const [filters, setFilters] = useState<FiltersState>({ ...defaultFilters });

  // combos
  const [estados, setEstados] = useState<ComboEstado[]>([]);
  const [cecos, setCecos] = useState<ComboCeco[]>([]);
  const [companias, setCompanias] = useState<ComboCompania[]>([]);
  const [prioridades, setPrioridades] = useState<ComboPrioridad[]>([]);
  const [combosLoading, setCombosLoading] = useState(false);

  // ---- carga de combos ----
  const loadCombos = useCallback(async () => {
    setCombosLoading(true);
    try {
      const [e, c, co, p] = await Promise.all([
        CatalogosRepo.getEstados(),
        CatalogosRepo.getCentrosCosto(),
        CatalogosRepo.getCompanias(),
        CatalogosRepo.getPrioridades(),
      ]);
      setEstados(e); setCecos(c); setCompanias(co); setPrioridades(p);
    } catch {
      toastRef?.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los combos' });
    } finally { setCombosLoading(false); }
  }, [toastRef]);

  // ---- fetch genérico con overrides (para evitar el “doble clic”) ----
  const fetchDataWith = useCallback(async (
    filtersOverride?: FiltersState,
    pageOverride?: number,
    rowsOverride?: number,
    sortOverride?: SortState
  ) => {
    const f = filtersOverride ?? filters;
    const p = pageOverride ?? page.page;
    const r = rowsOverride ?? page.rows;
    const s = sortOverride ?? sort;

    setLoading(true);
    try {
      const res = await AutorizacionesRepo.listarOC(buildQuery(f, p, r, s));
      setRows(res.data);
      setPage({ page: res.page, rows: res.pageSize, total: res.total });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar';
      toastRef?.current?.show({ severity: 'error', summary: 'Error', detail: msg });
    } finally { setLoading(false); }
  }, [filters, page.page, page.rows, sort, toastRef]);

  // alias histórico si alguien lo importa como fetchData
  const fetchData = fetchDataWith;

  // ---- lifecycle ----
  useEffect(() => {
    loadCombos();
    // primera carga
    fetchDataWith(defaultFilters, 1, page.rows, { field: 'fecha_oc', order: 'DESC' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- eventos de tabla ----
  const onPage = useCallback((e: DataTablePageEvent) => {
    const newPage = (e.page ?? Math.floor((e.first ?? 0) / (e.rows ?? page.rows))) + 1;
    const newRows = e.rows ?? page.rows;
    setPage(ps => ({ ...ps, page: newPage, rows: newRows }));
    fetchDataWith(filters, newPage, newRows);
  }, [fetchDataWith, filters, page.rows]);

  const onSort = useCallback((e: DataTableSortEvent) => {
    const field = String(e.sortField || 'fecha_oc');
    const order: 'ASC' | 'DESC' = e.sortOrder === 1 ? 'ASC' : 'DESC';
    const s = { field, order };
    setSort(s);
    fetchDataWith(filters, page.page, page.rows, s);
  }, [fetchDataWith, filters, page.page, page.rows]);

  // ---- acciones desde filtros ----
  const applyFilters = useCallback(() => {
    // al aplicar, siempre vamos a la página 1 con el estado actual de filtros
    setPage(ps => ({ ...ps, page: 1 }));
    fetchDataWith(filters, 1, page.rows);
  }, [fetchDataWith, filters, page.rows]);

  const clearFilters = useCallback(() => {
    const cleared = clearedFilters();
    setFilters(cleared);
    setPage(ps => ({ ...ps, page: 1 }));
    // usamos los filtros reseteados EXPLÍCITOS → sin doble clic
    fetchDataWith(cleared, 1, page.rows);
  }, [fetchDataWith, page.rows]);

  return {
    // estado
    rows, loading, page, sort, filters,
    // setters
    setFilters, setPage, setSort,
    // combos
    estados, cecos, companias, prioridades, combosLoading,
    // api
    fetchData,
    onPage, onSort,
    applyFilters, clearFilters,
    // util (por si la tabla necesita el map)
    SORT_MAP,
  };
}
