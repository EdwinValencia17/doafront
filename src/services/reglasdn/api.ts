// src/services/reglasdn/api.ts
import { http } from '@/services/apis/client';

const SUPER_HDR = { 'x-ver-todo': 'S' } as const;

export const ReglasAPI = {
  getCentros: () =>
    http.get<Array<{ centroCosto: string; compania: string }>>('/api/reglasdn/centros', { headers: SUPER_HDR }),

  getCategorias: () =>
    http.get<Array<{ id: number; categoria: string; descripcion?: string }>>('/api/reglasdn/categorias', { headers: SUPER_HDR }),

  getCatalogos: () =>
    http.get<{ tipos: string[]; niveles: string[] }>('/api/reglasdn/catalogos', { headers: SUPER_HDR }),

  getReglas: (centro?: string, page = 1, pageSize = 20, signal?: AbortSignal) =>
    http.get<{ rows?: any[]; total?: number; noModificado?: boolean }>(
      `/api/reglasdn/reglas${centro ? `?centro=${encodeURIComponent(centro)}&page=${page}&pageSize=${pageSize}` : `?page=${page}&pageSize=${pageSize}`}`,
      { headers: SUPER_HDR, signal }
    ),

  upsertRegla: (body: any) =>
    http.post<{ ok: boolean; regla: any }>('/api/reglas', body, { headers: SUPER_HDR }),

  deleteRegla: (id: string) =>
    http.delete(`/api/reglas/${encodeURIComponent(id)}`, { headers: SUPER_HDR }),

  // Excel: usa Axios con responseType 'blob' (más simple que fetch) 
  descargarPlantilla: () =>
    http.get<Blob>('/api/reglas/plantilla', { headers: SUPER_HDR, responseType: 'blob' as any }),

  importarExcel: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    // OJO: NO fijes Content-Type; el browser/axios agrega el boundary
    return http.post<{ ok: boolean; imported: number; total: number }>(
      '/api/reglasdn/import', fd, { headers: SUPER_HDR }
    );
  },
};
