export type ComboEstado = { id_esta: number; descripcion: string };
export type ComboCeco = { id_ceco: number; codigo: string; descripcion: string };
export type ComboCompania = { id_compania: number; codigo_compania: string; nombre_compania: string };
export type ComboPrioridad = { code: 'G' | 'I' | 'N' | 'P' | 'U'; label: string };

export type OCFuente = 'ACTIVA' | 'PENDIENTE';
export type Persona = { id?: number; nombre?: string | null; email?: string | null };

export type OCRow = {
  fuente: OCFuente;
  id_cabecera: number;
  numero_solicitud: string;
  numero_oc: string;
  fecha_oc: string | null;
  proveedor: string;
  total_neto: number;
  id_estado: number;
  estado: string;
  id_ceco: number | null;
  ceco_txt?: string | null;
  compania: string;
  prioridad: string | null;
  sistema: string | null;
  solicitante: string | null;
  fecha_creacion: string;
};

export type OCQuery = {
  page?: number;
  limit?: number;
  sortField?: 'fecha' | 'total' | 'oc' | 'solicitud';
  sortOrder?: 'ASC' | 'DESC';
  q?: string;
  qOC?: string;
  qSol?: string;
  proveedor?: string;
  ceco?: string | number;
  compania?: string;
  estado?: string | number;
  prioridad?: 'G' | 'I' | 'N' | 'P' | 'U' | '-1';
  sistema?: string | '-1';
  fechaDesde?: string;
  fechaHasta?: string;
};

export type OCDetalleActiva = {
  id_deta: number;
  cabecera_oc_id_cabe: number;
  referencia: string | null;
  descripcion_referencia: string | null;
  fecha_entrega: string | null;
  unidad_medida: string | null;
  cantidad: number | null;
  valor_unidad: number | null;
  iva: number | null;
  valor_iva: number | null;
  descuento: number | null;
  valor_descuento: number | null;
  valor_sin_iva_descuento: number | null;
  valor_total: number | null;
};

export type OCDetallePendiente = {
  id_deta_pendiente: number;
  id_cabepen: number;
  referencia: string | null;
  descripcion_referencia: string | null;
  fecha_entrega: string | null;
  unidad_medida: string | null;
  cantidad: number | null;
  valor_unidad: number | null;
  iva: number | null;
  valor_iva: number | null;
  descuento: number | null;
  valor_descuento: number | null;
  valor_sin_iva_descuento: number | null;
  valor_total: number | null;
};

export type CabeceraOC = {
  id_cabe: number;
  categoria_id_cate: number | null;
  estado_oc_id_esta: number | null;

  numero_solicitud: string | null;
  numero_orden_compra: string | null;
  fecha_sugerida: string | null;
  fecha_orden_compra: string | null;

  nombre_proveedor: string | null;
  contacto_proveedor: string | null;
  direccion_proveedor: string | null;
  telefono_proveedor: string | null;
  ciudad_proveedor: string | null;
  departamento_proveedor: string | null;
  pais_proveedor: string | null;
  nit_proveedor: string | null;
  email_proveedor: string | null;
  fax_proveedor: string | null;

  nombre_empresa: string | null;
  direccion_empresa: string | null;
  telefono_empresa: string | null;
  ciudad_empresa: string | null;
  pais_empresa: string | null;
  nit_empresa: string | null;
  email_empresa: string | null;
  fax_empresa: string | null;

  moneda: string | null;
  forma_de_pago: string | null;
  condiciones_de_pago: string | null;
  email_comprador: string | null;
  lugar_entrega: string | null;

  observaciones: string | null;
  observacion_compras: string | null;

  total_bruto: number | null;
  descuento_global: number | null;
  sub_total: number | null;
  valor_iva: number | null;
  total_neto: number | null;
  requiere_poliza: string | null;
  requiere_contrato: string | null;
  poliza_gestionada: string | null;
  contrato_gestionada: string | null;

  compania: string | null;
  sistema: string | null;
  bodega: string | null;
  fecha_creacion: string | null;
  oper_creador: string | null;
  fecha_modificacion: string | null;
  oper_modifica: string | null;
  estado_registro: string | null;
  centro_costo_id_ceco: number | null;
  nit_compania: string | null;

  solicitante: string | null;
  email_solicitante: string | null;
  prioridad_orden: string | null;

  exitoso_envio_po: string | null;
  intento_envio_po: number | null;
  fecha_envio_po: string | null;
  envio_correo: string | null;

  version: number | null;
  id_compania: number | null;

  descripcion_estado: string | null;
  descripcion_centro_costo: string | null;
  codigo_centro_costo: string | null;
  descripcion_compania: string | null;
};

export type RawFlujoRow = {
  id: number;
  tipoAutorizador: string | null;
  nivel: string | number | null;
  centroCosto: string | null;
  estado: string | null;
  motivoRechazo: string | null;
  observaciones: string | null;
  personas: Persona[] | string;
};
// Tipo NORMALIZADO para la UI (siempre array tipado)
export type FlujoRow = Omit<RawFlujoRow, 'personas'> & {
  personas: Persona[];
};