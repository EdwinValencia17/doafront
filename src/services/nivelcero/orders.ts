
import { http } from "@/services/apis/client";
import { buildUrl } from "@/services/apis/url";
import { buildParams } from "./params";
import type { BandejaFiltro, BandejaResponse } from "./types";

const base = "/api/doa/po";

export const OrdersService = {
  listar: (filtros: BandejaFiltro = {}) =>
    http.get<BandejaResponse>(buildUrl(`${base}/ordenes`, buildParams(filtros))),

  getDetalleParaVer: (id: number) =>
    http.get<unknown>(`${base}/ordenes/${id}`),

  cancelar: (id: number, usuario: string) =>
    http.post<{ ok: boolean; id: number }>(`${base}/cancelar/${id}`, { usuario }),

  puedeEditar: (id: number) =>
    http.get<unknown>(`${base}/ordenes/${id}/editar-permitido`),
};
