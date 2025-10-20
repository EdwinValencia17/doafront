import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { useAuthBootstrap } from "@/hooks/auth/useAuthBootstrap";
import { ToastProvider } from "@/ui/ToastProvider";

export default function AppRoot(): JSX.Element | null {
  const { hydrated } = useAuthBootstrap();
  if (!hydrated) return null;

  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </Suspense>
  );
}
