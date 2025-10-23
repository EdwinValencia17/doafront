import { useEffect, useMemo, useState } from 'react';
import { OrdersService } from '@/services/nivelcero/orders';

/** ===== Tipos del detalle =====
 * Si el back ya te entrega estas llaves, perfecto.
 * Si algunas difieren, ajusta los names acá en el mapper `toModel`.
 */
export interface CabeceraOC {
  numeroOrden?: string | null;
  numeroSolicitud?: string | null;
  fechaOrden?: string | null;
  prioridad?: string | null;

  /* Proveedor */
  proveedorNombre?: string | null;
  proveedorNit?: string | null;
  proveedorEmail?: string | null;
  proveedorContacto?: string | null;
  proveedorTelefono?: string | null;
  proveedorCiudad?: string | null;
  proveedorDepartamento?: string | null;
  proveedorPais?: string | null;
  proveedorDireccion?: string | null;

  /* Compañía */
  compania?: string | null;
  nitCompania?: string | null;
  moneda?: string | null;
  formaPago?: string | null;
  condicionesPago?: string | null;
  centroCostoStr?: string | null;

  /* Entrega / Comprador */
  lugarEntrega?: string | null;
  comprador?: string | null;
  observaciones?: string | null;
  solicitanteEmail?: string | null;
}

export interface DetalleOC {
  idDetalle?: number | string;
  referencia?: string | null;
  descripcion?: string | null;
  fechaEntrega?: string | null;
  unidadMedida?: string | null;
  cantidad?: number | null;
  valorUnitario?: number | null;
  ivaRef?: number | string | null;
  valorIva?: number | null;
  valorDescuento?: number | null;
  valorTotal?: number | null;
}

export interface TotalesOC {
  totalBruto?: number | null;
  dctoGlobal?: number | null;
  subTotal?: number | null;
  valorIva?: number | null;
  totalNeto?: number | null;
  subtotalUSD?: number | null;
}

export type VerOCState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | {
      status: 'success';
      cab: CabeceraOC;
      items: DetalleOC[];
      tot: TotalesOC;
    };

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

/** Mapea “lo que venga” a nuestro modelo seguro */
function toModel(raw: unknown): { cab: CabeceraOC; items: DetalleOC[]; tot: TotalesOC } {
  // Se aceptan 2 formatos: { cabecera, detalle, totales }  o  { data: { cabecera, detalle, totales } }
  const r = isRecord(raw) ? raw : {};
  const root = (isRecord(r.data) ? r.data : r) as Record<string, unknown>;

  const cab = (isRecord(root.cabecera) ? root.cabecera : {}) as CabeceraOC;
  const detalle = (Array.isArray(root.detalle) ? root.detalle : []) as DetalleOC[];
  const totales = (isRecord(root.totales) ? root.totales : {}) as TotalesOC;

  return { cab, items: detalle, tot: totales };
}

export function useVerOC(ocId?: number | null) {
  const [state, setState] = useState<VerOCState>({ status: 'idle' });

  useEffect(() => {
    if (!ocId) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setState({ status: 'loading' });
        const raw = await OrdersService.getDetalleParaVer(ocId);
        if (cancelled) return;
        const { cab, items, tot } = toModel(raw);
        setState({ status: 'success', cab, items, tot });
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof Error ? e : new Error('No se pudo obtener el detalle');
        setState({ status: 'error', error: err });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ocId]);

  const hasData = useMemo(() => {
    if (state.status !== 'success') return false;
    const { cab, items, tot } = state;
    return Boolean(
      (cab && Object.keys(cab).length) ||
        (tot && Object.keys(tot).length) ||
        (items && items.length > 0)
    );
  }, [state]);

  return { state, hasData };
}
