import { http } from '@/services/apis/client';
import type { ComboEstado, ComboCeco, ComboCompania, ComboPrioridad } from '../types';

const AS_BASE = '/api/autorizaciones-solicitante';

export async function getEstados() {
  const r = await http.get<{ rows: ComboEstado[] }>(`${AS_BASE}/admin/oc/estados`);
  return r.rows;
}
export async function getCentrosCosto() {
  const r = await http.get<{ rows: ComboCeco[] }>(`${AS_BASE}/admin/oc/centros-costo`);
  return r.rows;
}
export async function getCompanias() {
  const r = await http.get<{ rows: ComboCompania[] }>(`${AS_BASE}/admin/oc/companias`);
  return r.rows;
}
export async function getPrioridades() {
  const r = await http.get<{ rows: ComboPrioridad[] }>(`${AS_BASE}/admin/oc/prioridades`);
  return r.rows;
}
