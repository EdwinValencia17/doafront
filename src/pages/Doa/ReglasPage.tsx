import { useState } from "react";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { ReglasTable } from "@/components/reglas/ReglasTable";
import { CentroSelectorDrawer } from "@/components/reglas/CentroSelectorDrawer";
import { useReglasPageVM } from "@/hooks/reglas/useReglasPageVM";
import ModalReglasEditor from "@/Modales/ReglasEditor/ModalReglasEditor";

export default function ReglasPage() {
  const vm = useReglasPageVM();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const headerLeft = (
    <>
      <div className="title">REGLAS DE NEGOCIO</div>
      <div className="subtitle">Centro: {vm.selCentroLabel || "Todos los centros"}</div>
    </>
  );

  const headerRight = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Button
        icon="pi pi-filter"
        label="Centros"
        className="p-button-sm p-button-outlined"
        onClick={() => setDrawerVisible(true)}
      />
      <Button
        icon="pi pi-plus"
        label="Nueva regla"
        className="p-button-sm p-button-outlined"
        onClick={vm.openNew}
        disabled={!vm.selCentro || vm.heavyLoading || !vm.allowMutations}
      />
    </div>
  );

  return (
    <>
      <ReglasTable {...vm.tableProps} headerLeft={headerLeft} headerRight={headerRight} />

      <Sidebar
        visible={drawerVisible}
        position="left"
        onHide={() => setDrawerVisible(false)}
        className="centros-sidebar"
        dismissable
        showCloseIcon
      >
        <CentroSelectorDrawer
          centros={vm.centros}
          selCentro={vm.selCentro}
          setSelCentro={(c) => { vm.setSelCentro(c); setDrawerVisible(false); }}
          onDescargar={vm.descargarPlantilla}
          onImportar={vm.onImport}
          loading={vm.heavyLoading}
          allowMutations={vm.allowMutations}
        />
      </Sidebar>

      <ModalReglasEditor
        visible={vm.showEditor}
        onHide={() => vm.setShowEditor(false)}
        value={vm.editing}
        onSave={vm.onSaveEditor}
      />

      {vm.heavyLoading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.25)",
          display: "grid", placeItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "var(--surface-card)", padding: "1rem 1.25rem",
            borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.2)", textAlign: "center"
          }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: 24, display: "block", marginBottom: 8 }} />
            <div>Procesando… No cierres esta ventana</div>
          </div>
        </div>
      )}
    </>
  );
}
