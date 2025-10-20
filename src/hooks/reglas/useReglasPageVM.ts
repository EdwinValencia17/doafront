import { useEffect, useMemo, useRef, useState } from 'react';
import type { Regla, CentroDTO } from '@/services/reglasdn/types';
import {
  getCentros,
  getReglas,
  upsertRegla,
  deleteRegla,
  descargarPlantilla as svcDescargarPlantilla,
  importarExcel as svcImportarExcel,
} from '@/services/reglasdn/service';
import { useToast } from '@/ui/ToastProvider';
import type { DataTablePageEvent } from 'primereact/datatable';

type PageState = { page: number; rows: number; total: number };

export function useReglasPageVM() {
  const { show } = useToast();

  const allowMutations = true;

  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [selCentro, setSelCentro] = useState<CentroDTO | null>(null);

  const [page, setPage] = useState<PageState>({ page: 1, rows: 10, total: 0 });
  const [rows, setRows] = useState<Regla[]>([]);
  const [loading, setLoading] = useState(false);
  const [heavyLoading, setHeavyLoading] = useState(false);

  const fetchAbortRef = useRef<AbortController | null>(null);

  const selCentroLabel = selCentro ? selCentro.centroCosto : 'Todos los centros';

  // ====== Editor (modal) ======
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Regla | null>(null);

  // Cargar centros
  useEffect(() => {
    (async () => {
      try {
        const cs = await getCentros();
        setCentros(cs);
      } catch (e) {
        console.error(e);
        show({ severity: 'error', summary: 'Centros', detail: 'No se pudieron cargar centros', life: 4000 });
      }
    })();
  }, [show]);

  // Cargar reglas (paginado por centro)
  useEffect(() => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    (async () => {
      setLoading(true);
      try {
        const { rows, total } = await getReglas(selCentro?.centroCosto, {
          page: page.page,
          pageSize: page.rows,
          signal: controller.signal,
        });
        setRows((rows || []) as Regla[]);
        setPage((p) => ({ ...p, total: Number(total || rows?.length || 0) }));
      } catch (e: any) {
        if (e?.name === 'AbortError' || e?.response?.status === 304) return;
        console.error(e);
        setRows([]);
        show({
          severity: 'error',
          summary: 'Reglas',
          detail: `No se pudieron cargar reglas${selCentro ? ' de ' + selCentro.centroCosto : ''}`,
          life: 4000,
        });
      } finally {
        if (fetchAbortRef.current === controller) fetchAbortRef.current = null;
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selCentro, page.page, page.rows, show]);

  const onPage = (ev: DataTablePageEvent) => {
    const newRows = ev.rows ?? page.rows;
    const newPage = Math.floor((ev.first ?? 0) / newRows) + 1;
    setPage((p) => {
      const changedSize = p.rows !== newRows;
      return { page: changedSize ? 1 : newPage, rows: newRows, total: p.total };
    });
  };

  async function descargarPlantilla() {
    setHeavyLoading(true);
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
    } catch (e: any) {
      console.error(e);
      show({ severity: 'error', summary: 'Descargar plantilla', detail: e?.message || 'No se pudo descargar', life: 4000 });
    } finally {
      setHeavyLoading(false);
    }
  }

  async function onImport(file: File) {
    if (!allowMutations) return;
    setHeavyLoading(true);
    try {
      const count = await svcImportarExcel(file);
      await reloadAfterChange(selCentro?.centroCosto);
      show({ severity: 'success', summary: 'Importación completada', detail: `Importadas ${count} filas`, life: 4000 });
    } catch (e: any) {
      console.error(e);
      show({ severity: 'error', summary: 'Importar Excel', detail: e?.response?.data?.error || e?.message || 'No se pudo importar', life: 5000 });
    } finally {
      setHeavyLoading(false);
    }
  }

  async function reloadAfterChange(targetCentro?: string | null) {
    setLoading(true);
    try {
      const { rows, total } = await getReglas(targetCentro ?? selCentro?.centroCosto, {
        page: page.page,
        pageSize: page.rows,
      });
      setRows((rows || []) as Regla[]);
      setPage((p) => ({ ...p, total: Number(total || rows?.length || 0) }));
    } finally {
      setLoading(false);
    }
  }

  // ====== Acciones editor ======
  function openNew() {
    if (!allowMutations || !selCentro) {
      show({ severity: 'info', summary: 'Selecciona centro', detail: 'Elige un centro de costo primero', life: 2500 });
      return;
    }
    setEditing({
      id: '',
      reglaNegocio: 'INDIRECT',
      centroCosto: selCentro.centroCosto,
      compania: selCentro.compania,
      montoMax: 0,
      aprobadores: [],
      vigente: true,
      updatedAt: new Date().toISOString(),
      __min: 0,
      categoria: '',
      ccNivel: '',
    } as Regla);
    setShowEditor(true);
  }

  function onEdit(r: Regla) {
    if (!allowMutations) return;
    setEditing(r);
    setShowEditor(true);
  }

  async function onSaveEditor(payload: Partial<Regla>) {
    setHeavyLoading(true);
    try {
      await upsertRegla(payload);
      setShowEditor(false);
      setEditing(null);
      await reloadAfterChange(selCentro?.centroCosto || null);
      show({ severity: 'success', summary: 'Regla', detail: 'Guardada correctamente', life: 2500 });
    } catch (e: any) {
      console.error(e);
      show({ severity: 'error', summary: 'Guardar', detail: e?.response?.data?.error || e?.message || 'No se pudo guardar', life: 5000 });
    } finally {
      setHeavyLoading(false);
    }
  }

  async function onDelete(r: Regla) {
    if (!allowMutations) return;
    const ok = confirm('¿Eliminar la regla seleccionada?');
    if (!ok) return;
    setHeavyLoading(true);
    try {
      await deleteRegla(r.id);
      await reloadAfterChange(selCentro?.centroCosto || null);
      show({ severity: 'success', summary: 'Regla', detail: 'Eliminada', life: 2200 });
    } catch (e: any) {
      console.error(e);
      show({ severity: 'error', summary: 'Eliminar', detail: e?.response?.data?.error || e?.message || 'No se pudo eliminar', life: 5000 });
    } finally {
      setHeavyLoading(false);
    }
  }

  const tableProps = useMemo(
    () => ({ rows, loading, page, onPage, onEdit, onDelete, allowMutations }),
    [rows, loading, page, allowMutations]
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

    // tabla
    tableProps,

    // editor
    showEditor,
    setShowEditor,
    editing,
    onSaveEditor,
  };
}
