import type { AxiosError } from 'axios';

export async function retryOnNetwork<T>(
  fn: () => Promise<T>,
  max = 2,
  baseDelay = 300
): Promise<T> {
  let attempt = 0, last: unknown;
  while (attempt <= max) {
    try { return await fn(); }
    catch (e) {
      last = e;
      const ax = e as AxiosError;
      const networkFail = !ax.response; // CORS/PNA/caída red
      if (!networkFail || attempt === max) break;
      const jitter = Math.floor(Math.random() * 100);
      const wait = baseDelay * (2 ** attempt) + jitter; // 300, 600, 1200 (+jitter)
      await new Promise(r => setTimeout(r, wait));
      attempt++;
    }
  }
  throw last;
}
