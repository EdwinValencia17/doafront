// src/services/doa/po/types.ts
export type Prioridad = "G" | "I" | "N" | "P" | "U";

export interface ComboItem { value: string; label: string }

export interface BandejaFiltro {
  numeroSolicitud?: string;
  numeroOc?: string;
  centroCosto?: string;
  compania?: string;
  solicitante?: string;
  sistema?: string;
  proveedorNit?: string;
  prioridad?: Prioridad;
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string;    // YYYY-MM-DD
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface BandejaRow {
  id: number;
  numeroSolicitud: string | null;
  numOrden: string | null;
  fechaOrden: string | null;
  fechaOrdenString?: string | null;
  centroCosto: string | null;
  compania: string | null;
  empresa: string | null;
  sistema: string | null;
  descProveedor: string | null;
  nitProveedor: string | null;
  observaciones?: string | null;
  totalNeto: number | null;
  totalBruto: number | null;
  dctoGlobal: number | null;
  subTotal: number | null;
  valorIva: number | null;
  prioridadOrdenStr: string | null;
  prioridadOrden: string | null;
  tasaCambio?: number | null;
  subtotalEnDolares?: number | null;
  valorTotalConIvaDescString?: string;
}

export interface BandejaResponse {
  page: number;
  pageSize: number;
  total: number;
  data: BandejaRow[];
}

export interface ReglaEvaluada {
  id: string;
  reglaNegocio: string;
  centroCosto: string;
  compania: string;
  rango: { min: number; max: number };
}

export interface PersonaPaso {
  id: string;
  globalId?: string;
  nombre: string;
  email?: string;
}

export interface PasoAprobacion {
  tipo: string;
  nivel: string;
  personas: PersonaPaso[];
}

export interface IniciarPreviewResponse {
  ok: boolean;
  marcadas: number[];
  flujos: Array<{ id: number; error?: string; regla?: ReglaEvaluada; pasos?: PasoAprobacion[] }>;
}

export interface IniciarResponse {
  ok: boolean;
  movidas: Array<{ idPendiente: number; idCabecera: number; numeroOrden?: string | null }>;
  flujos: Array<{ idCabecera: number; regla?: ReglaEvaluada; aprobadores?: PasoAprobacion[]; error?: string }>;
  errores?: Array<{ id: number; error: string }>;
}

export type EstadoPO = "p" | "C" | "X";
