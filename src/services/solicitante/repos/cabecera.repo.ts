import { http } from '@/services/apis/client';
import type { CabeceraOC } from '../types';

const CORE_BASE = '/api';

export async function getCabecera(id: number) {
  return http.get<CabeceraOC>(`${CORE_BASE}/cabecera-oc/${id}`);
}
