
import { http } from "@/services/apis/client";
import type { EstadoPO } from "./types";
const base = "/api/doa/po";

export const IntegrationService = {
  actualizarOrdenes: () =>
    http.post<{ ok: boolean }>(`${base}/actualizar-ordenes`, {}),

  syncDesdeQAD: (po?: string) =>
    http.post<{ ok: boolean }>(`${base}/sync`, po ? { po } : {}),

  updateEstadoPO: (dominio: string, po: string, estado: EstadoPO) =>
    http.post<{ ok: boolean; status: number; raw: string }>(`${base}/update-state`, {
      domain: dominio, po, estado,
    }),
};
