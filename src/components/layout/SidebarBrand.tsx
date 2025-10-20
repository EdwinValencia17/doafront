import React from "react";
import doaLogo from "@/assets/787eaa1c-4ac6-4648-9c86-3b4a7d6f45db-removebg-preview.png";

export function SidebarBrand() {
  return (
    <div
      className="sb-brand"
      style={{
        position: "relative",
        width: 220,
        height: 40,
        overflow: "visible",
      }}
    >
      <img
        src={doaLogo}
        alt="Clarios DOA"
        style={{
          position: "absolute",
          left: 0,
          top: -49,
          height: 156,
          width: "auto",
          objectFit: "contain",
          transform: "translate(-15px, -6px) scale(1.08)",
          transformOrigin: "left center",
          display: "block",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
