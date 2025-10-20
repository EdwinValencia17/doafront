import React from "react";
import doaLogo from "@/assets/787eaa1c-4ac6-4648-9c86-3b4a7d6f45db-removebg-preview.png";

export function BrandLogo({ height = 160 }: { height?: number }) {
  return (
    <img
      src={doaLogo}
      alt="Clarios DOA"
      style={{ height, width: "auto", objectFit: "contain" }}
    />
  );
}
