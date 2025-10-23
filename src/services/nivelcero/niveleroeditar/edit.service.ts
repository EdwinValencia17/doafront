import { http } from '@/services/apis/client';
import type { AdjuntoDTO, FullDetalleResponse, GuardarPolizaDTO, TipoPoliza } from '@/services/nivelcero/niveleroeditar/edit.types';

const base = '/api/doa/po';

export const EditService = {
  getFull: (id: number) => http.get<FullDetalleResponse>(`${base}/ordenes/${id}`),
  getTiposPoliza: () => http.get<TipoPoliza[]>(`${base}/polizas/tipos`),

  puedeEditar: (id: number) => http.get<{ permitido: boolean; iniciada?: boolean; tieneCentroCosto?: boolean }>(`${base}/ordenes/${id}/editar-permitido`),

  actualizarCabecera: (id: number, payload: { observaciones?: string }) =>
    http.post<{ ok: boolean }>(`${base}/ordenes/${id}/cabecera`, payload),

  guardarPolizaSeleccion: (id: number, payload: GuardarPolizaDTO) =>
    http.post<{ ok: boolean }>(`${base}/ordenes/${id}/polizas`, payload),

  listarAdjuntos: (id: number) => http.get<AdjuntoDTO[]>(`${base}/ordenes/${id}/adjuntos`),
  subirAdjuntos: (id: number, files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return http.post<{ ok: boolean }>(`${base}/ordenes/${id}/adjuntos`, fd);
  },
  eliminarAdjunto: (id: number, adjId: number) =>
    http.delete<{ ok: boolean }>(`${base}/ordenes/${id}/adjuntos/${adjId}`),

  enviarCorreoProveedor: (id: number, payload: { to: string; cc?: string; subject?: string; attachAll?: boolean; adjIds?: number[] }) =>
    http.post<{ ok: boolean }>(`${base}/ordenes/${id}/correo-proveedor`, payload),
};
