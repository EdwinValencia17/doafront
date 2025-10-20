import React, { useState } from "react";
import { Topbar } from "./Topbar";
import { SidebarNav } from "./SidebarNav";

export default function AppShell({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onOpenMenu={() => setOpen(true)} />
      <main className="app-content">{children}</main>
      <SidebarNav open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
