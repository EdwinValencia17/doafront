export type DetalleUI = {
  idDetalle: number;
  referencia?: string | null;
  descripcion?: string | null;
  unidadMedida?: string | null;
  cantidad?: number | null;
  valorUnitario?: number | null;
  valorTotal?: number | null;
  ivaRef?: number | null;
};

export type TotalesUI = {
  totalBruto: number;
  dctoGlobal: number;
  subTotal: number;
  valorIva: number;
  totalNeto: number;
};

export type CabeceraUI = {
  // Orden
  numeroOrden?: string | null;
  fechaOrden?: string | null;      // YYYY-MM-DD
  numeroSolicitud?: string | null;

  // Proveedor
  proveedorNombre?: string | null;
  proveedorNit?: string | null;
  proveedorEmail?: string | null;
  proveedorTelefono?: string | null;
  proveedorDireccion?: string | null;
  proveedorCiudad?: string | null;
  proveedorDepartamento?: string | null;
  proveedorPais?: string | null;
  proveedorFax?: string | null;
  proveedorContacto?: string | null;

  // Empresa / Compañía
  compania?: string | null;
  empresa?: string | null;
  nitCompania?: string | null;
  nitEmpresa?: string | null;
  empresaDireccion?: string | null;
  empresaTelefono?: string | null;
  ciudadEmpresa?: string | null;
  paisEmpresa?: string | null;
  emailEmpresa?: string | null;
  faxEmpresa?: string | null;
  moneda?: string | null;
  formaPago?: string | null;
  condicionesPago?: string | null;
  observacionCompras?: string | null;

  // Otros
  centroCostoStr?: string | null;
  prioridad?: string | null;

  // Comprador / Entrega
  lugarEntrega?: string | null;
  comprador?: string | null;       // email_comprador
  solicitanteNombre?: string | null;
  solicitanteEmail?: string | null;
  observaciones?: string | null;

  // Estado general
  estadoGeneral?: string | null;
};
