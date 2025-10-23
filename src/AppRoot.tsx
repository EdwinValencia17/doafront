import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { useAuthBootstrap } from "@/hooks/auth/useAuthBootstrap";
import { ToastProvider } from "@/ui/ToastProvider";

import { LoaderProvider } from "@/ui/LoaderProvider"; // 👈 importa el provider

export default function AppRoot() {
  const { hydrated } = useAuthBootstrap();
  if (!hydrated) return null;

  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <LoaderProvider> {/* 👈 ahora todo lo de abajo tiene contexto */}
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LoaderProvider>
    </Suspense>
  );
}
