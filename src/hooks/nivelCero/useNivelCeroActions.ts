// src/hooks/nivelcero/useNivelCeroActions.ts
import { useRef, useState } from 'react';
import type { Toast } from 'primereact/toast';
import { OrdersService, WorkflowService } from '@/services/nivelcero';
import type { BandejaRow as OrdenRow } from '@/services/nivelcero/types';

export function useNivelCeroActions(toastRef: React.RefObject<Toast>, currentUserId: string) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [homologDialog, setHomologDialog] = useState<{ open: boolean; refs: string[]; ids: number[] }>({ open: false, refs: [], ids: [] });

  const openVer = useRef<(id: number) => void>();
  const openEditar = useRef<(id: number) => void>();

  const setOpenVer = (fn: (id: number) => void) => { openVer.current = fn; };
  const setOpenEditar = (fn: (id: number) => void) => { openEditar.current = fn; };

  const editarOrFallbackVer = async (r: OrdenRow) => {
    try {
      const pe = (await OrdersService.puedeEditar(r.id)) as any;
      if (pe?.permitido) {
        openEditar.current?.(r.id);
      } else {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'No editable',
          detail: pe?.iniciada ? 'La orden ya fue iniciada en el flujo.' :
                 !pe?.tieneCentroCosto ? 'La orden no tiene centro de costo.' : 'No se puede editar.',
        });
        openVer.current?.(r.id);
      }
    } catch (e: any) {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo validar' });
    }
  };

  const iniciar = async (rows: OrdenRow[], refresh: () => Promise<void>) => {
    if (!rows.length) {
      toastRef.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Selecciona al menos una orden.' });
      return;
    }
    const ids = rows.map(r => r.id);
    try {
      const res = await WorkflowService.iniciar(ids, currentUserId, { validar: true, persist: true });

      const movidas = Array.isArray(res?.movidas) ? res.movidas : [];
      const flujos = Array.isArray(res?.flujos) ? res.flujos : [];
      const errores = Array.isArray(res?.errores) ? res.errores : [];

      if (movidas.length) {
        const ej = movidas.slice(0, 3).map((m: any) => `#${m.idPendiente}→CO:${m.idCabecera}${m.numeroOrden ? ` (${m.numeroOrden})` : ''}`).join(' | ');
        toastRef.current?.show({ severity: 'success', summary: 'Órdenes iniciadas', detail: movidas.length > 3 ? `${ej} … (+${movidas.length - 3} más)` : ej });
      } else {
        toastRef.current?.show({ severity: 'warn', summary: 'Nada iniciado', detail: 'No se movió ninguna orden a cabecera.' });
      }

      const okFlujos = flujos.filter((f: any) => !f.error && (Array.isArray(f.aprobadores) || Array.isArray((f as any).pasos)));
      if (flujos.length) {
        toastRef.current?.show({
          severity: okFlujos.length ? 'info' : 'warn',
          summary: 'Reglas de aprobación',
          detail: okFlujos.length ? `Se generaron rutas (${okFlujos.length}/${flujos.length}).` : 'No se generaron rutas.',
        });
      }

      if (errores.length) {
        const ejErr = errores.slice(0, 3).map((e: any) => `#${e.id}: ${e.error}`).join(' | ');
        toastRef.current?.show({ severity: 'error', summary: 'Órdenes con error', detail: errores.length > 3 ? `${ejErr} … (+${errores.length - 3} más)` : ejErr });
      }

      await refresh();
    } catch (e: any) {
      const status = e?.response?.status;
      const refs = e?.response?.data?.referencias as string[] | undefined;
      if (status === 409 && refs?.length) {
        setHomologDialog({ open: true, refs, ids });
        toastRef.current?.show({ severity: 'warn', summary: 'Homologación requerida', detail: `Faltan homologar ${refs.length} referencia(s).` });
        return;
      }
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: e?.response?.data?.error || e?.message || 'No se pudo iniciar' });
    }
  };

  const pedirCancelar = (row: OrdenRow) => setPendingId(row.id);
  const cerrarCancelar = () => setPendingId(null);

  const confirmarCancelar = async (numero: string | null, refresh: () => Promise<void>) => {
    if (!pendingId) return;
    try {
      await OrdersService.cancelar(pendingId, currentUserId);
      toastRef.current?.show({ severity: 'success', summary: 'Eliminada', detail: `OC ${numero || pendingId} cancelada.` });
      setPendingId(null);
      await refresh();
    } catch (e: any) {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo eliminar' });
    }
  };

  return {
    // setters para que la page conecte con sus modales
    setOpenVer, setOpenEditar,

    // acciones
    editarOrFallbackVer,
    iniciar,
    pedirCancelar, cerrarCancelar, confirmarCancelar,

    // estado de diálogos ajenos (homologación / cancelar)
    homologDialog, setHomologDialog,
    pendingId,
  };
}
