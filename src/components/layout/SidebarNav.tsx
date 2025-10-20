import React from "react";
import { Sidebar } from "primereact/sidebar";
import { SidebarContent } from "./SidebarContent";

export function SidebarNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sidebar
      visible={open}
      onHide={onClose}
      position="left"
      showCloseIcon={false}
      blockScroll
      className="sb-panel"
      content={({ hide }) => <SidebarContent hide={hide} />}
    />
  );
}
