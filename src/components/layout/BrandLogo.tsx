// src/components/topbar/BrandLogo.tsx
import React from "react";
import logo from "@/assets/787eaa1c-4ac6-4648-9c86-3b4a7d6f45db-removebg-preview.png";

type Props = {
  height?: number;   // altura en px (28–40 queda perfecto en topbar)
  className?: string;
};

export function BrandLogo({ height = 28, className }: Props) {
  return (
    <img
      src={logo}
      alt="Clarios DOA"
      height={height}
      style={{
        height,
        width: "auto",
        display: "block",
        // 🧊 no hereda glass ni mezcla
        mixBlendMode: "normal",
        isolation: "isolate",
        zIndex: 1,
        // punch sutil como el mock:
        filter:
          "drop-shadow(0 1px 0 rgba(255,255,255,.65)) drop-shadow(0 10px 22px rgba(0,0,0,.18)) contrast(1.05) saturate(1.05)",
        pointerEvents: "none",
      }}
      decoding="async"
      loading="eager"
      fetchPriority="high"
      className={className}
    />
  );
}
