// src/services/reglasdn/api.ts
import { http } from '@/services/apis/client';

const SUPER_HDR = { 'x-ver-todo': 'S' } as const;

/** Respuesta de /reglasdn/reglas */
export type ReglasResp = {
  rows?: unknown[];
  total?: number;
  /** Flag lógico; lo setea el service si detecta 304 en su catch */
  noModificado?: boolean;
};

type CentroRaw = { centroCosto: string; compania: string };
type CategoriaRaw = { id: number; categoria: string; descripcion?: string };
type CatalogosRaw = { tipos: string[]; niveles: string[] };
type ImportResp = { ok: boolean; imported: number; total: number };
type UpsertResp = { ok: boolean; regla: unknown };

export const ReglasAPI = {
  // Estos métodos regresan el payload ya desenvuelto (http.get<T> -> Promise<T>)
  getCentros: () =>
    http.get<CentroRaw[]>('/api/reglasdn/centros', { headers: SUPER_HDR }),

  getCategorias: () =>
    http.get<CategoriaRaw[]>('/api/reglasdn/categorias', { headers: SUPER_HDR }),

  getCatalogos: () =>
    http.get<CatalogosRaw>('/api/reglasdn/catalogos', { headers: SUPER_HDR }),

  // No usamos validateStatus ni .data: el wrapper ya devuelve T
  getReglas: (centro?: string, page = 1, pageSize = 20, signal?: AbortSignal) => {
    const qs = centro
      ? `?centro=${encodeURIComponent(centro)}&page=${page}&pageSize=${pageSize}`
      : `?page=${page}&pageSize=${pageSize}`;
    return http.get<ReglasResp>(`/api/reglasdn/reglas${qs}`, {
      headers: SUPER_HDR,
      signal,
    });
  },

  upsertRegla: (body: unknown) =>
    http.post<UpsertResp, unknown>('/api/reglas', body, { headers: SUPER_HDR }),

  deleteRegla: (id: string) =>
    http.delete<unknown>(`/api/reglas/${encodeURIComponent(id)}`, { headers: SUPER_HDR }),

  // Para este http wrapper, no pasamos responseType; pedimos <Blob> y listo
  descargarPlantilla: () =>
    http.get<Blob>('/api/reglas/plantilla', { headers: SUPER_HDR }),

  importarExcel: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    // Nota: no fijes Content-Type; el browser lo arma con boundary
    return http.post<ImportResp, FormData>('/api/reglasdn/import', fd, { headers: SUPER_HDR });
  },
};
