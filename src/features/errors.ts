// src/features/errors.ts

type Recordish = Record<string, unknown>;

function isObject(x: unknown): x is Recordish {
  return typeof x === 'object' && x !== null;
}

function has<K extends string>(o: unknown, k: K): o is Recordish & Record<K, unknown> {
  return isObject(o) && k in o;
}

export function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (isObject(err) && (err.name === 'CanceledError' || err.message === 'canceled')) return true;
  if (isObject(err) && err.code === 'ERR_CANCELED') return true;
  return false;
}

export function getHttpStatus(err: unknown): number | undefined {
  if (isObject(err) && has(err, 'response') && isObject(err.response) && typeof err.response.status === 'number') {
    return err.response.status;
  }
  return undefined;
}

export function getBackendError(err: unknown): string | undefined {
  // Intenta leer data.error (Axios-like)
  if (
    isObject(err) &&
    has(err, 'response') &&
    isObject(err.response) &&
    isObject(err.response.data) &&
    has(err.response.data, 'error') &&
    typeof err.response.data.error === 'string'
  ) {
    return err.response.data.error;
  }
  return undefined;
}

export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error'): string {
  if (typeof err === 'string') return err;
  if (isObject(err) && typeof err.message === 'string') return err.message;
  return fallback;
}
