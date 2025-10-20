import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { useUserDisplay } from "@/hooks/sidebar/useUserDisplay"; // ajusta si tu path es otro
import { ProfileOverlay } from "./ProfileOverlay";
import { BrandLogo } from "./BrandLogo";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { avatarLabel, displayNameUpper } = useUserDisplay();

  // ⛳ CLAVE: el genérico NO lleva | null
  const profileOpRef = useRef<OverlayPanel>(null);

  return (
    <header className="topbar topbar--violet" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Botón menú (izquierda) */}
      <button className="icon-btn" onClick={onOpenMenu} aria-label="Abrir menú">
        <i className="pi pi-bars" />
      </button>

      {/* Saludo centrado */}
      <div
        className="sb-greeting"
        style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}
      >
        <span
          className="sb-logo-text"
          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 }}
        >
          ¡Bienvenido, {displayNameUpper}!
        </span>
      </div>

      {/* Derecha: Avatar (abre panel) + LOGO */}
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
        <Avatar
          label={avatarLabel}
          shape="circle"
          size="large"
          style={{ cursor: "pointer" }}
          onClick={(e) => profileOpRef.current?.toggle(e)}
          aria-label="Abrir menú de usuario"
        />
        {/* ✅ Ahora JSX entiende 'ref' porque el componente es forwardRef */}
        <ProfileOverlay ref={profileOpRef} />
        <BrandLogo height={160} />
      </div>
    </header>
  );
}
