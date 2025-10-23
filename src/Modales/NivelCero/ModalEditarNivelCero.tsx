import React, { useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Fieldset } from 'primereact/fieldset';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

import type { AdjuntoDTO, DetallePendiente } from '@/services/nivelcero/niveleroeditar/edit.types';
import { useEditOC } from '@/hooks/nivelCero/useEditOC';

export interface EditOCModalProps {
  open: boolean;
  ocId: number | null;
  onClose: () => void;
  onAfterAction?: () => void;
}

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO') : '-');
const fmtMoney = (v?: number | null, c?: string | null) => {
  if (v == null) return '-';
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: c || 'COP', maximumFractionDigits: 0 }).format(Number(v));
  } catch { return new Intl.NumberFormat('es-CO').format(Number(v)); }
};
const Right: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ textAlign: 'right', width: '100%' }}>{children}</div>;

const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="info" style={{ minWidth: 0 }}>
    <div className="info-label muted">{label}</div>
    <div className="info-value">{value ?? '-'}</div>
  </div>
);

export default function EditOCModal({ open, ocId, onClose, onAfterAction }: EditOCModalProps) {
  const {
    primeToastRef, busy, canEdit, editReason,
    cab, items, tot,
    observaciones, setObservaciones, guardarCabecera,
    requiereContrato, setReqContrato, requierePoliza, setReqPoliza,
    tipos, isPolEnabled, polPct, togglePol, setPctFor, guardarPolizas,
    adjuntos, subirAdj, eliminarAdjunto,
    sendMail, setSendMail, to, setTo, cc, setCc, subject, setSubject,
    attachAll, setAttachAll, selAdjIds, setSelAdjIds, enviarCorreo, sending,
  } = useEditOC({ ocId, open, onAfterAction });

  const fileInp = useRef<HTMLInputElement>(null);

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

  const header = useMemo(() => (
    <div className="flex align-items-center" style={{ gap: 12 }}>
      <span>Editar Orden{cab?.numeroOrden ? ` · ${cab?.numeroOrden}` : ''}</span>
      {prioridadTag(cab?.prioridad)}
      {!canEdit && editReason && <Tag value={editReason} severity="warning" style={{ marginLeft: 8 }} />}
    </div>
  ), [cab, canEdit, editReason]);

  return (
    <Dialog
      header={header}
      visible={open}
      onHide={onClose}
      modal blockScroll dismissableMask
      className="rg-dialog"
      style={{ width: '96vw', maxWidth: 1320 }}
      appendTo={typeof window !== 'undefined' ? document.body : undefined}
      baseZIndex={2000}
    >
      <Toast ref={primeToastRef} />

      {!cab ? (
        <div className="muted">{busy ? 'Cargando…' : 'Sin datos'}</div>
      ) : (
        <>
          {/* ===== Cabecera ===== */}
          <div className="rg-grid rg-2" style={{ marginBottom: 16 }}>
            <Fieldset legend="Orden de Compra" className="cc-card">
              <div className="grid" style={{ rowGap: 8 }}>
                <Info label="Número de Orden de Compra" value={cab.numeroOrden} />
                <Divider />
                <Info label="Fecha" value={fmtDate(cab.fechaOrden)} />
                <Divider />
                <Info label="Número de Solicitud" value={cab.numeroSolicitud} />
              </div>
            </Fieldset>

            <Fieldset legend="Proveedor" className="cc-card">
              <div className="grid" style={{ rowGap: 8 }}>
                <Info label="Nombre" value={cab.proveedorNombre} />
                <div className="rg-grid rg-2">
                  <Info label="NIT" value={cab.proveedorNit} />
                  <Info label="Correo" value={cab.proveedorEmail} />
                </div>
                <div className="rg-grid rg-2">
                  <Info label="Contacto" value={cab.proveedorContacto} />
                  <Info label="Teléfono" value={cab.proveedorTelefono} />
                </div>
                <div className="rg-grid rg-3">
                  <Info label="Ciudad" value={cab.proveedorCiudad} />
                  <Info label="Departamento" value={cab.proveedorDepartamento} />
                  <Info label="País" value={cab.proveedorPais} />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend="Empresa / Compañía" className="cc-card">
              <div className="grid" style={{ rowGap: 8 }}>
                <div className="rg-grid rg-2">
                  <Info label="Compañía" value={cab.compania} />
                  <Info label="NIT Compañía" value={cab.nitCompania} />
                </div>
                <div className="rg-grid rg-3">
                  <Info label="Moneda" value={cab.moneda || 'COP'} />
                  <Info label="Forma de Pago" value={cab.formaPago} />
                  <Info label="Condiciones de Pago" value={cab.condicionesPago} />
                </div>
                <Divider />
                <div className="rg-grid rg-3">
                  <Info label="Centro de Costo" value={cab.centroCostoStr} />
                  <Info label="Prioridad" value={<span style={{ display: 'inline-flex' }}>{prioridadTag(cab.prioridad)}</span>} />
                </div>
              </div>
            </Fieldset>

            <Fieldset legend="Comprador y Entrega" className="cc-card">
              <div className="grid" style={{ rowGap: 8 }}>
                <Info label="Lugar de Entrega" value={cab.lugarEntrega} />
                <Divider />
                <div className="rg-grid rg-2">
                  <Info label="Comprador" value={cab.comprador} />
                  <Info label="Observaciones" value={cab.observaciones} />
                </div>
                <div className="rg-grid rg-2">
                  <Info label="Correo Solicitante" value={cab.solicitanteEmail} />
                </div>
              </div>
            </Fieldset>
          </div>

          {/* ===== Ítems ===== */}
          <div className="cc-card" style={{ marginBottom: 16 }}>
            <DataTable value={items} dataKey="idDetalle" responsiveLayout="scroll" paginator rows={10} className="dt-violet" emptyMessage="Sin ítems.">
              <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 60 }} />
              <Column field="referencia" header="Referencia" />
              <Column field="descripcion" header="Descripción" />
              <Column field="unidadMedida" header="UM" style={{ width: 90 }} />
              <Column field="cantidad" header="Cantidad" style={{ width: 110 }} body={(r: DetallePendiente) => <Right>{r.cantidad}</Right>} />
              <Column field="valorTotal" header="Valor Total" style={{ width: 180 }} body={(r: DetallePendiente) => <Right>{fmtMoney(r.valorTotal, cab.moneda)}</Right>} />
            </DataTable>
          </div>

          {/* ===== Observaciones + Requisitos / Pólizas ===== */}
          <div className="rg-grid rg-2" style={{ marginBottom: 16 }}>
            <Fieldset legend="Observaciones" className="cc-card">
              <InputTextarea value={observaciones} onChange={e => setObservaciones(e.target.value)} autoResize rows={5} className="w-full" placeholder="Observaciones…" disabled={!canEdit} />
              <div className="flex justify-end" style={{ marginTop: 10 }}>
                <Button label="Guardar" icon="pi pi-save" className="btn-excel" onClick={guardarCabecera} disabled={!canEdit} />
              </div>
            </Fieldset>

            <Fieldset legend="Requisitos" className="cc-card">
              <div className="flex gap-4 items-center" style={{ marginBottom: 8 }}>
                <div className="flex gap-2 items-center">
                  <Checkbox inputId="reqC" checked={requiereContrato} onChange={e => setReqContrato(!!e.checked)} disabled={!canEdit} />
                  <label htmlFor="reqC">Requiere Contrato</label>
                </div>
                <div className="flex gap-2 items-center">
                  <Checkbox inputId="reqP" checked={requierePoliza} onChange={e => setReqPoliza(!!e.checked)} disabled={!canEdit} />
                  <label htmlFor="reqP">Requiere Póliza</label>
                </div>
              </div>

              {requierePoliza && (
                <>
                  <Divider />
                  <div className="muted" style={{ marginBottom: 8 }}>Tipos de póliza</div>

                  <div
                    style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--surface-border)', borderRadius: 8 }}
                    onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
                  >
                    <div className="polizas-header" style={{ display: 'grid', gridTemplateColumns: '56px 1fr 140px 140px', gap: 8, padding: '10px 12px', position: 'sticky', top: 0, fontWeight: 600, zIndex: 1 }}>
                      <div>#</div><div>Tipo</div><div>Seleccionar</div><div>%</div>
                    </div>
                    {tipos.map((t, idx) => {
                      const enabled = isPolEnabled(t.id);
                      const valor = polPct(t.id);
                      return (
                        <div key={t.id}
                          style={{ display: 'grid', gridTemplateColumns: '56px 1fr 140px 140px', gap: 8, padding: '10px 12px', alignItems: 'center', borderTop: '1px solid var(--surface-border)', background: idx % 2 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                          <div>{idx + 1}</div>
                          <div style={{ lineHeight: 1.3 }}>{t.label}</div>
                          <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Checkbox inputId={`tp-${t.id}`} checked={enabled} onChange={e => togglePol(t.id, !!e.checked)} disabled={!canEdit} />
                          </div>
                          <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                            <span className="p-inputgroup">
                              <InputText style={{ width: 90 }} value={String(valor)} onChange={e => setPctFor(t.id, e.target.value)} onBlur={e => setPctFor(t.id, e.target.value)} disabled={!canEdit || !enabled} />
                              <span className="p-inputgroup-addon">%</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end" style={{ marginTop: 10 }}>
                    <Button label="Guardar pólizas/contrato" icon="pi pi-check" className="btn-excel" onClick={guardarPolizas} disabled={!canEdit} />
                  </div>
                </>
              )}
            </Fieldset>
          </div>

          {/* ===== Adjuntos + Correo ===== */}
          <div className="rg-grid rg-2">
            <Fieldset legend="Adjuntos" className="cc-card">
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <input ref={fileInp} type="file" multiple onChange={e => { void subirAdj(e.target.files); if (fileInp.current) fileInp.current.value=''; }} disabled={!canEdit} />
              </div>
              <DataTable value={adjuntos} dataKey="id" className="dt-violet" responsiveLayout="scroll" emptyMessage="Sin adjuntos.">
                <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 60 }} />
                <Column field="nombreArchivo" header="Archivo" />
                <Column field="extension" header="Ext." style={{ width: 90 }} />
                <Column field="fechaCreacion" header="Fecha" style={{ width: 180 }} />
                <Column header="" style={{ width: 120 }}
                  body={(r: AdjuntoDTO) => (
                    <Button icon="pi pi-trash" className="action-btn delete-btn" onClick={() => eliminarAdjunto(r.id)} disabled={!canEdit} />
                  )}
                />
              </DataTable>
            </Fieldset>

            <Fieldset legend="Correo a proveedor" className="cc-card">
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <Checkbox inputId="send" checked={sendMail} onChange={e => setSendMail(!!e.checked)} />
                <label htmlFor="send">Enviar correo al proveedor</label>
              </div>

              <div className="rg-grid">
                <span className="p-float-label">
                  <InputText id="to" value={to} onChange={e => setTo(e.target.value)} disabled={!sendMail} className="w-full" />
                  <label htmlFor="to">Para (to)</label>
                </span>
                <span className="p-float-label">
                  <InputText id="cc" value={cc} onChange={e => setCc(e.target.value)} disabled={!sendMail} className="w-full" />
                  <label htmlFor="cc">CC (opcional)</label>
                </span>
                <span className="p-float-label">
                  <InputText id="subj" value={subject} onChange={e => setSubject(e.target.value)} disabled={!sendMail} className="w-full" />
                  <label htmlFor="subj">Asunto</label>
                </span>
              </div>

              <Divider />
              <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-2">
                  <Checkbox inputId="allAdj" checked={attachAll} onChange={e => { setAttachAll(!!e.checked); if (e.checked) setSelAdjIds([]); }} disabled={!sendMail} />
                  <label htmlFor="allAdj">Adjuntar todos los archivos</label>
                </div>
                {!attachAll && <small className="muted">Selecciona los adjuntos a enviar</small>}
              </div>

              {!attachAll && (
                <DataTable
                  value={adjuntos}
                  dataKey="id"
                  responsiveLayout="scroll"
                  className="dt-violet"
                  emptyMessage="Sin adjuntos."
                  selection={adjuntos.filter(a => selAdjIds.includes(a.id))}
                  onSelectionChange={e => setSelAdjIds(((e.value || []) as AdjuntoDTO[]).map(r => r.id))}
                  selectionMode="multiple"
                  paginator rows={5}
                >
                  <Column selectionMode="multiple" headerStyle={{ width: 50 }} />
                  <Column header="#" body={(_, i) => i.rowIndex + 1} style={{ width: 60 }} />
                  <Column field="nombreArchivo" header="Archivo" />
                  <Column field="extension" header="Ext." style={{ width: 90 }} />
                  <Column field="fechaCreacion" header="Fecha" style={{ width: 180 }} />
                </DataTable>
              )}

              <div className="flex justify-end" style={{ marginTop: 10 }}>
                <Button icon="pi pi-send" label="Enviar" onClick={enviarCorreo} className="btn-excel" disabled={!sendMail || sending} loading={sending} />
              </div>
            </Fieldset>
          </div>

          {/* ===== Totales ===== */}
          <div className="cc-card" style={{ marginTop: 16 }}>
            <div className="rg-grid rg-5">
              <div><span className="muted">Total Bruto</span><div className="font-semibold">{fmtMoney(tot?.totalBruto, cab.moneda)}</div></div>
              <div><span className="muted">Dcto Global</span><div className="font-semibold">{fmtMoney(tot?.dctoGlobal, cab.moneda)}</div></div>
              <div><span className="muted">Subtotal</span><div className="font-semibold">{fmtMoney(tot?.subTotal, cab.moneda)}</div></div>
              <div><span className="muted">IVA</span><div className="font-semibold">{fmtMoney(tot?.valorIva, cab.moneda)}</div></div>
              <div><span className="muted">Total Neto</span><div className="font-semibold">{fmtMoney(tot?.totalNeto, cab.moneda)}</div></div>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
