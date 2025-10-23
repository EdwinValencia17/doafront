// src/hooks/reglas/useReglasPageVM.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Regla, CentroDTO } from '@/services/reglasdn/types';
import {
  getCentros,
  getReglas,
  upsertRegla,
  deleteRegla,
  descargarPlantilla as svcDescargarPlantilla,
  importarExcel as svcImportarExcel,
} from '@/services/reglasdn/service';
import { useToast } from '@/hooks/toast/useToast';
import type { DataTablePageEvent } from 'primereact/datatable';
import { useLoader } from '@/context/loader';
import { isAbortError, getHttpStatus, getErrorMessage, getBackendError } from '@/features/errors';

type PageState = { page: number; rows: number; total: number };

export function useReglasPageVM() {
  const { show: showLoader, hide: hideLoader, setProgress } = useLoader();
  const { show } = useToast();

  const allowMutations = true;

  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [selCentro, setSelCentro] = useState<CentroDTO | null>(null); // null = "Todos los centros"

  const [page, setPage] = useState<PageState>({ page: 1, rows: 10, total: 0 });
  const [rows, setRows] = useState<Regla[]>([]);
  const [loading, setLoading] = useState(false);
  const [heavyLoading, setHeavyLoading] = useState(false);

  const fetchAbortRef = useRef<AbortController | null>(null);
  const lastGoodRef = useRef<{ rows: Regla[]; total: number }>({ rows: [], total: 0 });

  const selCentroLabel = selCentro ? selCentro.centroCosto : 'Todos los centros';

  // ====== Editor (modal) ======
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Regla | null>(null);

  // Cargar centros (por defecto no selecciona ninguno ⇒ "Todos")
  useEffect(() => {
    (async () => {
      try {
        showLoader();
        const cs = await getCentros();
        setCentros(cs);
      } catch {
        console.error('Error cargando centros');
        show({ severity: 'error', summary: 'Centros', detail: 'No se pudieron cargar centros', life: 4000 });
      } finally {
        hideLoader();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función estable para recargar con la paginación actual (y refrescar lastGoodRef)
const reloadAfterChange = useCallback(async (targetCentro?: string | null) => {
  setLoading(true);
  showLoader();
  try {
    const res = await getReglas(targetCentro ?? selCentro?.centroCosto, {
      page: page.page,
      pageSize: page.rows,
    });

    // Si el backend/HTTP indica que no cambió o fue cancelado, conservamos último bueno
    if (res?.canceled || res?.noModificado) {
      setRows(lastGoodRef.current.rows);
      setPage((p) => ({ ...p, total: lastGoodRef.current.total }));
      return;
    }

    const safeRows: Regla[] = Array.isArray(res?.rows) ? (res!.rows as Regla[]) : [];

    // Total robusto: prioriza el 'total' del back; si no viene válido, usa el largo del slice
    const safeTotal = Math.max(
      Number.isFinite(res?.total as number) ? Number(res!.total) : 0,
      safeRows.length
    );

    setRows(safeRows);
    setPage((p) => ({ ...p, total: safeTotal }));

    // Snapshot del último resultado bueno (anti-flicker)
    lastGoodRef.current = { rows: safeRows, total: safeTotal };
  } catch {
    // En errores, conserva lo último válido en pantalla
    setRows(lastGoodRef.current.rows);
    setPage((p) => ({ ...p, total: lastGoodRef.current.total }));
  } finally {
    setLoading(false);
    hideLoader();
  }
}, [page.page, page.rows, selCentro?.centroCosto, showLoader, hideLoader]);


  // Cargar reglas (paginado por centro). selCentro = null ⇒ trae todo.
  useEffect(() => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    (async () => {
      setLoading(true);
      showLoader();
      try {
        const res = await getReglas(selCentro?.centroCosto, {
          page: page.page,
          pageSize: page.rows,
          signal: controller.signal,
        });

        if (res?.canceled || res?.noModificado) {
          setRows(lastGoodRef.current.rows);
          setPage((p) => ({ ...p, total: lastGoodRef.current.total }));
          return;
        }

        const safeRows: Regla[] = Array.isArray(res?.rows) ? (res!.rows as Regla[]) : [];
        const safeTotal = Number(
          typeof res?.total === 'number' && res.total >= 0 ? res.total : safeRows.length
        );

        setRows(safeRows);
        setPage((p) => ({ ...p, total: safeTotal }));
        lastGoodRef.current = { rows: safeRows, total: safeTotal };
      } catch (e: unknown) {
        if (isAbortError(e) || getHttpStatus(e) === 304) return;

        console.error(e);
        show({
          severity: 'error',
          summary: 'Reglas',
          detail: `No se pudieron cargar reglas${selCentro ? ' de ' + selCentro.centroCosto : ''}`,
          life: 4000,
        });

        // Mantén lo último válido en pantalla
        setRows(lastGoodRef.current.rows);
        setPage((p) => ({ ...p, total: lastGoodRef.current.total }));
      } finally {
        if (fetchAbortRef.current === controller) fetchAbortRef.current = null;
        setLoading(false);
        hideLoader();
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selCentro, page.page, page.rows]);

  // ====== Handlers MEMOIZADOS ======
  const onPage = useCallback((ev: DataTablePageEvent) => {
    setPage((prev) => {
      const newRows = ev.rows ?? prev.rows;
      const newPage = Math.floor((ev.first ?? 0) / newRows) + 1;
      const changedSize = prev.rows !== newRows;
      return { page: changedSize ? 1 : newPage, rows: newRows, total: prev.total };
    });
  }, []);

  const onEdit = useCallback((r: Regla) => {
    if (!allowMutations) return;
    setEditing(r);
    setShowEditor(true);
  }, [allowMutations]);

  const onDelete = useCallback(async (r: Regla) => {
    if (!allowMutations) return;
    const ok = confirm('¿Eliminar la regla seleccionada?');
    if (!ok) return;
    setHeavyLoading(true);
    showLoader();
    try {
      await deleteRegla(r.id);
      await reloadAfterChange(selCentro?.centroCosto || null);
      show({ severity: 'success', summary: 'Regla', detail: 'Eliminada', life: 2200 });
    } catch (e: unknown) {
      console.error(e);
      const detail = getBackendError(e) ?? getErrorMessage(e, 'No se pudo eliminar');
      show({ severity: 'error', summary: 'Eliminar', detail, life: 5000 });
    } finally {
      setHeavyLoading(false);
      hideLoader();
    }
  }, [allowMutations, selCentro?.centroCosto, show, showLoader, hideLoader, reloadAfterChange]);

  // ====== Acciones ======
  const descargarPlantilla = useCallback(async () => {
    setHeavyLoading(true);
    showLoader();
    try {
      const { blob, filename } = await svcDescargarPlantilla();
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = filename || 'plantilla_reglas.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      console.error('Error descargando plantilla');
      show({
        severity: 'error',
        summary: 'Descargar plantilla',
        detail: 'No se pudo descargar',
        life: 4000,
      });
    } finally {
      setHeavyLoading(false);
      hideLoader();
    }
  }, [show, showLoader, hideLoader]);

  const onImport = useCallback(async (file: File) => {
    if (!allowMutations) return;
    setHeavyLoading(true);
    showLoader();
    setProgress(5);
    try {
      const count = await svcImportarExcel(file);
      setProgress(65);
      await reloadAfterChange(selCentro?.centroCosto);
      setProgress(100);
      show({ severity: 'success', summary: 'Importación completada', detail: `Importadas ${count} filas`, life: 4000 });
    } catch (e: unknown) {
      console.error(e);
      const detail = getBackendError(e) ?? getErrorMessage(e, 'No se pudo importar');
      show({ severity: 'error', summary: 'Importar Excel', detail, life: 5000 });
    } finally {
      setProgress(undefined);
      setHeavyLoading(false);
      hideLoader();
    }
  }, [allowMutations, reloadAfterChange, selCentro?.centroCosto, show, setProgress, showLoader, hideLoader]);

   const openNew = useCallback(() => {
    if (!allowMutations) return;

    // Prefill con el centro seleccionado si existe; si no, vacío.
    const centro = selCentro?.centroCosto ?? '';
    const compania = selCentro?.compania ?? '';

    setEditing({
      id: '',
      reglaNegocio: 'INDIRECT',
      centroCosto: centro,        
      compania,                  
      montoMax: 0,
      aprobadores: [],
      vigente: true,
      updatedAt: new Date().toISOString(),
      __min: 0,
      categoria: '',
      ccNivel: '',
    } as Regla);

    setShowEditor(true);
  }, [allowMutations, selCentro]);

  const onSaveEditor = useCallback(async (payload: Partial<Regla>) => {
    setHeavyLoading(true);
    showLoader();
    try {
      await upsertRegla(payload);
      setShowEditor(false);
      setEditing(null);
      await reloadAfterChange(selCentro?.centroCosto || null);
      show({ severity: 'success', summary: 'Regla', detail: 'Guardada correctamente', life: 2500 });
    } catch (e: unknown) {
      console.error(e);
      const detail = getBackendError(e) ?? getErrorMessage(e, 'No se pudo guardar');
      show({ severity: 'error', summary: 'Guardar', detail, life: 5000 });
    } finally {
      setHeavyLoading(false);
      hideLoader();
    }
  }, [reloadAfterChange, selCentro?.centroCosto, show, showLoader, hideLoader]);

  // ====== Props de tabla: paginación lista para PrimeReact ======
  const tableProps = useMemo(
    () => ({
      rows,
      loading,
      page,
      first: (page.page - 1) * page.rows,
      onPage, onEdit, onDelete,
      allowMutations,
    }),
    [rows, loading, page, onPage, onEdit, onDelete, allowMutations]
  );

  return {
    // estado público
    centros,
    selCentro,
    setSelCentro,
    selCentroLabel,
    heavyLoading,
    allowMutations,

    // acciones
    descargarPlantilla,
    onImport,
    openNew,

    // tabla (paginado)
    tableProps,

    // editor
    showEditor,
    setShowEditor,
    editing,
    onSaveEditor,
  };
}
