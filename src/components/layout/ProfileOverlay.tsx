import React, { forwardRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserDisplay } from "@/hooks/sidebar/useUserDisplay";

export const ProfileOverlay = forwardRef<OverlayPanel, Record<string, never>>(
  function ProfileOverlay(_, ref) {
    const { user, avatarLabel, displayName } = useUserDisplay();
    const { logout } = useAuth();
    const nav = useNavigate();

    return (
      <OverlayPanel ref={ref} showCloseIcon dismissable>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar label={avatarLabel} shape="circle" />
            <div style={{ lineHeight: 1.1 }}>
              <strong>{displayName}</strong>
              {user?.email && <div style={{ opacity: 0.75, fontSize: 12 }}>{user.email}</div>}
            </div>
          </div>

          <hr className="border-top-1 border-none surface-border" />

          <Button
            label="Perfil"
            icon="pi pi-user"
            outlined
            onClick={() => {
              (ref as React.RefObject<OverlayPanel>)?.current?.hide();
              nav("/ajustes");
            }}
          />

          <Button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            severity="danger"
            onClick={async () => {
              await logout();
              (ref as React.RefObject<OverlayPanel>)?.current?.hide();
              nav("/login", { replace: true });
            }}
          />
        </div>
      </OverlayPanel>
    );
  }
);
