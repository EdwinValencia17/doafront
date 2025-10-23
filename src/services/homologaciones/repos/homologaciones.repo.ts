import { http, buildUrl } from '@/services/apis/client';
import { BASE, LOG, normPaged, pickParams, asNumber } from '../helpers';
import type {
  EstadoRegistro, Paged, Homologacion,
  HomologacionCreatePayload, HomologacionUpdatePayload
} from '../types';

export const HomologacionesRepo = {
  async search(params: {
    item?: string; categoria?: string; estado?: EstadoRegistro;
    page?: number; limit?: number;
  }): Promise<Paged<Homologacion>> {
    const q = pickParams(params ?? {});
    if (LOG) console.log('🔍 [Homologaciones.search] q:', q);
    const raw = await http.get<any>(buildUrl(`${BASE}`, q));
    return normPaged<Homologacion>(raw);
  },

  async create(payload: HomologacionCreatePayload) {
    const body = {
      ...payload,
      item_id_item: asNumber(payload.item_id_item),
      categoria_id_cate: asNumber(payload.categoria_id_cate),
    };
    if (LOG) console.log('🆕 [Homologaciones.create] body:', body);
    return http.post<Homologacion>(`${BASE}`, body);
  },

  async update(id: number | string, payload: HomologacionUpdatePayload) {
    const idNum = Number(id);
    const body = pickParams({
      ...payload,
      categoria_id_cate:
        payload.categoria_id_cate !== undefined
          ? asNumber(payload.categoria_id_cate)
          : undefined,
    });
    if (!Object.keys(body).length) {
      throw new Error('Nada para actualizar (descripcion y/o categoria_id_cate)');
    }
    if (LOG) console.log('✏️ [Homologaciones.update] id/body:', idNum, body);
    return http.put<{ success: boolean; message: string; data: Homologacion }>(`${BASE}/${idNum}`, body);
  },

  async setEstado(id: number | string, estado: EstadoRegistro) {
    const idNum = Number(id);
    const body = { estado };
    if (LOG) console.log('🔄 [Homologaciones.estado] id/body:', idNum, body);
    return http.patch<{ success: boolean; message: string; data: Homologacion }>(`${BASE}/${idNum}/estado`, body);
  },
};
