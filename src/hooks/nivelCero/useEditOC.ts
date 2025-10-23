import { useCallback, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useToast } from '@/hooks/toast/useToast';
import { EditService } from '@/services/nivelcero/niveleroeditar/edit.service';
import type {
  AdjuntoDTO, CabeceraPendiente, DetallePendiente, TipoPoliza, Totales
} from '@/services/nivelcero/niveleroeditar/edit.types';

export type UseEditOCOpts = {
  ocId: number | null;
  open: boolean;
  onAfterAction?: () => void;
};

const isEmail = (s: string) => !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** Si la llamada con ocId devuelve 404, reintenta usando numeroOrden (si existe y es distinto) */
async function withAdjId<T>(
  ocId: number,
  numeroOrden?: string | null,
  call: (idParaAdjuntos: number) => Promise<T>
): Promise<T> {
  try {
    return await call(ocId);
  } catch (e: any) {
    const is404 = e?.response?.status === 404 || e?.status === 404;
    const alt = Number(numeroOrden);
    const puedeReintentar = is404 && numeroOrden && !Number.isNaN(alt) && alt !== ocId;
    if (!puedeReintentar) throw e;
    // reintento con numeroOrden
    return await call(alt);
  }
}

export function useEditOC({ ocId, open, onAfterAction }: UseEditOCOpts) {
  const primeToastRef = useRef<Toast | null>(null);
  const appToast = useToast();
  const toast = (o: any) => primeToastRef.current?.show(o) || appToast.show(o);

  // estado base
  const [busy, setBusy] = useState(false);
  const [cab, setCab] = useState<CabeceraPendiente | null>(null);
  const [items, setItems] = useState<DetallePendiente[]>([]);
  const [tot, setTot] = useState<Totales | null>(null);

  // permisos
  const [canEdit, setCanEdit] = useState(true);
  const [editReason, setEditReason] = useState<string | null>(null);

  // cabecera
  const [observaciones, setObservaciones] = useState('');

  // pólizas
  const [requiereContrato, setReqContrato] = useState(false);
  const [requierePoliza, setReqPoliza] = useState(false);
  const [tipos, setTipos] = useState<TipoPoliza[]>([]);
  const [polSel, setPolSel] = useState<Array<{ tipoId: number; porcentaje: number }>>([]);

  // adjuntos + correo
  const [adjuntos, setAdjuntos] = useState<AdjuntoDTO[]>([]);
  const [sendMail, setSendMail] = useState(true);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('Orden de Compra');
  const [attachAll, setAttachAll] = useState(true);
  const [selAdjIds, setSelAdjIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  /* =================== LOAD =================== */
  const load = useCallback(async () => {
    if (!open || !ocId) return;
    setBusy(true);
    try {
      // 1) Carga principal
      const { cabecera, detalle, totales } = await EditService.getFull(ocId);
      setCab(cabecera);
      setItems(detalle ?? []);
      setTot(totales ?? null);

      // 2) Permisos
      try {
        const pe = await EditService.puedeEditar(ocId);
        const permitido = !!(pe as any)?.permitido;
        setCanEdit(permitido);
        setEditReason(
          permitido
            ? null
            : (pe as any)?.iniciada
            ? 'La orden ya fue iniciada en el flujo.'
            : !(pe as any)?.tieneCentroCosto
            ? 'La orden no tiene centro de costo.'
            : 'Edición no permitida.'
        );
      } catch {
        setCanEdit(false);
        setEditReason('No se pudo validar permisos de edición.');
      }

      // 3) Cabecera
      setObservaciones(cabecera.observaciones || '');
      setReqContrato(cabecera.requiereContrato === 'S');
      setReqPoliza(cabecera.requierePoliza === 'S');

      // 4) Catálogo de pólizas (tolerante)
      let tiposP: any[] = [];
      try {
        tiposP = await EditService.getTiposPoliza();
      } catch (e: any) {
        if (e?.response?.status !== 404) {
          // si no es 404, puedes mostrar warn si quieres
          // toast({ severity: 'warn', summary: 'Pólizas', detail: e?.message || 'No fue posible cargar tipos de póliza' });
        }
        tiposP = [];
      }
      setTipos(
        (tiposP || []).map((t) => ({
          ...t,
          id: Number(t.id),
          porcentaje: Number((t as any).porcentaje ?? (t as any).porcentajeDef ?? 0),
        }))
      );
      setPolSel([]);

      // 5) Adjuntos (con fallback por 404 usando numeroOrden)
      try {
        const adjs = await withAdjId(ocId, cabecera.numeroOrden, (id) =>
          EditService.listarAdjuntos(id)
        );
        setAdjuntos(adjs);
      } catch (e: any) {
        // Si algo distinto a 404 o doble fallo
        // deja vacío y avisa suave
        // (no bloqueamos el modal)
        // console.warn(e);
        setAdjuntos([]);
        // toast({ severity: 'info', summary: 'Adjuntos', detail: 'No hay adjuntos disponibles.' });
      }

      // 6) Correo
      setTo(cabecera.proveedorEmail || '');
      setSubject(`Orden de Compra ${cabecera.numeroOrden || ''}`.trim());
      setAttachAll(true);
      setSelAdjIds([]);
    } catch (e: any) {
      toast({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo cargar' });
    } finally {
      setBusy(false);
    }
  }, [open, ocId]);

  useEffect(() => { load(); }, [load]);

  /* =================== PÓLIZAS =================== */
  const isPolEnabled = useCallback((tipoId: number) => polSel.some(p => p.tipoId === tipoId), [polSel]);
  const polPct = useCallback((tipoId: number) => polSel.find(p => p.tipoId === tipoId)?.porcentaje ?? 0, [polSel]);

  const togglePol = (tipoId: number, checked: boolean) => {
    setPolSel(prev => {
      const rest = prev.filter(p => p.tipoId !== tipoId);
      if (!checked) return rest;
      const def = Number(tipos.find(t => t.id === tipoId)?.porcentaje || 0);
      const pct = Math.max(0, Math.min(100, def));
      return [...rest, { tipoId, porcentaje: pct }];
    });
  };

  const setPctFor = (tipoId: number, v: number | string) => {
    const n = Math.max(0, Math.min(100, Number(v) || 0));
    setPolSel(prev => prev.map(p => (p.tipoId === tipoId ? { ...p, porcentaje: n } : p)));
  };

  /* =================== ACTIONS =================== */
  const guardarCabecera = async () => {
    if (!ocId) return;
    if (!canEdit) return toast({ severity: 'warn', summary: 'No editable', detail: editReason || 'Edición no permitida.' });
    try {
      await EditService.actualizarCabecera(ocId, { observaciones: observaciones || undefined });
      toast({ severity: 'success', summary: 'OK', detail: 'Cabecera actualizada.' });
      onAfterAction?.();
    } catch (e: any) {
      toast({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo guardar' });
    }
  };

  const guardarPolizas = async () => {
    if (!ocId) return;
    if (!canEdit) return toast({ severity: 'warn', summary: 'No editable', detail: editReason || 'Edición no permitida.' });
    try {
      await EditService.guardarPolizaSeleccion(ocId, {
        requierePoliza,
        requiereContrato,
        tipos: polSel.map(p => ({ tipoId: p.tipoId, porcentaje: p.porcentaje })),
      });
      toast({ severity: 'success', summary: 'OK', detail: 'Pólizas/contrato guardados.' });
    } catch (e: any) {
      toast({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo guardar pólizas' });
    }
  };

  const subirAdj = async (files: FileList | null) => {
    if (!files || !ocId) return;
    if (!canEdit) return toast({ severity: 'warn', summary: 'No editable', detail: editReason || 'Edición no permitida.' });
    try {
      await withAdjId(ocId, cab?.numeroOrden, (id) =>
        EditService.subirAdjuntos(id, Array.from(files))
      );
      const nuevos = await withAdjId(ocId, cab?.numeroOrden, (id) =>
        EditService.listarAdjuntos(id)
      );
      setAdjuntos(nuevos);
      toast({ severity: 'success', summary: 'OK', detail: 'Adjuntos cargados.' });
    } catch (e: any) {
      toast({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo subir' });
    }
  };

  const eliminarAdjunto = async (idAdj: number) => {
    if (!ocId) return;
    if (!canEdit) return toast({ severity: 'warn', summary: 'No editable', detail: editReason || 'Edición no permitida.' });
    try {
      await withAdjId(ocId, cab?.numeroOrden, (id) =>
        EditService.eliminarAdjunto(id, idAdj)
      );
      const lista = await withAdjId(ocId, cab?.numeroOrden, (id) =>
        EditService.listarAdjuntos(id)
      );
      setAdjuntos(lista);
    } catch (e: any) {
      toast({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo eliminar' });
    }
  };

  const enviarCorreo = async () => {
    if (!ocId || !sendMail) return;
    const toOk = (to || '').split(/[;,]+/).map(x => x.trim()).filter(Boolean);
    if (!toOk.length || !isEmail(toOk[0])) {
      return toast({ severity: 'warn', summary: 'Validación', detail: "Ingresa un correo válido en 'Para'." });
    }
    try {
      setSending(true);
      await withAdjId(ocId, cab?.numeroOrden, (id) =>
        EditService.enviarCorreoProveedor(id, {
          to, cc: cc || undefined, subject: subject || undefined,
          attachAll, adjIds: attachAll ? undefined : selAdjIds,
        })
      );
      toast({ severity: 'success', summary: 'OK', detail: 'Correo enviado al proveedor.' });
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'No se pudo enviar';
      toast({ severity: 'error', summary: 'Error', detail: msg });
    } finally {
      setSending(false);
    }
  };

  /* =================== EXPOSE =================== */
  return {
    // refs
    primeToastRef,
    // flags
    busy, canEdit, editReason,
    // data
    cab, items, tot,
    // cabecera
    observaciones, setObservaciones, guardarCabecera,
    // polizas
    requiereContrato, setReqContrato, requierePoliza, setReqPoliza,
    tipos, polSel, isPolEnabled, polPct, togglePol, setPctFor, guardarPolizas,
    // adjuntos + correo
    adjuntos, subirAdj, eliminarAdjunto,
    sendMail, setSendMail, to, setTo, cc, setCc, subject, setSubject,
    attachAll, setAttachAll, selAdjIds, setSelAdjIds, enviarCorreo, sending,
  };
}
