import type {
  CabeceraOC, OCRow, OCDetalleActiva, OCDetallePendiente
} from '@/services/solicitante';
import type { CabeceraUI, DetalleUI } from './oc.types';

// a) Cabecera desde /cabecera-oc/:id
export function mapCabeceraFromCab(c: CabeceraOC): CabeceraUI {
  return {
    numeroOrden: c.numero_orden_compra ?? null,
    fechaOrden: c.fecha_orden_compra ?? null,
    numeroSolicitud: c.numero_solicitud ?? null,

    proveedorNombre: c.nombre_proveedor ?? null,
    proveedorNit: c.nit_proveedor ?? null,
    proveedorEmail: c.email_proveedor ?? null,
    proveedorTelefono: c.telefono_proveedor ?? null,
    proveedorDireccion: c.direccion_proveedor ?? null,
    proveedorCiudad: c.ciudad_proveedor ?? null,
    proveedorDepartamento: c.departamento_proveedor ?? null,
    proveedorPais: c.pais_proveedor ?? null,
    proveedorFax: c.fax_proveedor ?? null,
    proveedorContacto: c.contacto_proveedor ?? null,

    compania: c.compania ?? null,
    empresa: c.nombre_empresa ?? null,
    nitCompania: c.nit_compania ?? null,
    nitEmpresa: c.nit_empresa ?? null,
    empresaDireccion: c.direccion_empresa ?? null,
    empresaTelefono: c.telefono_empresa ?? null,
    ciudadEmpresa: c.ciudad_empresa ?? null,
    paisEmpresa: c.pais_empresa ?? null,
    emailEmpresa: c.email_empresa ?? null,
    faxEmpresa: c.fax_empresa ?? null,
    moneda: c.moneda ?? 'COP',
    formaPago: c.forma_de_pago ?? null,
    condicionesPago: c.condiciones_de_pago ?? null,
    observacionCompras: c.observacion_compras ?? null,

    centroCostoStr: c.codigo_centro_costo ?? String(c.centro_costo_id_ceco ?? ''),
    prioridad: c.prioridad_orden ?? null,

    lugarEntrega: c.lugar_entrega ?? null,
    comprador: c.email_comprador ?? null,
    solicitanteNombre: c.solicitante ?? null,
    solicitanteEmail: c.email_solicitante ?? null,
    observaciones: c.observaciones ?? null,
  };
}

// b) Fallback desde la row (listado)
export function mapCabeceraFromRow(row?: OCRow | null): CabeceraUI | null {
  if (!row) return null;
  const r: any = row;
  return {
    numeroOrden: r.numero_oc ?? null,
    fechaOrden: r.fecha_oc ?? r.fecha_creacion ?? null,
    numeroSolicitud: r.numero_solicitud ?? null,

    proveedorNombre: r.proveedor ?? null,

    compania: r.compania ?? null,
    moneda: 'COP',
    centroCostoStr: r.ceco_txt ?? r.id_ceco ?? null,
    prioridad: r.prioridad ?? null,

    solicitanteNombre: r.solicitante ?? null,
  };
}

// c) Detalle Activa/Pendiente → UI
export function mapDetalle(det: (OCDetalleActiva | OCDetallePendiente)[] = []): DetalleUI[] {
  return (det || []).map((d: any, i: number) => ({
    idDetalle: d.id_deta ?? d.id_deta_pendiente ?? d.id ?? i,
    referencia: d.referencia ?? null,
    descripcion: d.descripcion_referencia ?? d.descripcion ?? null,
    unidadMedida: d.unidad_medida ?? null,
    cantidad: d.cantidad ?? null,
    valorUnitario: d.valor_unidad ?? null,
    valorTotal: d.valor_total ?? null,
    ivaRef: d.valor_iva ?? null,
  }));
}
