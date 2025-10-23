// src/components/reglas/CentroSelectorDrawer.tsx
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CentroDTO } from "@/services/reglasdn/types";

export function CentroSelectorDrawer({
  centros,
  selCentro,
  setSelCentro,
  onDescargar,
  onImportar,
  loading,
  allowMutations,
}: {
  centros: CentroDTO[];
  selCentro: CentroDTO | null;
  setSelCentro: (c: CentroDTO | null) => void;
  onDescargar: () => Promise<void> | void;
  onImportar: (f: File) => Promise<void> | void;
  loading: boolean;
  allowMutations: boolean;
}) {
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 👇 espejo local para evitar parpadeo cuando "centros" se vacía temporalmente
  const [centrosView, setCentrosView] = useState<CentroDTO[]>(centros);

  useEffect(() => {
    if (Array.isArray(centros) && centros.length > 0) {
      setCentrosView(centros);
    }
    // si llega [], NO vaciamos la vista -> evita que "se quiten"
  }, [centros]);

  // si quieres forzar "Todos los centros" apenas entra el componente:
  // useEffect(() => { setSelCentro(null); }, [setSelCentro]);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    const source = centrosView; // usamos la vista estable
    if (!t) return source;
    return source.filter(
      (c) =>
        c.centroCosto.toLowerCase().includes(t) ||
        (c.compania || "").toLowerCase().includes(t)
    );
  }, [q, centrosView]);

  const handleScroll = () => {
    setScrolling(true);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    // quita el “highlight scroll” 180 ms después de parar
    scrollTimer.current = setTimeout(() => setScrolling(false), 180);
  };

  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  return (
    <div className="centros-drawer">
      {/* header sticky */}
      <div className="cd-header">
        <h2 className="cd-title">Centros de Costo</h2>
        <span className="cd-subtitle" style={{ opacity: 0.7 }}>
          Selecciona para filtrar reglas
        </span>

        <span className="p-input-icon-left cd-search">
          <InputText
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar centro/compañía…"
            className="w-full"
          />
        </span>
      </div>

      {/* body que scrollea */}
      <div
        className={`cd-body ${scrolling ? "is-scrolling" : ""}`}
        onScroll={handleScroll}
      >
        <Button
          label="Todos los centros"
          className={`cc-btn cc-btn--xl p-button-outlined w-full ${
            !selCentro ? "is-active" : ""
          }`}
          onClick={() => setSelCentro(null)}
        />

        {filtrados.map((c) => (
          <Button
            key={`${c.centroCosto}|${c.compania ?? ""}`}
            label={`${c.centroCosto}${c.compania ? " — " + c.compania : ""}`}
            className={`cc-btn cc-btn--xl p-button-outlined w-full ${
              selCentro?.centroCosto === c.centroCosto ? "is-active" : ""
            }`}
            onClick={() => setSelCentro(c)}
          />
        ))}
      </div>

      {/* footer sticky */}
      <div className="cd-footer">
        <Button
          icon="pi pi-download"
          label="Plantilla Excel"
          className="w-full p-button-rounded"
          onClick={() => onDescargar()}
          disabled={loading}
        />
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportar(f);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <Button
          icon="pi pi-upload"
          label="Importar Excel"
          className="w-full p-button-rounded p-button-secondary"
          onClick={() => fileRef.current?.click()}
          disabled={loading || !allowMutations}
        />
      </div>
    </div>
  );
}
