import "server-only";

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): T {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await loader();
  return cacheSet(key, value, ttlMs);
}
