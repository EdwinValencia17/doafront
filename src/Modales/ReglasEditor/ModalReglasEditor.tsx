import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import type { Regla, Aprobador } from "@/services/reglasdn/types";
import { getCatalogos, getCategorias } from "@/services/reglasdn/service";


type Props = {
  visible: boolean;
  onHide: () => void;
  value: Regla | null; // null => crear
  onSave: (val: Partial<Regla>) => void | Promise<void>;
};

type CategoriaRaw = { id?: number; categoria: string; descripcion?: string };
type CategoriaOpt = { label: string; value: string };

const S = (v: any) => String(v ?? "").trim();
const U = (v: any) => S(v).toUpperCase();

export default function ModalReglasEditor({ visible, onHide, value, onSave }: Props) {
  const [form, setForm] = useState<Partial<Regla>>({
    reglaNegocio: "INDIRECT",
    centroCosto: "",
    compania: "",
    montoMax: 0,
    aprobadores: [],
    vigente: true,
    __min: 0,
    categoria: "",
    ccNivel: "",
  });

  const [tipos, setTipos] = useState<string[]>([]);
  const [niveles, setNiveles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Categorías desde la API real
  const [categorias, setCategorias] = useState<CategoriaOpt[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Sincroniza el form cuando editas un registro existente
  useEffect(() => { if (value) setForm(value); }, [value]);

  // Carga catálogos (tipos/niveles)
  useEffect(() => {
    (async () => {
      try {
        const cats = await getCatalogos();
        setTipos(cats.tipos || []);
        setNiveles(cats.niveles || []);
      } catch {
        // fallback
        setTipos(["COMPRAS", "GERENTE OPS", "FINANZAS", "FINANZAS AM"]);
        setNiveles(["10", "20", "30", "40", "45", "50", "55", "60", "R45", "DUENO CC", "LEGAL"]);
      }
    })();
  }, []);

  // Carga categorías desde la API real (dedupe + orden + UPPER)
  useEffect(() => {
    (async () => {
      setCatLoading(true);
      try {
        const { data } = await getCategorias(); // CategoriaRaw[]
        const opts = (data as CategoriaRaw[] | undefined ?? [])
          .map(r => String(r?.categoria ?? "").trim())
          .filter(Boolean)
          .map(c => c.toUpperCase())
          .filter((v, i, a) => a.indexOf(v) === i) // dedupe
          .sort((a, b) => a.localeCompare(b))
          .map(v => ({ label: v, value: v }));

        // Si estamos editando y la categoría actual no vino en el listado, la inyectamos
        const actual = U(form.categoria || value?.categoria || "");
        if (actual && !opts.some(o => o.value === actual)) {
          opts.unshift({ label: actual, value: actual });
        }
        setCategorias(opts);
      } catch {
        // fallback mínimo para no bloquear
        const fallback = ["INDIRECTO", "DIRECTO", "INTERCOMPANY", "PLOMO", "DIRECTOPACIFICO"]
          .map(v => ({ label: v, value: v }));
        setCategorias(fallback);
      } finally {
        setCatLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // una vez

  const tipoOptions = useMemo(() => tipos.map(t => ({ label: t, value: t })), [tipos]);
  const set = (k: keyof Regla, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addAprob = () =>
    set("aprobadores", [ ...(form.aprobadores || []), { tipo: tipos[0] || "COMPRAS", nivel: "10" } as Aprobador ]);

  const rmAprob  = (idx: number) =>
    set("aprobadores", (form.aprobadores || []).filter((_, i) => i !== idx));

  function dedupeAprobadores(arr: Aprobador[]): Aprobador[] {
    const seen = new Set<string>(); const out: Aprobador[] = [];
    for (const a of arr || []) {
      const tipo = U(a?.tipo || ""); const nivel = S(a?.nivel || "");
      if (!tipo || !nivel) continue;
      const k = `${tipo}|${nivel}`; if (seen.has(k)) continue;
      seen.add(k); out.push({ tipo, nivel });
    }
    return out;
  }

  function validate(): string | null {
    const centro = U(form.centroCosto || "");
    const categoria = U(form.categoria || value?.categoria || "");
    const max = Number(form.montoMax || 0);
    const min = Number(form.__min ?? 0);
    if (!categoria) return "La categoría es obligatoria.";
    if (!centro) return "El centro de costo es obligatorio.";
    if (!(max > 0)) return "El monto máximo debe ser mayor a 0.";
    if (min < 0) return "El mínimo no puede ser negativo.";
    return null;
  }

  const save = async () => {
    const err = validate(); if (err) { alert(err); return; }
    try {
      setSaving(true);
      const rn = U(form.reglaNegocio || "INDIRECT") === "INDIRECTO" ? "INDIRECT" : form.reglaNegocio;
      const payload: Partial<Regla> = {
        ...form,
        id: form.id,
        reglaNegocio: U(rn || "INDIRECT"),
        centroCosto: U(form.centroCosto || ""),
        compania: S(form.compania || ""),
        categoria: U(form.categoria || value?.categoria || ""),
        __min: typeof form.__min === "number" ? Number(form.__min) : 0,
        montoMax: Number(form.montoMax || 0),
        aprobadores: dedupeAprobadores((form.aprobadores || []) as Aprobador[]),
        vigente: form.vigente !== false,
        ccNivel: S(form.ccNivel || ""),
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={value?.id ? "Editar regla" : "Nueva regla"}
      visible={visible}
      onHide={onHide}
      className="rg-dialog rg-violet p-fluid"
      modal
      style={{ width: 940, maxWidth: "98vw" }}
    >
      <div className="rg-form">
        {/* GRID 2 columnas, con captions arriba */}
        <div className="rg-grid rg-grid--spacious">
          <div className="rg-field">
            <label htmlFor="rg1" className="rg-caption">Reglas de negocio</label>
            <Dropdown
              inputId="rg1"
              value={form.reglaNegocio}
              onChange={(e) => set("reglaNegocio", e.value)}
              options={[
                { label: "INDIRECT", value: "INDIRECT" },
                { label: "DIRECT", value: "DIRECT" },
                { label: "INTERCOMPANY", value: "INTERCOMPANY" },
                { label: "PLOMO", value: "PLOMO" },
                { label: "DIRECTOPACIFICO", value: "DIRECTOPACIFICO" },
              ]}
              optionLabel="label"
              optionValue="value"
              className="rg-input"
            />
          </div>

          <div className="rg-field">
            <label htmlFor="rg-cat" className="rg-caption">Si la categoría es</label>
            <Dropdown
              inputId="rg-cat"
              value={U(form.categoria || value?.categoria || "")}
              onChange={(e) => set("categoria", String(e.value || "").toUpperCase())}
              options={categorias}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona categoría"
              filter
              showClear
              className="rg-input"
              loading={catLoading}
            />
          </div>

          <div className="rg-field">
            <label htmlFor="rg2" className="rg-caption">Si el centro de costo es</label>
            <InputText
              id="rg2"
              value={form.centroCosto || ""}
              onChange={(e) => set("centroCosto", e.target.value.toUpperCase())}
              className="rg-input"
            />
          </div>

          <div className="rg-field">
            <label htmlFor="rg3" className="rg-caption">Compañía</label>
            <InputText
              id="rg3"
              value={form.compania || ""}
              onChange={(e) => set("compania", e.target.value)}
              className="rg-input"
            />
          </div>

          <div className="rg-field">
            <label htmlFor="rg-min" className="rg-caption">Si el valor de la orden de compra es ≥</label>
            <InputNumber
              inputId="rg-min"
              value={Number(form.__min ?? 0)}
              onValueChange={(e) => set("__min" as any, e.value ?? 0)}
              mode="currency"
              currency="USD"
              locale="en-US"
              className="rg-input"
            />
          </div>

          <div className="rg-field">
            <label htmlFor="rg4" className="rg-caption">Si el valor de la orden de compra es ≤</label>
            <InputNumber
              id="rg4"
              value={Number(form.montoMax || 0)}
              onValueChange={(e) => set("montoMax", e.value || 0)}
              mode="currency"
              currency="USD"
              locale="en-US"
              className="rg-input"
            />
          </div>

          <div className="rg-field rg-span-2">
            <label htmlFor="rg-ccnivel" className="rg-caption">El centro de costo y nivel autorizador es</label>
            <InputText
              id="rg-ccnivel"
              value={form.ccNivel || ""}
              onChange={(e) => set("ccNivel", e.target.value)}
              className="rg-input"
            />
          </div>
        </div>

        {/* CADENA DE APROBADORES */}
        <div className="rg-steps">
          <div className="rg-head">
            <div className="rg-head-title">Cadena de aprobadores</div>
            <div className="rg-head-bar">
              <Button icon="pi pi-plus" className="rg-add-chip" onClick={addAprob} />
              <span className="rg-head-label">Agregar</span>
            </div>
          </div>

          {(form.aprobadores || []).map((ap, idx) => (
            <div key={idx} className="rg-step">
              <Dropdown
                value={ap.tipo}
                options={tipoOptions}
                optionLabel="label"
                optionValue="value"
                filter
                className="rg-input"
                onChange={(e) => {
                  const arr = [...(form.aprobadores || [])];
                  arr[idx] = { ...ap, tipo: e.value };
                  set("aprobadores", arr);
                }}
              />
              <InputText
                value={String(ap.nivel ?? "")}
                className="rg-input"
                onChange={(e) => {
                  const arr = [...(form.aprobadores || [])];
                  arr[idx] = { ...ap, nivel: e.target.value };
                  set("aprobadores", arr);
                }}
                placeholder="10, 30, 55, R45, LEGAL…"
                list="niveles-sugeridos"
              />
              <datalist id="niveles-sugeridos">
                {niveles.map((n) => <option key={n} value={n} />)}
              </datalist>
              <Button icon="pi pi-trash" severity="danger" text className="rg-del" onClick={() => rmAprob(idx)} />
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="rg-actions">
          <Button
            label="Cancelar"
            text
            onClick={onHide}
            className="p-button-sm p-button-outlined btn-outline-violet"
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={save}
            loading={saving}
            className="p-button-sm p-button-outlined btn-outline-violet"
          />
        </div>
      </div>
    </Dialog>
  );
}
