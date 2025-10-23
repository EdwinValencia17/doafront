// src/hooks/nivelcero/useNivelCeroData.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Toast } from 'primereact/toast';
import { OrdersService, CatalogsService } from '@/services/nivelcero';
import type { BandejaRow as OrdenRow, BandejaFiltro } from '@/services/nivelcero/types';

export type PageState = { page: number; rows: number; total: number };
export type FiltersState = {
  numeroSolicitud?: string;
  numeroOc?: string;
  centroCosto?: string;     // '-1'
  solicitante?: string;     // '-1'
  compania?: string;        // '-1'
  sistema?: string;         // '-1'
  proveedorNit?: string;
  prioridad?: 'G'|'I'|'N'|'P'|'U'|'-1';
  fechaInicio?: Date|null;
  fechaFin?: Date|null;
};
export type Combos = {
  cc: { value: string; label: string }[];
  sol: { value: string; label: string }[];
  comp: { value: string; label: string }[];
  sis: { value: string; label: string }[];
  loading: boolean;
};

const defaultFilters: FiltersState = {
  numeroSolicitud: '', numeroOc: '',
  centroCosto: '-1', solicitante: '-1', compania: '-1', sistema: '-1',
  proveedorNit: '', prioridad: '-1', fechaInicio: null, fechaFin: null,
};
const toYMD = (d?: Date|null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : undefined;

export function useNivelCeroData(toastRef?: React.RefObject<Toast>) {
  // tabla
  const [rows, setRows] = useState<OrdenRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<PageState>({ page: 1, rows: 15, total: 0 });

  // filtros
  const [filters, setFilters] = useState<FiltersState>({ ...defaultFilters });

  // combos
  const [combos, setCombos] = useState<Combos>({ cc: [], sol: [], comp: [], sis: [], loading: false });

  // cargar combos 1 vez (cacheados por el service)
  useEffect(() => {
    (async () => {
      setCombos(s => ({ ...s, loading: true }));
      try {
        const [cc, so, co, si] = await Promise.all([
          CatalogsService.getCentrosCosto(),
          CatalogsService.getSolicitantes(),
          CatalogsService.getCompanias(),
          CatalogsService.getSistemas(),
        ]);
        setCombos({
          cc: [{ value: '-1', label: 'Centro de Costo' }, ...cc],
          sol: [{ value: '-1', label: 'Solicitante' }, ...so],
          comp: [{ value: '-1', label: 'Compañía' }, ...co],
          sis: [{ value: '-1', label: 'Sistema' }, ...si],
          loading: false,
        });
      } catch {
        setCombos(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  // payload
  const buildQuery = useCallback((pg = page.page, lim = page.rows): BandejaFiltro => ({
    numeroSolicitud: filters.numeroSolicitud || undefined,
    numeroOc: filters.numeroOc || undefined,
    centroCosto: filters.centroCosto !== '-1' ? filters.centroCosto : undefined,
    solicitante: filters.solicitante !== '-1' ? filters.solicitante : undefined,
    compania: filters.compania !== '-1' ? filters.compania : undefined,
    sistema: filters.sistema !== '-1' ? filters.sistema : undefined,
    proveedorNit: filters.proveedorNit || undefined,
    prioridad: filters.prioridad !== '-1' ? (filters.prioridad as any) : undefined,
    fechaInicio: toYMD(filters.fechaInicio ?? null),
    fechaFin: toYMD(filters.fechaFin ?? null),
    page: pg,
    pageSize: lim,
  }), [filters, page.page, page.rows]);

  // fetch
  const fetchData = useCallback(async (pg = page.page, lim = page.rows) => {
    setLoading(true);
    try {
      const q = buildQuery(pg, lim);
      const res = await OrdersService.listar(q);
      setRows(res.data);
      setPage({ page: res.page, rows: res.pageSize, total: res.total });
    } catch (e: any) {
      toastRef?.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo cargar' });
    } finally { setLoading(false); }
  }, [buildQuery, page.page, page.rows, toastRef]);

  // paginación
  const onPage = (ev: { page: number; rows: number }) => {
    const np = (ev.page ?? 0) + 1;
    const nr = ev.rows ?? page.rows;
    setPage(ps => ({ ...ps, page: np, rows: nr }));
    fetchData(np, nr);
  };

  // filtros
  const applyFilters = () => {
    setPage(ps => ({ ...ps, page: 1 }));
    (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(() => fetchData(1, page.rows), 0);
  };
  const clearFilters = () => {
    setFilters({ ...defaultFilters });
    setPage(ps => ({ ...ps, page: 1 }));
    (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(() => fetchData(1, page.rows), 0);
  };

  // inicial
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    fetchData(1, page.rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rows, loading, page, filters, setFilters, combos, onPage, applyFilters, clearFilters, fetchData };
}
