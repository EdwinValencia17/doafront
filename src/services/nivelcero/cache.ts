
type CacheEntry<T> = { at: number; data: T };

export function makeCache(TTL = 60_000) {
  const mem = new Map<string, CacheEntry<unknown>>();
  return {
    async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      const hit = mem.get(key); const now = Date.now();
      if (hit && now - hit.at < TTL) return hit.data as T;
      const data = await fetcher();
      mem.set(key, { at: now, data });
      return data;
    },
    clear(key?: string) {
      if (key) mem.delete(key); else mem.clear();
    }
  };
}
