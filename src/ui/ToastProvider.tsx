import React, { useMemo, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ToastCtx } from '@/features/toast/ToastCtx';
import type { ShowInput } from '@/features/toast/types';

// ✅ SOLO componente (SRP + fast refresh feliz)
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);

  const api = useMemo(
    () => ({
      show: (o: ShowInput) => toastRef.current?.show(o),
    }),
    []
  );

  return (
    <>
      <Toast
        ref={toastRef}
        position="top-right"
        appendTo={typeof window !== 'undefined' ? document.body : undefined}
        baseZIndex={200000}
      />
      <ToastCtx.Provider value={api}>{children}</ToastCtx.Provider>
    </>
  );
}
