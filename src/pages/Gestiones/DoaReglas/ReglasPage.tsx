// src/pages/Doa/ReglasPage.tsx
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

  // 👇 handler: si no hay centro, primero pedimos elegirlo
  const handleNewRule = () => {
    if (!vm.selCentro) {
      setDrawerVisible(true);
      return;
    }
    vm.openNew();
  };

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
  onClick={vm.openNew}          // ✅ siempre modal
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
    </>
  );
}
