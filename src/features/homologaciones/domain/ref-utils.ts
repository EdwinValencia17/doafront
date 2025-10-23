/** Dedupe + sort case-insensitive + numeric aware */
export function dedupeAndSortRefs(refs: string[] = []): string[] {
  const norm = refs.map(r => String(r ?? '').trim()).filter(Boolean);
  const uniq = Array.from(new Set(norm));
  return uniq.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
}
