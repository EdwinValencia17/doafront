// src/services/reglasdn/service.ts
import { ReglasAPI } from './api';
import { sanitizeRegla, toAPIBody, toCentroDTO, toCategoriaDTO } from './mapper';
import type { Regla, CentroDTO, CategoriaDTO } from '@/services/reglasdn/types';

export async function getCentros(): Promise<CentroDTO[]> {
  const data = await ReglasAPI.getCentros();
  return (Array.isArray(data) ? data : []).map(toCentroDTO);
}

export async function getCategorias(): Promise<CategoriaDTO[]> {
  const data = await ReglasAPI.getCategorias();
  return (Array.isArray(data) ? data : []).map(toCategoriaDTO);
}

export async function getCatalogos(): Promise<{ tipos: string[]; niveles: string[] }> {
  const data = await ReglasAPI.getCatalogos();
  return {
    tipos: Array.isArray(data?.tipos) ? data.tipos : [],
    niveles: Array.isArray(data?.niveles) ? data.niveles : [],
  };
}

export async function getReglas(
  centro?: string,
  opts?: { page?: number; pageSize?: number; signal?: AbortSignal }
): Promise<{ rows?: Regla[]; total?: number; noModificado?: boolean; canceled?: boolean }> {
  const { page = 1, pageSize = 20, signal } = opts || {};
  try {
    const res = await ReglasAPI.getReglas(centro, page, pageSize, signal);
    return {
      rows: Array.isArray(res?.rows) ? res.rows.map(sanitizeRegla) : [],
      total: Number(res?.total || 0),
      noModificado: res?.noModificado === true,
    };
  } catch (e: any) {
    // Cancelación (si tu http propaga AbortError/CanceledError)
    if (e?.name === 'AbortError' || e?.code === 'ERR_CANCELED' || e?.message === 'canceled') {
      return { canceled: true };
    }
    throw e;
  }
}

export async function upsertRegla(regla: Partial<Regla>): Promise<Regla> {
  const { regla: raw } = await ReglasAPI.upsertRegla(toAPIBody(regla));
  return sanitizeRegla(raw);
}

export async function deleteRegla(id: string): Promise<void> {
  await ReglasAPI.deleteRegla(id);
}

export async function descargarPlantilla(): Promise<{ blob: Blob; filename: string }> {
  const blob = await ReglasAPI.descargarPlantilla();
  // Si el back setea filename en cabecera y Axios la expone: úsalo; si no, pon fijo.
  const filename = 'plantilla_reglas.xlsx';
  return { blob, filename };
}

export async function importarExcel(file: File): Promise<number> {
  const data = await ReglasAPI.importarExcel(file);
  return Number(data?.imported || 0);
}
