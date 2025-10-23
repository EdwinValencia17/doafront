// src/context/NeonImageLoader.tsx
import React from "react";

type Props = {
  visible: boolean;
  percent?: number;
  spinMs?: number;          // velocidad de giro del logo (ms por vuelta)
  label?: string;           // "Cargando…" por defecto
  imageUrl: string;         // tu PNG del logo circular
};

type SpinStyle = React.CSSProperties & { ['--spinms']?: string };

export default function NeonImageLoader({
  visible,
  percent,
  spinMs = 4800,
  label = "Cargando…",
  imageUrl,
}: Props) {
  const pct = typeof percent === "number" ? Math.max(0, Math.min(100, percent)) : undefined;
  const spinStyle: SpinStyle = { '--spinms': `${spinMs}ms` };

  return (
    <div className={`nr-overlay ${visible ? "is-on" : ""}`} aria-hidden={!visible}>
      {/* Velo global */}
      <div className="nr-veil" />

      <div className="nr-stage">
        <div className="nr-wrap" style={spinStyle}>
          {/* Plato suave detrás del logo */}
          <div className="nr-plate" />

          {/* AURA (se mantiene) */}
          <div className="nr-aura">
            <span />
            <span />
            <span />
          </div>

          {/* LOGO que gira */}
          <img className="nr-logo-spin" src={imageUrl} alt="loading" />

          {/* ★ NUEVO: EFECTO QUE EMANA DEL LOGO */}
          <div className="nr-emanate">
            <div className="nr-ring" />
            <div className="nr-burst" />
            <div className="nr-rays" />
          </div>

          {/* Energía inferior */}
          <div className="nr-energy">
            <span />
            <span />
            <span />
            <span />
          </div>

          {/* Porcentaje + texto */}
          <div className="nr-labelwrap">
            {pct != null && <div className="nr-percent">{pct}%</div>}
            <div className="nr-label">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
