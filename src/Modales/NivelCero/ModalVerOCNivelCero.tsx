import { useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Fieldset } from 'primereact/fieldset';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';

import { useVerOC } from '@/hooks/nivelCero/useVerOC';

export default function ModalVerOCNivelCero({
  open,
  ocId,
  onClose,
}: {
  open: boolean;
  ocId: number | null;
  onClose: () => void;
}) {
  const { state, hasData } = useVerOC(open ? ocId ?? undefined : undefined);

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-CO') : '-';

  const fmtMoney = (v?: number | null, c?: string | null) => {
    if (v == null) return '-';
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: c || 'COP',
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return new Intl.NumberFormat('es-CO').format(v);
    }
  };

  const prioridadTag = (p?: string | null) => {
    const code = (p || '').toUpperCase();
    const map: Record<string, { label: string; severity: any }> = {
      G: { label: 'URGENTE', severity: 'danger' },
      I: { label: 'INVENTARIO', severity: 'info' },
      N: { label: 'NORMAL', severity: 'success' },
      P: { label: 'PREVENTIVO', severity: 'warning' },
      U: { label: 'PRIORITARIO', severity: 'warning' },
    };
    const m = map[code] || { label: code || '-', severity: 'secondary' };
    return <Tag value={m.label} severity={m.severity} />;
  };

  const Info = ({ label, value }: { label: string; value?: any }) => (
    <div className="info" style={{ minWidth: 0 }}>
      <div className="info-label muted">{label}</div>
      <div className="info-value">{value ?? '-'}</div>
    </div>
  );

  const header = useMemo(() => {
    if (state.status !== 'success') return 'Detalle de Orden';
    const num = state.cab?.numeroOrden ? ` · ${state.cab.numeroOrden}` : '';
    return (
      <div className="flex align-items-center" style={{ gap: 12 }}>
        <span>Detalle de Orden{num}</span>
        {prioridadTag(state.cab?.prioridad)}
      </div>
    );
  }, [state]);

  return (
    <Dialog
      header={header}
      visible={open}
      onHide={onClose}
      modal
      blockScroll
      dismissableMask
      className="rg-dialog"
      style={{ width: '96vw', maxWidth: 1200 }}
      pt={{ mask: { className: 'glass-mask' } }}
    >
      {state.status === 'loading' && (
        <div className="flex align-items-center gap-2">
          <ProgressSpinner style={{ width: 28, height: 28 }} />
          <span className="muted">Cargando información…</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="muted">No fue posible cargar el detalle.</div>
      )}

      {state.status === 'success' && !hasData && (
        <div className="muted">Sin datos para mostrar.</div>
      )}

      {state.status === 'success' && hasData && (
        <>
          {/* ===== Orden de Compra (toggleable) ===== */}
          <Fieldset legend="Orden de Compra" className="cc-card" toggleable collapsed>
            <div className="grid" style={{ rowGap: 8 }}>
              <Info label="Número de Orden de Compra" value={state.cab.numeroOrden} />
              <Divider />
              <Info label="Fecha" value={fmtDate(state.cab.fechaOrden)} />
              <Divider />
              <Info label="Número de Solicitud" value={state.cab.numeroSolicitud} />
            </div>
          </Fieldset>

          {/* ===== Proveedor (toggleable) ===== */}
          <Fieldset legend="Proveedor" className="cc-card" toggleable collapsed>
            <div className="grid" style={{ rowGap: 8 }}>
              <Info label="Nombre" value={state.cab.proveedorNombre} />
              <div className="rg-grid rg-2">
                <Info label="NIT" value={state.cab.proveedorNit} />
                <Info label="Correo" value={state.cab.proveedorEmail} />
              </div>
              <div className="rg-grid rg-2">
                <Info label="Contacto" value={state.cab.proveedorContacto} />
                <Info label="Teléfono" value={state.cab.proveedorTelefono} />
              </div>
              <div className="rg-grid rg-3">
                <Info label="Ciudad" value={state.cab.proveedorCiudad} />
                <Info label="Departamento" value={state.cab.proveedorDepartamento} />
                <Info label="País" value={state.cab.proveedorPais} />
              </div>
              <Info label="Dirección" value={state.cab.proveedorDireccion} />
            </div>
          </Fieldset>

          {/* ===== Empresa / Compañía (toggleable) ===== */}
          <Fieldset legend="Empresa / Compañía" className="cc-card" toggleable collapsed>
            <div className="grid" style={{ rowGap: 8 }}>
              <div className="rg-grid rg-2">
                <Info label="Compañía" value={state.cab.compania} />
                <Info label="NIT Compañía" value={state.cab.nitCompania} />
              </div>
              <div className="rg-grid rg-3">
                <Info label="Moneda" value={state.cab.moneda || 'COP'} />
                <Info label="Forma de Pago" value={state.cab.formaPago} />
                <Info label="Condiciones de Pago" value={state.cab.condicionesPago} />
              </div>
              <Divider />
              <div className="rg-grid rg-3">
                <Info label="Centro de Costo" value={state.cab.centroCostoStr} />
                <Info label="Prioridad" value={<span style={{ display: 'inline-flex' }}>{prioridadTag(state.cab.prioridad)}</span>} />
              </div>
            </div>
          </Fieldset>

          {/* ===== Comprador y Entrega (toggleable) ===== */}
          <Fieldset legend="Comprador y Entrega" className="cc-card" toggleable collapsed>
            <div className="grid" style={{ rowGap: 8 }}>
              <Info label="Lugar de Entrega" value={state.cab.lugarEntrega} />
              <Divider />
              <div className="rg-grid rg-2">
                <Info label="Comprador" value={state.cab.comprador} />
                <Info label="Observaciones" value={state.cab.observaciones} />
              </div>
              <Info label="Correo Solicitante" value={state.cab.solicitanteEmail} />
            </div>
          </Fieldset>

          {/* ===== Detalles del ítem (toggleable) ===== */}
          <Fieldset legend="Detalles del ítem" className="cc-card" toggleable>
            <DataTable
              value={state.items}
              dataKey="idDetalle"
              responsiveLayout="scroll"
              paginator
              rows={10}
              className="dt-violet"
              emptyMessage="Sin ítems."
            >
              <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 60 }} />
              <Column field="referencia" header="Referencia" />
              <Column field="descripcion" header="Descripción" />
              <Column
                field="fechaEntrega"
                header="F.E."
                body={(r) => fmtDate(r.fechaEntrega)}
                style={{ width: 120 }}
              />
              <Column field="unidadMedida" header="UM" style={{ width: 90 }} />
              <Column field="cantidad" header="Cantidad" style={{ width: 110 }} />
              <Column
                field="valorUnitario"
                header="Valor Und"
                body={(r) => fmtMoney(Number(r.valorUnitario))}
                style={{ width: 140 }}
              />
              <Column field="ivaRef" header="IVA%" style={{ width: 90 }} />
              <Column
                field="valorIva"
                header="Valor IVA"
                body={(r) => fmtMoney(Number(r.valorIva))}
                style={{ width: 140 }}
              />
              <Column
                field="valorDescuento"
                header="Descuento"
                body={(r) => fmtMoney(Number(r.valorDescuento))}
                style={{ width: 140 }}
              />
              <Column
                field="valorTotal"
                header="Valor Total"
                body={(r) => fmtMoney(Number(r.valorTotal))}
                style={{ width: 160 }}
              />
            </DataTable>
          </Fieldset>

          {/* ===== Totales (toggleable) ===== */}
          <Fieldset legend="Totales" className="cc-card" toggleable collapsed>
            <div className="rg-grid rg-2">
              <div className="muted">Total Bruto</div>
              <div className="font-semibold">{fmtMoney(state.tot.totalBruto, state.cab.moneda)}</div>
              <div className="muted">Dcto Global</div>
              <div className="font-semibold">{fmtMoney(state.tot.dctoGlobal, state.cab.moneda)}</div>
              <div className="muted">Subtotal</div>
              <div className="font-semibold">{fmtMoney(state.tot.subTotal, state.cab.moneda)}</div>
              <div className="muted">Valor IVA</div>
              <div className="font-semibold">{fmtMoney(state.tot.valorIva, state.cab.moneda)}</div>
              <div className="muted">Total Neto</div>
              <div className="font-semibold">{fmtMoney(state.tot.totalNeto, state.cab.moneda)}</div>
              {state.tot.subtotalUSD != null && (
                <>
                  <div className="muted">Subtotal en dólares</div>
                  <div className="font-semibold">{fmtMoney(state.tot.subtotalUSD, 'USD')}</div>
                </>
              )}
            </div>
          </Fieldset>
        </>
      )}
    </Dialog>
  );
}
