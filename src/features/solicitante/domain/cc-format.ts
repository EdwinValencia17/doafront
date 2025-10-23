import type { OCRow } from '@/services/solicitante';

export type CecoIndex = Record<number, { codigo: string; descripcion: string }>;

type WithCecoFields = {
  ceco_txt?: string | null;
  codigo_centro_costo?: string | null;
  ceco_codigo?: string | null;
  descripcion_centro_costo?: string | null;
  ceco_descripcion?: string | null;
  id_ceco?: number | null;
};
type OCRowWithCeco = OCRow & Partial<WithCecoFields>;

function clean(s?: string | null): string {
  return (s ?? '').trim();
}

/** Intenta extraer código desde los campos del row (sin usar el id). */
function codeFromRow(row: OCRowWithCeco): string {
  const txt = clean(row.ceco_txt);
  const fromTxt = txt ? txt.split('·').map((x) => x.trim()) : [];
  return clean(row.codigo_centro_costo) || clean(row.ceco_codigo) || (fromTxt[0] ?? '');
}

/** Intenta extraer descripción desde los campos del row (sin usar el id). */
function descFromRow(row: OCRowWithCeco): string {
  const txt = clean(row.ceco_txt);
  const fromTxt = txt ? txt.split('·').map((x) => x.trim()) : [];
  return clean(row.descripcion_centro_costo) || clean(row.ceco_descripcion) || (fromTxt[1] ?? '');
}

/**
 * Resuelve “código — descripción”.
 * - Primero usa los campos del row.
 * - Si falta alguno, intenta resolverlo vía id_ceco consultando el índice.
 * - Nunca muestra el id; solo código y descripción.
 */
export function centroCostoDisplay(row: OCRowWithCeco, index?: CecoIndex): string {
  let code = codeFromRow(row);
  let desc = descFromRow(row);

  if ((!code || !desc) && typeof row.id_ceco === 'number' && index && index[row.id_ceco]) {
    const found = index[row.id_ceco];
    if (!code) code = clean(found.codigo);
    if (!desc) desc = clean(found.descripcion);
  }

  if (code && desc) return `${code} — ${desc}`;
  return code || desc || '';
}

/** Solo código (útil en otras vistas) */
export function centroCostoCode(row: OCRowWithCeco, index?: CecoIndex): string {
  let code = codeFromRow(row);
  if (!code && typeof row.id_ceco === 'number' && index && index[row.id_ceco]) {
    code = clean(index[row.id_ceco].codigo);
  }
  return code;
}
