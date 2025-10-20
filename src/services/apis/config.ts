const ENV_BASE = import.meta.env.VITE_API_URL as string | undefined;

export const DEV = !!import.meta.env.DEV;
export const DEFAULT_TIMEOUT = 30_000;

export function resolveBaseURL(): string {
  if (!ENV_BASE) throw new Error('[client] VITE_API_URL no está definido.');

  // Aviso PNA: front en LAN/HTTPS y API en localhost → el navegador bloqueará
  try {
    const frontLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const apiLocal = /:\/\/(localhost|127\.0\.0\.1)/.test(ENV_BASE);
    if (!frontLocal && apiLocal) {
      console.warn('[client] PNA: cambia VITE_API_URL a la IP LAN del back.');
    }
  } catch { /* SSR safe */ }

  return ENV_BASE;
}
