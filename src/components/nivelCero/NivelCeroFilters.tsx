import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import type { FiltersState } from '@/hooks/nivelCero/useNivelCeroData';

function ClearButton({ onClick, title = 'Limpiar' }: { onClick: () => void; title?: string }) {
  return <button type="button" title={title} aria-label={title} className="cc-clear-btn pi pi-times" onClick={onClick} />;
}
function ClearableText({ value, onChange, placeholder }: { value?: string; onChange: (v: string)=>void; placeholder?: string }) {
  return (
    <div className="cc-clearable">
      <InputText value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full cc-field pr-9" />
      <ClearButton onClick={() => onChange('')} />
    </div>
  );
}
function ClearableCalendar({ value, onChange, placeholder }: { value?: Date|null; onChange: (v: Date|null)=>void; placeholder?: string }) {
  return (
    <div className="cc-clearable">
      <Calendar value={value ?? null} onChange={(e) => onChange((e.value as Date) ?? null)} dateFormat="dd/mm/yy" placeholder={placeholder} className="w-full cc-field cc-calendar pr-9" />
      <ClearButton onClick={() => onChange(null)} />
    </div>
  );
}

export function NivelCeroFilters(props: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  onApply: () => void;
  onClear: () => void;
  combos: {
    cc: { value: string; label: string }[];
    sol: { value: string; label: string }[];
    comp: { value: string; label: string }[];
    sis: { value: string; label: string }[];
    loading: boolean;
  };
}) {
  const { value: f, onChange, onApply, onClear, combos } = props;
  const set = (patch: Partial<FiltersState>) => onChange({ ...f, ...patch });

  const handleClearAll = () => {
    onChange({
      numeroSolicitud: '', numeroOc: '', proveedorNit: '',
      centroCosto: '-1', solicitante: '-1', compania: '-1', sistema: '-1',
      prioridad: '-1', fechaInicio: null, fechaFin: null,
    });
    try { onClear?.(); } catch {}
    onApply();
  };

  return (
    <aside className="cc-aside cc-aside--glass">
      <div className="cc-aside-head">
        <h2>NIVEL CERO</h2>
        <div className="muted">Bandeja de órdenes pendientes por iniciar</div>
      </div>

      <div className="filter-block">
        <div className="filter-label">N° Solicitud</div>
        <ClearableText value={f.numeroSolicitud} onChange={(v)=>set({numeroSolicitud: v})} placeholder="RQ…" />
      </div>

      <div className="filter-block">
        <div className="filter-label">N° Orden de Compra</div>
        <ClearableText value={f.numeroOc} onChange={(v)=>set({numeroOc: v})} placeholder="PO…" />
      </div>

      <div className="filter-block">
        <div className="filter-label">Centro de Costo</div>
        <Dropdown value={f.centroCosto} options={combos.cc} onChange={(e)=>set({ centroCosto: e.value })} placeholder="Centro de Costo" className="w-full cc-field" showClear disabled={combos.loading} />
      </div>

      <div className="filter-block">
        <div className="filter-label">Solicitante</div>
        <Dropdown value={f.solicitante} options={combos.sol} onChange={(e)=>set({ solicitante: e.value })} placeholder="Solicitante" className="w-full cc-field" showClear disabled={combos.loading} />
      </div>

      <div className="filter-block">
        <div className="filter-label">Compañía</div>
        <Dropdown value={f.compania} options={combos.comp} onChange={(e)=>set({ compania: e.value })} placeholder="Compañía" className="w-full cc-field" showClear disabled={combos.loading} />
      </div>

      <div className="filter-block">
        <div className="filter-label">Fecha inicio</div>
        <ClearableCalendar value={f.fechaInicio ?? null} onChange={(v)=>set({ fechaInicio: v })} placeholder="dd/mm/aaaa" />
      </div>

      <div className="filter-block">
        <div className="filter-label">Fecha fin</div>
        <ClearableCalendar value={f.fechaFin ?? null} onChange={(v)=>set({ fechaFin: v })} placeholder="dd/mm/aaaa" />
      </div>

      <div className="filter-block">
        <div className="filter-label">Prioridad</div>
        <Dropdown
          value={f.prioridad ?? '-1'}
          options={[
            { value: '-1', label: 'Prioridad' },
            { value: 'G', label: 'URGENTE' },
            { value: 'I', label: 'INVENTARIO' },
            { value: 'N', label: 'NORMAL' },
            { value: 'P', label: 'PREVENTIVO' },
            { value: 'U', label: 'PRIORITARIO' },
          ]}
          optionLabel="label"
          optionValue="value"
          onChange={(e)=>set({ prioridad: e.value })}
          className="w-full cc-field"
          showClear
        />
      </div>

      <div className="filter-block">
        <div className="filter-label">Sistema</div>
        <Dropdown value={f.sistema} options={combos.sis} onChange={(e)=>set({ sistema: e.value })} placeholder="Sistema" className="w-full cc-field" showClear disabled={combos.loading} />
      </div>

      <div className="filter-block">
        <div className="filter-label">Proveedor (NIT)</div>
        <ClearableText value={f.proveedorNit} onChange={(v)=>set({ proveedorNit: v })} placeholder="NIT Proveedor" />
      </div>

      <div className="cc-aside-footer">
        <Button icon="pi pi-filter" label="Aplicar filtros" onClick={onApply} className="w-full p-button-rounded p-button-secondary cc-action" />
        <Button icon="pi pi-eraser" label="Limpiar todo" onClick={handleClearAll} className="w-full p-button-rounded p-button-secondary cc-action cc-action--ghost" />
      </div>
    </aside>
  );
}
