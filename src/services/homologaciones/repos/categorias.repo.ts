import { http, buildUrl } from '@/services/apis/client';
import { BASE, LOG, pickParams } from '../helpers';
import type { Categoria, CategoriaOption } from '../types';

export const CategoriasRepo = {
  async list(opts?: { con_items_count?: boolean }) {
    const q = pickParams({ con_items_count: opts?.con_items_count ? 'true' : undefined });
    if (LOG) console.log('📂 [Categorias.list] q:', q);
    const data = await http.get<any>(buildUrl(`${BASE}/categorias`, q));
    return (data?.data ?? []) as Categoria[];
  },

  async filterOptions(opts?: { con_contador?: boolean }) {
    const q = pickParams({ con_contador: opts?.con_contador ? 'true' : undefined });
    if (LOG) console.log('🎚️ [Categorias.filter] q:', q);
    const data = await http.get<any>(buildUrl(`${BASE}/categorias/filtro`, q));
    const list = (data?.data ?? []) as CategoriaOption[];
    return list.map(o => ({ ...o, value: Number(o.value) }));
  },
};
