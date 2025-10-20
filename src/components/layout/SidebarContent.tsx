import React from "react";
import { Button } from "primereact/button";
import { Ripple } from "primereact/ripple";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { useNavigate } from "react-router-dom";
import { SidebarBrand } from "./SidebarBrand";
import { useUserDisplay } from "@/hooks/sidebar/useUserDisplay";
import { StyleToggle } from "./StyleToggle";

type HideFn = (e: React.SyntheticEvent) => void;

export function SidebarContent({ hide }: { hide: HideFn }) {
  const nav = useNavigate();
  const { user, avatarLabel, displayName } = useUserDisplay();

  return (
    <div className="sb-wrapper">
      <div className="sb-header">
        <SidebarBrand />
        <Button
          type="button"
          onClick={(e) => hide(e)}
          icon="pi pi-times"
          rounded
          outlined
          className="h-2rem w-2rem"
          aria-label="Cerrar menú"
        />
      </div>

      <div className="sb-scroll">
        <ul className="list-none p-3 m-0">
          <li>
            <StyleToggle selector="@next" enterFromClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
              <div className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer">
                <span className="font-medium">FAVORITOS</span>
                <i className="pi pi-chevron-down" />
                <Ripple />
              </div>
            </StyleToggle>

            <ul className="list-none p-0 m-0 overflow-hidden">
              <li>
                <a className="sb-item" onClick={(e) => { hide(e); nav("/"); }}>
                  <i className="pi pi-home mr-2" />
                  <span className="font-medium">Dashboard</span>
                  <Ripple />
                </a>
              </li>

              <li>
                <a className="sb-item" onClick={(e)=>{ hide(e); nav("/doa/reglas"); }}>
                  <i className="pi pi-sitemap mr-2" />
                  <span className="font-medium">Reglas de Negocio</span>
                  <Ripple />
                </a>
              </li>
            </ul>
          </li>
        </ul>

        <ul className="list-none p-3 m-0">
          <li>
            <StyleToggle selector="@next" enterFromClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
              <div className="p-ripple p-3 flex align-items-center justify-content-between text-600 cursor-pointer">
                <span className="font-medium">APLICACIÓN</span>
                <i className="pi pi-chevron-down" />
                <Ripple />
              </div>
            </StyleToggle>

            <ul className="list-none p-0 m-0 overflow-hidden">
              <li>
                <a className="sb-item">
                  <i className="pi pi-folder mr-2" />
                  <span className="font-medium">Projects</span>
                  <Ripple />
                </a>
              </li>
              <li>
                <a className="sb-item" onClick={(e)=>{ hide(e); nav("/doa/reglas"); }}>
                  <i className="pi pi-cog mr-2" />
                  <span className="font-medium">Reglas de Negocio</span>
                  <Ripple />
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="sb-footer">
        <hr className="mb-3 mx-3 border-top-1 border-none surface-border" />
        <div className="sb-item m-3" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar label={avatarLabel} shape="circle" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="font-bold">{displayName}</span>
            {!!user?.email && <small className="text-600" style={{ opacity: 0.8 }}>{user.email}</small>}
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {!!user?.role && <Tag value={user.role} />}
              {!!user?.globalId && <Tag value={`ID: ${user.globalId}`} severity="info" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
