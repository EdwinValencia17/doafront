// src/pages/SolicitanteExternoPage.tsx
import { useMemo, useRef, useState, useCallback, useContext } from 'react';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { useNavigate } from 'react-router-dom';

import { SolicitanteTable } from '@/components/solicitante/SolicitanteTable';
import { SolicitanteFilters } from '@/components/solicitante/SolicitanteFilters';
import { BrandLogo } from '@/components/layout/BrandLogo';

import ModalSolicitanteExterno from '@/Modales/SolcitanteExterno/ModalSolicitanteExterno';
import {
  AutorizacionesRepo,
  type OCRow,
  type OCFuente,
} from '@/services/solicitante';

import { useSolicitanteOC } from '@/hooks/solicitanteExterno/useSolicitanteOC';
import { ToastCtx } from '@/features/toast/ToastCtx'; // ✅ tu provider global

export default function SolicitanteExternoPage() {
  const toastRef = useRef<Toast | null>(null);
  const appToast = useContext(ToastCtx);     // ✅ global
  const nav = useNavigate();

  const {
    rows, loading, page, filters,
    setFilters, onPage, onSort,
    estados, cecos, companias, prioridades, combosLoading,
    applyFilters, clearFilters,
  } = useSolicitanteOC(toastRef);

  const [visibleFilters, setVisibleFilters] = useState(false);

  // MODAL
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<OCRow | null>(null);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [selectedFuente, setSelectedFuente] = useState<OCFuente>('ACTIVA');

  // 🛡️ Guard: no abrimos si no hay datos
  const onView = useCallback(async (r: OCRow) => {
    const id = r?.id_cabecera ?? 0;
    const fuente = (r?.fuente || 'ACTIVA') as OCFuente;

    if (!id) {
      appToast?.show?.({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No se encontró el identificador de la Orden de Compra.',
      });
      return;
    }

    try {
      const rowsDet = await AutorizacionesRepo.getDetalle(fuente, id); // ← tu API real
      if (!Array.isArray(rowsDet) || rowsDet.length === 0) {
        appToast?.show?.({
          severity: 'warn',
          summary: 'Sin datos',
          detail: `La Orden de Compra ${r.numero_oc ?? id} no tiene datos que mostrar.`,
        });
        return; // ⛔ no abrimos
      }

      // ✅ sí hay datos → ahora sí abrimos
      setSelectedRow(r);
      setSelectedId(id);
      setSelectedFuente(fuente);
      setVisibleModal(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No fue posible obtener el detalle.';
      appToast?.show?.({ severity: 'error', summary: 'Error', detail: msg });
    }
  }, [appToast]);

  // Índice de CECOS para la tabla
  const cecoIndex = useMemo(() => {
    const acc: Record<number, { codigo: string; descripcion: string }> = {};
    for (const c of cecos) {
      if (typeof c.id_ceco === 'number') {
        acc[c.id_ceco] = { codigo: String(c.codigo), descripcion: String(c.descripcion) };
      }
    }
    return acc;
  }, [cecos]);

  return (
    <div className="pg-bandeja config-shell">
      <main className="cc-main">
        <div className="cc-card">
          <SolicitanteTable
            rows={rows}
            loading={loading}
            page={page}
            onPage={onPage}
            onSort={onSort}
            onView={onView}  // ← usa guard
            onOpenFilters={() => setVisibleFilters(true)}
            onBackToLogin={() => nav('/login')}
            cecoIndex={cecoIndex}
          />
        </div>
      </main>

      <Sidebar
        id="filters-sidebar-left"
        visible={visibleFilters}
        position="left"
        onHide={() => setVisibleFilters(false)}
        modal blockScroll showCloseIcon dismissable
        style={{ width: '380px', maxWidth: '92vw' }}
        pt={{ content: { className: 'cc-aside-shell' } }}
        header={(
          <div className="flex align-items-center gap-2">
            <span className="cc-logo-box">
              <span className="cc-logo-visual cc-logo-grow">
                <BrandLogo height={28} />
              </span>
            </span>
            <span className="font-bold">FILTROS</span>
          </div>
        )}
      >
        <div style={{ padding: 10 }}>
          <SolicitanteFilters
            value={filters}
            onChange={setFilters}
            onApply={() => { applyFilters(); setVisibleFilters(false); }}
            onClear={() => { clearFilters(); /* setVisibleFilters(false) si quieres */ }}
            combos={{ estados, cecos, companias, prioridades, loading: combosLoading }}
          />
        </div>
      </Sidebar>

      <ModalSolicitanteExterno
        visible={visibleModal}
        onHide={() => setVisibleModal(false)}
        row={selectedRow}
        idCabecera={selectedId}
        fuente={selectedFuente}
      />

      <Toast ref={toastRef} />
    </div>
  );
}
