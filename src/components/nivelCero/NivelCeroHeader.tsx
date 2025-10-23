// src/components/nivelcero/NivelCeroHeader.tsx
import { Button } from 'primereact/button';

export function NivelCeroHeader({
  total, filtersVisible, onToggleFilters, onRefresh, onStart, startDisabled,
}: {
  total: number;
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onRefresh: () => void;
  onStart: () => void;
  startDisabled?: boolean;
}) {
  return (
    <div className="dt-header-violet">
      <div className="left">
        <div className="title">ÓRDENES SIN INICIAR</div>
        <div className="subtitle">Total: {total}</div>
      </div>
      <div className="right flex align-items-center gap-2">
        <Button icon={filtersVisible ? 'pi pi-filter-slash' : 'pi pi-filter'}
                label={filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
                onClick={onToggleFilters}
                className="p-button-outlined" />
        <Button icon="pi pi-refresh" label="Actualizar" onClick={onRefresh} className="p-button-outlined" />
        <Button icon="pi pi-send" className="p-button-outlined" label="Iniciar seleccionadas" onClick={onStart} disabled={startDisabled} />
      </div>
    </div>
  );
}
