import { http } from '@/services/apis/client';
import { BASE, LOG } from '../helpers';

export const EstadisticasRepo = {
  async get() {
    if (LOG) console.log('📊 [Estadisticas.get]');
    return http.get<{
      success: boolean;
      estadisticas: {
        total_items: number;
        total_categorias: number;
        total_homologaciones_activas: number;
        total_homologaciones_inactivas: number;
        items_sin_homologar: number;
        categorias_sin_items: number;
        homologaciones_recientes: number;
      };
      top_categorias: Array<{ id_cate: number; categoria: string; total_items: number; }>;
    }>(`${BASE}/estadisticas`);
  },
};
