import { http, buildUrl } from '@/services/apis/client';
import { BASE, LOG, normPaged, pickParams } from '../helpers';
import type { Paged, ItemResumen } from '../types';

export const ItemsRepo = {
  async search(params: {
    q?: string; page?: number; limit?: number; con_homologaciones?: boolean;
  }): Promise<Paged<ItemResumen>> {
    const q = pickParams({
      ...params,
      con_homologaciones:
        params.con_homologaciones === true ? 'true'
        : params.con_homologaciones === false ? 'false'
        : undefined,
    });
    if (LOG) console.log('🔎 [Items.search] q:', q);
    const raw = await http.get<any>(buildUrl(`${BASE}/items`, q));
    return normPaged<ItemResumen>(raw);
  },
};
