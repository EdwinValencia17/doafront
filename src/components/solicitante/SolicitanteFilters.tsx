// src/components/solicitante/SolicitanteFilters.tsx
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import type { ComboEstado, ComboCeco, ComboCompania, ComboPrioridad } from '@/services/solicitante';

export type FiltersState = {
  q?: string; qOC?: string; qSol?: string; proveedor?: string;
  ceco?: string | number; compania?: string; estado?: string | number;
  prioridad?: 'G' | 'I' | 'N' | 'P' | 'U' | '-1'; sistema?: string | '-1';
  fechaDesde?: Date | null; fechaHasta?: Date | null;
};

/* ---------- UI helpers: botón "X" y wrappers clearable ---------- */
function ClearButton({ onClick, title = 'Limpiar' }: { onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className="cc-clear-btn pi pi-times"
      onClick={onClick}
    />
  );
}

function ClearableText({
  value, onChange, placeholder, className, showWhenEmpty = true,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** mostrar la X aunque esté vacío, para consistencia visual */
  showWhenEmpty?: boolean;
}) {
  const hasValue = !!(value && value.length);
  return (
    <div className={`cc-clearable ${className ?? ''}`}>
      <InputText
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full cc-field pr-9"
      />
      {(hasValue || showWhenEmpty) && <ClearButton onClick={() => onChange('')} />}
    </div>
  );
}

function ClearableCalendar({
  value, onChange, placeholder, className, showWhenEmpty = true,
}: {
  value: Date | null | undefined;
  onChange: (v: Date | null) => void;
  placeholder?: string;
  className?: string;
  showWhenEmpty?: boolean;
}) {
  const hasValue = !!value;
  return (
    <div className={`cc-clearable ${className ?? ''}`}>
      <Calendar
        value={value ?? null}
        onChange={(e) => onChange((e.value as Date) ?? null)}
        dateFormat="dd/mm/yy"
        placeholder={placeholder}
        className="w-full cc-field cc-calendar pr-9"
        /* sin showIcon para quitar el calendario */
      />
      {(hasValue || showWhenEmpty) && <ClearButton onClick={() => onChange(null)} />}
    </div>
  );
}

/* ---------------------- Componente principal ---------------------- */
export function SolicitanteFilters(props: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  onApply: () => void;
  onClear: () => void;
  combos: {
    estados: ComboEstado[]; cecos: ComboCeco[]; companias: ComboCompania[];
    prioridades: ComboPrioridad[]; loading: boolean;
  };
  logoUrl?: string;
}) {
  const { value: f, onChange, onApply, onClear, combos, logoUrl } = props;
  const set = (patch: Partial<FiltersState>) => onChange({ ...f, ...patch });

  const cleared: FiltersState = {
    q: '',
    qOC: '',
    qSol: '',
    proveedor: '',
    ceco: '-1',
    compania: '',
    estado: '-1',
    prioridad: '-1',
    sistema: '-1',
    fechaDesde: null,
    fechaHasta: null,
  };

  /** Limpiar todo en 1 clic + refrescar (el padre hará fetch con estos filtros) */
  const handleClearAll = () => {
    onChange({ ...f, ...cleared });
    try { onClear?.(); } catch {}
    onApply(); // el padre ya llama fetch con los filtros actuales o con override (ver B)
  };

  return (
    <aside className="cc-aside cc-aside--glass">
      <div className="cc-aside-head">
        {logoUrl ? <img src={logoUrl} alt="DOA" className="cc-logo" /> : null}
        <div>
          <h2>BANDEJA DEL SOLICITANTE</h2>
          <div className="muted">Órdenes de compra (activas y pendientes)</div>
        </div>
      </div>

      <div className="filter-block">
        <div className="filter-label">N° Solicitud</div>
        <ClearableText
          value={f.qSol}
          onChange={(v) => set({ qSol: v })}
          placeholder="Ej: 2024-001234"
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">N° Orden de Compra</div>
        <ClearableText
          value={f.qOC}
          onChange={(v) => set({ qOC: v })}
          placeholder="Ej: OC-00004567"
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Proveedor</div>
        <ClearableText
          value={f.proveedor}
          onChange={(v) => set({ proveedor: v })}
          placeholder="Razón social o NIT"
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Centro de Costo</div>
        <Dropdown
          value={f.ceco}
          options={[
            { label: 'Centro costo', value: '-1' },
            ...(combos.cecos ?? []).map(c => ({
              label: `${c.codigo} · ${c.descripcion}`,
              value: c.id_ceco,
            })),
          ]}
          onChange={(e: DropdownChangeEvent) => set({ ceco: e.value })}
          placeholder="Centro costo"
          className="w-full cc-field"
          showClear
          disabled={combos.loading}
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Compañía</div>
        <Dropdown
          value={f.compania}
          options={(combos.companias ?? []).map(c => ({
            label: `${c.codigo_compania} · ${c.nombre_compania}`,
            value: c.codigo_compania,
          }))}
          onChange={(e: DropdownChangeEvent) => set({ compania: e.value })}
          placeholder="— Todas —"
          className="w-full cc-field"
          showClear
          disabled={combos.loading}
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Estado</div>
        <Dropdown
          value={f.estado}
          options={[
            { label: 'Estados', value: '-1' },
            ...(combos.estados ?? []).map(e => ({
              label: e.descripcion,
              value: e.id_esta,
            })),
          ]}
          onChange={(e: DropdownChangeEvent) => set({ estado: e.value })}
          placeholder="Estados"
          className="w-full cc-field"
          showClear
          disabled={combos.loading}
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Prioridad</div>
        <Dropdown
          value={f.prioridad}
          options={[
            { label: '— Todas —', value: '-1' },
            ...(combos.prioridades ?? []).map(p => ({
              label: p.label,
              value: p.code,
            })),
          ]}
          onChange={(e: DropdownChangeEvent) => set({ prioridad: e.value })}
          placeholder="— Todas —"
          className="w-full cc-field"
          showClear
          disabled={combos.loading}
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Sistema</div>
        <Dropdown
          value={f.sistema}
          options={[
            { label: '— Todos —', value: '-1' },
            { label: 'ERP', value: 'ERP' },
            { label: 'SAP', value: 'SAP' },
            { label: 'Otro', value: 'OTRO' },
          ]}
          onChange={(e: DropdownChangeEvent) => set({ sistema: e.value })}
          placeholder="— Todos —"
          className="w-full cc-field"
          showClear
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Fecha (desde)</div>
        <ClearableCalendar
          value={f.fechaDesde ?? null}
          onChange={(v) => set({ fechaDesde: v })}
          placeholder="dd/mm/aaaa"
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Fecha (hasta)</div>
        <ClearableCalendar
          value={f.fechaHasta ?? null}
          onChange={(v) => set({ fechaHasta: v })}
          placeholder="dd/mm/aaaa"
        />
      </div>

      <div className="cc-aside-footer">
        <Button
          icon="pi pi-filter"
          label="Aplicar filtros"
          onClick={onApply}
          className="w-full p-button-rounded p-button-secondary cc-action"
        />
        <Button
          icon="pi pi-eraser"
          label="Limpiar todo"
          onClick={handleClearAll}
          className="w-full p-button-rounded p-button-secondary cc-action cc-action--ghost"
        />
      </div>
    </aside>
  );
}
