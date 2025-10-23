// src/components/topbar/Topbar.tsx
import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { useUserDisplay } from "@/hooks/sidebar/useUserDisplay";
import { ProfileOverlay } from "./ProfileOverlay";
import { BrandLogo } from "./BrandLogo";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { avatarLabel } = useUserDisplay();
  const profileOpRef = useRef<OverlayPanel>(null);

  return (
    <header
      className="topbar topbar--violet"
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      {/* Izquierda: botón menú */}
      <button className="icon-btn" onClick={onOpenMenu} aria-label="Abrir menú">
        <i className="pi pi-bars" />
      </button>

      {/* Spacer para empujar contenido a la derecha */}
      <div style={{ flex: 1 }} />

      {/* Derecha: Avatar + Logo (el logo se queda donde estaba) */}
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          label={avatarLabel}
          shape="circle"
          size="large"
          style={{ cursor: "pointer" }}
          onClick={(e) => profileOpRef.current?.toggle(e)}
          aria-label="Abrir menú de usuario"
        />
        <ProfileOverlay ref={profileOpRef} />
        <BrandLogo height={160} />
      </div>
    </header>
  );
}
