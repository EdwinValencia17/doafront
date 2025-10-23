export type CabeceraPendiente = {
  numeroOrden?: string | null;
  fechaOrden?: string | null;
  numeroSolicitud?: string | null;
  proveedorNombre?: string | null;
  proveedorNit?: string | null;
  proveedorEmail?: string | null;
  proveedorContacto?: string | null;
  proveedorTelefono?: string | null;
  proveedorCiudad?: string | null;
  proveedorDepartamento?: string | null;
  proveedorPais?: string | null;
  compania?: string | null;
  nitCompania?: string | null;
  moneda?: string | null;
  formaPago?: string | null;
  condicionesPago?: string | null;
  centroCostoStr?: string | null;
  prioridad?: string | null;
  lugarEntrega?: string | null;
  comprador?: string | null;
  solicitanteEmail?: string | null;
  observaciones?: string | null;
  requiereContrato?: 'S' | 'N' | null;
  requierePoliza?: 'S' | 'N' | null;
};

export type DetallePendiente = {
  idDetalle: number;
  referencia?: string | null;
  descripcion?: string | null;
  unidadMedida?: string | null;
  cantidad?: number | null;
  valorTotal?: number | null;
};

export type Totales = {
  totalBruto?: number | null;
  dctoGlobal?: number | null;
  subTotal?: number | null;
  valorIva?: number | null;
  totalNeto?: number | null;
};

export type TipoPoliza = { id: number; label: string; porcentaje?: number };

export type FullDetalleResponse = {
  cabecera: CabeceraPendiente;
  detalle: DetallePendiente[];
  totales: Totales;
};

export type AdjuntoDTO = {
  id: number;
  nombreArchivo: string;
  extension: string;
  fechaCreacion: string;
};

export type GuardarPolizaDTO = {
  requierePoliza: boolean;
  requiereContrato: boolean;
  tipos: { tipoId: number; porcentaje: number }[];
};
