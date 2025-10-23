import { useContext, useCallback } from 'react';
import { ToastCtx } from '@/features/toast/ToastCtx';
import type { ShowInput } from '@/features/toast/types';

export function useToast() {
  const ctx = useContext(ToastCtx);
  const show = useCallback((o: ShowInput) => ctx?.show?.(o), [ctx]);
  return { show };
}

// Alias opcional si lo usabas así en algunos sitios
export const useAppToast = useToast;
