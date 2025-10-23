export function useClipboardCopy() {
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }
  return { copy };
}
