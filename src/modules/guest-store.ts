/**
 * guest-store.ts
 * Tiny persistent key-value store using localStorage.
 * Shared by wishlist.ts, recently-viewed.ts, and search.ts.
 */

export const GuestStore = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
