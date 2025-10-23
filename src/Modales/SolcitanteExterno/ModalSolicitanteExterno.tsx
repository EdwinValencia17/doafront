// src/Modales/SolcitanteExterno/ModalSolicitanteExterno.tsx
import { useEffect, useMemo, useRef, useContext, useState, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { Fieldset } from 'primereact/fieldset';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

import type { OCRow, OCFuente } from '@/services/solicitante';
import { Info } from '@/components/modalSolicitante/Info';
import { OCDetalleTable } from '@/components/modalSolicitante/OCDetalleTable';
import { OCFlujoTable } from '@/components/modalSolicitante/OCFlujoTable';
import { OCTotales } from '@/components/modalSolicitante/OCTotales';
import { useOC } from '@/hooks/modalSolicitante/useSolicitante';
import { EstadoTag, PrioridadTag } from '@/components/tags/OrderTags';
import { ToastCtx } from '@/features/toast/ToastCtx';

type Props = {
  visible: boolean;
  onHide: () => void;
  row: OCRow | null;
  idCabecera: number;
  fuente: OCFuente;
};

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO') : '-');

export default function ModalSolicitanteExterno({ visible, onHide, row, idCabecera, fuente }: Props) {
  const toastLocal = useRef<Toast>(null);
  const appToast = useContext(ToastCtx);

  const idCab = idCabecera || row?.id_cabecera || 0;
  const fo: OCFuente = fuente || (row?.fuente as OCFuente) || 'ACTIVA';

  const { status, error, cab, items, tot, flujo, estadoGeneral } = useOC(idCab, fo, row || undefined);

  // ⚙️ estados de colapso de tarjetas
  const [collapsed, setCollapsed] = useState({
    detItems: false,       // abierto por defecto
    comprador: true,
    flujo: true,
    totales: true,
  });
  const toggle = useCallback((key: keyof typeof collapsed, v: boolean) => {
    setCollapsed(s => ({ ...s, [key]: v }));
  }, []);

  // errores del hook
  useEffect(() => {
    if (status === 'error' && error) {
      appToast?.show?.({ severity: 'error', summary: 'Error', detail: error.message });
    }
  }, [status, error, appToast]);

  // guard adicional
  useEffect(() => {
    if (!visible) return;
    if (status === 'success' && (!items || items.length === 0)) {
      appToast?.show?.({
        severity: 'warn',
        summary: 'Sin datos',
        detail: `La Orden de Compra ${row?.numero_oc ?? idCab} no tiene datos que mostrar.`,
      });
      onHide();
    }
  }, [visible, status, items, appToast, onHide, row?.numero_oc, idCab]);

  const header = useMemo(
    () => (
      <div className="flex align-items-center" style={{ gap: 12 }}>
        <span>
          Detalle de orden
          {cab?.numeroOrden ? ` · ${cab.numeroOrden}` : row?.numero_oc ? ` · ${row.numero_oc}` : ''}
        </span>
        <EstadoTag s={estadoGeneral} />
      </div>
    ),
    [cab?.numeroOrden, estadoGeneral, row?.numero_oc]
  );

  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={onHide}
      modal
      blockScroll
      dismissableMask
      appendTo={document.body}
      className="rg-dialog"
      style={{ width: '96vw', maxWidth: 1000 }}
      pt={{ mask: { className: 'glass-mask' } }}
    >
      <Toast ref={toastLocal} />

      {!idCab ? (
        <div className="muted">Sin id de orden. Selecciona un registro válido.</div>
      ) : status === 'loading' ? (
        <div className="muted">Cargando…</div>
      ) : status === 'success' && cab && tot ? (
        <>
          {/* ===== Cabecera fija ===== */}
          <div className="modal-section-gap">
            <Fieldset legend="Orden de Compra" className="cc-card">
              <div className="modal-grid-3">
                <Info label="Número de Orden de Compra" value={cab.numeroOrden ?? row?.numero_oc} />
                <Info label="Fecha" value={fmtDate(cab.fechaOrden ?? row?.fecha_oc)} />
                <Info label="Número de Solicitud" value={cab.numeroSolicitud ?? row?.numero_solicitud} />
              </div>
            </Fieldset>
          </div>

          {/* ===== Proveedor fijo ===== */}
          <div className="modal-section-gap">
            <Fieldset legend="Proveedor" className="cc-card">
              <div className="modal-grid-3">
                <Info label="Nombre" value={cab.proveedorNombre ?? row?.proveedor} />
                <Info label="NIT" value={cab.proveedorNit} />
                <Info label="Correo" value={cab.proveedorEmail} />
                <Info label="Contacto" value={cab.proveedorContacto} />
                <Info label="Teléfono" value={cab.proveedorTelefono} />
                <Info label="Ciudad" value={cab.proveedorCiudad} />
                <Info label="Departamento" value={cab.proveedorDepartamento} />
                <Info label="País" value={cab.proveedorPais} />
                <Info label="Dirección" value={cab.proveedorDireccion} />
                <Info label="Fax" value={cab.proveedorFax} />
              </div>
            </Fieldset>
          </div>

          {/* ===== Detalles de Ítems (desplegable) ===== */}
          <div className="modal-section-gap">
            <Fieldset
              legend="Detalles de Ítems"
              toggleable
              collapsed={collapsed.detItems}
              onToggle={(e) => toggle('detItems', e.value)}
              className="cc-card"
            >
              <div className="doa-table table--violet table--responsive">
                <OCDetalleTable items={items} moneda={cab.moneda} />
              </div>
            </Fieldset>
          </div>

          {/* ===== Comprador y Entrega (desplegable) ===== */}
          <div className="modal-section-gap">
            <Fieldset
              legend="Comprador y Entrega"
              toggleable
              collapsed={collapsed.comprador}
              onToggle={(e) => toggle('comprador', e.value)}
              className="cc-card"
            >
              <div className="modal-grid-3">
                <Info label="Tipo de Entrega" value={cab.lugarEntrega} />
                <Info label="Comprador" value={cab.comprador} />
                <Info label="Observaciones" value={cab.observaciones} />
                <Info label="Correo Solicitante" value={cab.solicitanteEmail ?? row?.solicitante} />

                <Divider className="col-12" />

                <Info label="Compañía" value={cab.compania} />
                <Info label="NIT Compañía" value={cab.nitCompania} />
                <Info label="Moneda" value={cab.moneda || 'COP'} />
                <Info label="Forma de Pago" value={cab.formaPago} />
                <Info label="Condiciones de Pago" value={cab.condicionesPago} />
                <div className="info">
                  <div className="info-label muted">Prioridad</div>
                  <div className="info-value"><PrioridadTag p={cab.prioridad} /></div>
                </div>

                <Divider className="col-12" />

                <Info label="Centro de Costo" value={cab.centroCostoStr} />
              </div>
            </Fieldset>
          </div>

          {/* ===== Flujo de Aprobación (desplegable) ===== */}
          <div className="modal-section-gap">
            <Fieldset
              legend="Flujo de Aprobación"
              toggleable
              collapsed={collapsed.flujo}
              onToggle={(e) => toggle('flujo', e.value)}
              className="cc-card"
            >
              <OCFlujoTable flujo={flujo} />
            </Fieldset>
          </div>

          {/* ===== Totales (desplegable) ===== */}
          <div className="modal-section-gap">
            <Fieldset
              legend="Totales"
              toggleable
              collapsed={collapsed.totales}
              onToggle={(e) => toggle('totales', e.value)}
              className="cc-card"
            >
              <OCTotales tot={tot} moneda={cab.moneda} />
            </Fieldset>
          </div>
        </>
      ) : (
        <div className="muted">Sin datos</div>
      )}
    </Dialog>
  );
}
