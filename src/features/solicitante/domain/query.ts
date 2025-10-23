// dominio/query: traduce filtros de UI -> OCQuery (back)
import type { FiltersState } from '@/components/solicitante/SolicitanteFilters';
import type { OCQuery } from '@/services/solicitante';

export const toYMD = (d?: Date | null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : undefined;

// Mapa UI -> back (nombres de columna)
export const SORT_MAP: Record<string, 'fecha' | 'total' | 'oc' | 'solicitud'> = {
  fecha_oc: 'fecha',
  total_neto: 'total',
  numero_oc: 'oc',
  numero_solicitud: 'solicitud',
};

export type SortState = { field?: string; order?: 'ASC' | 'DESC' };

export function buildQuery(
  filters: FiltersState,
  page: number,
  rows: number,
  sort: SortState
): OCQuery {
  const sortField = sort.field ? SORT_MAP[sort.field] : SORT_MAP['fecha_oc'];
  const sortOrder = sort.order ?? 'DESC';

  return {
    page,
    limit: rows,
    sortField: sortField ?? 'fecha',
    sortOrder,
    q: filters.q || undefined,
    qOC: filters.qOC || undefined,
    qSol: filters.qSol || undefined,
    proveedor: filters.proveedor || undefined,
    ceco: filters.ceco,
    compania: filters.compania || undefined,
    estado: filters.estado,
    prioridad: filters.prioridad,
    sistema: filters.sistema,
    fechaDesde: toYMD(filters.fechaDesde),
    fechaHasta: toYMD(filters.fechaHasta),
  };
}
