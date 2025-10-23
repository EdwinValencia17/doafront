import type { FlujoRow } from '../types';
import type { ApiPayload } from '../common/api-types';
import { toArray, safeParseArray } from '../common/api-types';

export function mapFlujoPayload(payload: ApiPayload<FlujoRow>): FlujoRow[] {
  const rows = toArray(payload);
  return rows.map((r) => ({
    ...r,
    personas: Array.isArray(r.personas)
      ? r.personas
      : typeof r.personas === 'string'
        ? safeParseArray<NonNullable<FlujoRow['personas']>[0]>(r.personas)
        : [],
  }));
}
