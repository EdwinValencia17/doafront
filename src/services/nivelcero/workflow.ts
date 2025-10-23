
import { http } from "@/services/apis/client";
import type { IniciarResponse } from "./types";
const base = "/api/doa/po";

export const WorkflowService = {
  preview: (ids: number[], usuario: string) =>
    http.post<IniciarResponse>(`${base}/iniciar`, {
      ids, usuario, validar: true, persist: false,
    }),

  iniciar: (
    ids: number[],
    usuario: string,
    opts?: { validar?: boolean; notificarProveedor?: boolean; forzar?: boolean; persist?: boolean }
  ) =>
    http.post<IniciarResponse>(`${base}/iniciar`, {
      ids,
      usuario,
      validar: opts?.validar ?? true,
      notificarProveedor: opts?.notificarProveedor ?? false,
      forzar: opts?.forzar ?? false,
      persist: opts?.persist ?? true,
    }),
};
