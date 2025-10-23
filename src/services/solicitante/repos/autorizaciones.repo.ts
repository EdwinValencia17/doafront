import { http, buildUrl } from '@/services/apis/client';
import type {
  OCQuery, OCRow, OCFuente,
  OCDetalleActiva, OCDetallePendiente, FlujoRow
} from '../types';
import type { ApiPayload } from '../common/api-types';
import { mapFlujoPayload } from '../mappers/flujo.mapper';

const AS_BASE = '/api/autorizaciones-solicitante';

export async function listarOC(params: OCQuery) {
  return http.get<{
    ok: boolean;
    data: OCRow[];
    page: number;
    pageSize: number;
    total: number;
  }>(buildUrl(`${AS_BASE}/admin/oc`, params));
}

export async function getDetalle(fuente: OCFuente, id: number) {
  const res = await http.get<{ rows: (OCDetalleActiva | OCDetallePendiente)[] }>(
    `${AS_BASE}/admin/oc/${fuente}/${id}/detalle`
  );
  return res.rows;
}

export async function getFlujo(fuente: OCFuente, id: number) {
  const payload = await http.get<ApiPayload<FlujoRow>>(
    `${AS_BASE}/admin/oc/${fuente}/${id}/flujo`
  );
  return mapFlujoPayload(payload);
}
