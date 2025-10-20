// src/pages/Home/HomeDashboard.tsx
import React, { useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { useAuthStore } from "@/context/StoreAuth";
import { useAuth } from "@/hooks/auth/useAuth";   // 👈 usa el hook de dominio
import { useNavigate } from "react-router-dom";

const HomeDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();                  // 👈 aquí está la lógica real de logout
  const nav = useNavigate();

  useEffect(() => { document.title = "DOA · Inicio"; }, []);

  const avatarLabel = (user?.name?.[0] ?? user?.globalId?.[0] ?? "U").toUpperCase();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar label={avatarLabel} size="large" />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>
              ¡Bienvenido, {user?.name ?? user?.globalId ?? "Usuario"}!
            </h2>
            <p style={{ opacity: 0.8, margin: "4px 0 0" }}>
              {user?.email ?? "Sesión activa"}
            </p>
            {!!user?.role && (
              <div style={{ marginTop: 8 }}>
                <Tag value={user.role} />
              </div>
            )}
          </div>
        </div>

        <Divider />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          <Card>
            <h3 style={{ marginTop: 0 }}>Órdenes pendientes</h3>
            <p style={{ opacity: 0.8 }}>Revisa y autoriza las órdenes que están en tu bandeja.</p>
            <Button label="Ir a Bandeja" icon="pi pi-inbox" onClick={() => nav("/bandeja")} />
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>Solicitudes</h3>
            <p style={{ opacity: 0.8 }}>Crea nuevas solicitudes y consulta su estado.</p>
            <Button label="Nueva Solicitud" icon="pi pi-plus" onClick={() => nav("/solicitudes/nueva")} />
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>Consultas</h3>
            <p style={{ opacity: 0.8 }}>Busca por número de OC, proveedor o estado.</p>
            <Button label="Consultar" icon="pi pi-search" onClick={() => nav("/consultas")} />
          </Card>
        </div>

        <Divider />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ opacity: 0.75, fontSize: 14 }}>DOA · Eficiencia con estilo.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button label="Ajustes" icon="pi pi-cog" severity="secondary" outlined onClick={() => nav("/ajustes")} />
            <Button
              label="Cerrar sesión"
              icon="pi pi-sign-out"
              severity="danger"
              onClick={async () => {
                await logout();      // 👈 limpia storages + estado
                nav("/login", { replace: true });  // 👈 y te lleva al login
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomeDashboard;
