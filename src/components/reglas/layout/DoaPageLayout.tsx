// src/components/reglas/layout/DoaPageLayout.tsx
import React from "react";
import { Button } from "primereact/button";

export default function DoaPageLayout({
  title,
  subtitle,
  onOpenCentros,
  primaryAction,
  children,
}: {
  title: string;
  subtitle?: string;
  onOpenCentros?: () => void;
  primaryAction?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="doa-page">
      {/* HEADER FIJO */}
      <div className="doa-page-header">
        <div className="hdr-left">
          {onOpenCentros && (
            <Button
              icon="pi pi-bars"
              rounded
              text
              onClick={onOpenCentros}
              aria-label="Abrir centros"
              className="hdr-icon"
            />
          )}
          <div className="hdr-titles">
            <div className="hdr-title">{title}</div>
            {!!subtitle && <small className="hdr-subtitle">{subtitle}</small>}
          </div>
        </div>

        <div className="hdr-actions">{primaryAction}</div>
      </div>

      {/* CUERPO SCROLLEABLE */}
      <div className="doa-page-body">{children}</div>
    </div>
  );
}
