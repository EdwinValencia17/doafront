import { http } from '@/services/apis/client';
import { BASE, LOG, asNumber } from '../helpers';

export const MasivoRepo = {
  async crear(payload: {
    items: Array<{ item_id: number | string; categoria_id: number | string; descripcion?: string; }>;
    orden_compra_id?: number | string;
    origen?: string;
  }) {
    const body = {
      ...payload,
      items: payload.items.map(i => ({
        ...i,
        item_id: asNumber(i.item_id),
        categoria_id: asNumber(i.categoria_id),
      })),
      orden_compra_id: asNumber(payload.orden_compra_id),
    };
    if (LOG) console.log('📦 [Masivo.crear] body:', body);
    return http.post<{
      success: boolean;
      message: string;
      resultados: { total: number; creadas: number; actualizadas: number; errores: number; detalles: any[]; };
      orden_compra_id?: number;
    }>(`${BASE}/masivo`, body);
  },
};
