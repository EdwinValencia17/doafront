// src/services/apis/errors.ts
import axios, { AxiosError } from 'axios';

export type UiError = { status?: number; code?: string; message: string };

// type guard genérico
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeError(e: unknown): UiError {
  if (axios.isAxiosError(e)) {
    const ax = e as AxiosError<unknown>;

    if (!ax.response) {
      return { code: ax.code, message: 'No se pudo contactar al servidor.' };
    }

    const status = ax.response.status;
    const data = ax.response.data; // unknown

    let msg: string | undefined;

    if (isRecord(data)) {
      const maybeMsg   = data['message'];
      const maybeError = data['error'];
      const maybeDetail= data['detail'];

      if (typeof maybeMsg === 'string') msg = maybeMsg;
      else if (typeof maybeError === 'string') msg = maybeError;
      else if (typeof maybeDetail === 'string') msg = maybeDetail;
    }

    msg ||= ax.message || `HTTP ${status}`;
    return { status, code: ax.code, message: msg };
  }

  return { message: 'Error desconocido' };
}
