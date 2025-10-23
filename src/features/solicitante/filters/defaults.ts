import type { FiltersState } from '@/components/solicitante/SolicitanteFilters';

export const defaultFilters: FiltersState = {
  q: '',
  qOC: '',
  qSol: '',
  proveedor: '',
  ceco: '-1',
  compania: '',
  estado: '-1',
  prioridad: '-1',
  sistema: '-1',
  fechaDesde: null,
  fechaHasta: null,
};

export function clearedFilters(): FiltersState {
  // si algún día cambia el estado base, centralizamos aquí
  return { ...defaultFilters };
}
