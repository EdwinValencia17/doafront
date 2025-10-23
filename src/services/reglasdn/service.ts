// src/services/reglasdn/service.ts
import { ReglasAPI } from './api';
import type { ReglasResp } from './api';
import { sanitizeRegla, toAPIBody, toCentroDTO, toCategoriaDTO } from './mapper';
import type { Regla, CentroDTO, CategoriaDTO } from '@/services/reglasdn/types';
import { isAbortError, getHttpStatus } from '@/features/errors';

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
    const res: ReglasResp = await ReglasAPI.getReglas(centro, page, pageSize, signal);

    // 304/noModificado → se notifica al VM para mantener último snapshot
    if (res?.noModificado) {
      return { noModificado: true };
    }

    const rawRows = Array.isArray(res?.rows) ? res.rows : [];
    const rows: Regla[] = rawRows.map(sanitizeRegla);

    // total robusto: prioriza back; si no viene válido, usa largo del slice
    const total =
      typeof res?.total === 'number' && Number.isFinite(res.total) ? res.total : rows.length;

    return { rows, total };
  } catch (e: unknown) {
    if (isAbortError(e)) return { canceled: true };
    if (getHttpStatus(e) === 304) return { noModificado: true };
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
  return { blob, filename: 'plantilla_reglas.xlsx' };
}

export async function importarExcel(file: File): Promise<number> {
  const data = await ReglasAPI.importarExcel(file);
  return Number(data?.imported ?? 0);
}
