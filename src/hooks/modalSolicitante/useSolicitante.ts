import { useEffect, useState } from 'react';
import { type OCFuente, type OCRow, type FlujoRow, AutorizacionesRepo,CabeceraRepo } from '@/services/solicitante';

import { mapDetalle,mapCabeceraFromRow, mapCabeceraFromCab, } from '@/features/modalsolicitante/oc.mappers';
import { computeTotales, estadoGeneralFromFlujo } from '@/features/modalsolicitante/oc.domain';
import { CabeceraUI, DetalleUI, TotalesUI } from '@/features/modalsolicitante/oc.types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useOC(idCab?: number, fuente: OCFuente = 'ACTIVA', row?: OCRow | null) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [cab, setCab] = useState<CabeceraUI | null>(null);
  const [items, setItems] = useState<DetalleUI[]>([]);
  const [tot, setTot] = useState<TotalesUI | null>(null);
  const [flujo, setFlujo] = useState<FlujoRow[]>([]);
  const [estadoGeneral, setEstadoGeneral] = useState<string>('INICIADA');

  useEffect(() => {
    if (!idCab) return;
    const ctrl = new AbortController();
    (async () => {
      setStatus('loading');
      setError(null);
      try {
        // Cabecera core
        const cabCore = await CabeceraRepo.getCabecera(idCab);
        const baseFromRow = mapCabeceraFromRow(row) || {};
        const cabUI = { ...baseFromRow, ...mapCabeceraFromCab(cabCore) };

        // Detalle + Flujo
        const [detalle, flujoRows] = await Promise.all([
          AutorizacionesRepo.getDetalle(fuente, idCab),
          AutorizacionesRepo.getFlujo(fuente, idCab),
        ]);

        const detMap = mapDetalle(detalle || []);
        const totales = computeTotales(detMap);
        const estGen = estadoGeneralFromFlujo(flujoRows || []);
        const flujoNorm = (flujoRows || []).map((r, i) => ({ ...r, id: r.id ?? i }));

        setCab({ ...cabUI, estadoGeneral: estGen });
        setItems(detMap);
        setTot(totales);
        setFlujo(flujoNorm);
        setEstadoGeneral(estGen);
        setStatus('success');
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setStatus('error');
      }
    })();
    return () => ctrl.abort();
  }, [idCab, fuente]); // ← incluye fuente

  return { status, error, cab, items, tot, flujo, estadoGeneral };
}
