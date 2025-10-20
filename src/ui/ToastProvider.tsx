// src/ui/ToastProvider.tsx
import { createContext, useContext, useRef, useMemo } from "react";
import { Toast } from "primereact/toast";

type ShowOpts = Parameters<NonNullable<React.RefObject<Toast>["current"]>["show"]>[0];
const ToastCtx = createContext<{ show: (o: ShowOpts)=>void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);
  const api = useMemo(() => ({
    show: (o: ShowOpts) => toastRef.current?.show(o),
  }), []);

  return (
    <>
      <Toast
        ref={toastRef}
        position="top-right"
        appendTo={typeof window !== "undefined" ? document.body : undefined}
        baseZIndex={200000}
      />
      <ToastCtx.Provider value={api}>{children}</ToastCtx.Provider>
    </>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
