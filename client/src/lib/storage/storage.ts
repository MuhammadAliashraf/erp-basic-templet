/**
 * Namespaced, typed, failure-tolerant Web Storage wrapper.
 *
 * Direct `localStorage` access is banned in application code for three reasons:
 *  - it throws in Safari private mode and when quota is exceeded;
 *  - it returns `string | null`, forcing ad-hoc JSON parsing everywhere;
 *  - unnamespaced keys collide when several apps share an origin.
 */

export type StorageKind = 'local' | 'session';

/** Prefix for every key this application owns. */
const NAMESPACE = 'app';

function resolveDriver(kind: StorageKind): Storage | null {
  try {
    const driver = kind === 'local' ? window.localStorage : window.sessionStorage;
    // Touch the API: access alone throws in some privacy modes.
    const probe = `${NAMESPACE}.__probe__`;
    driver.setItem(probe, '1');
    driver.removeItem(probe);
    return driver;
  } catch {
    return null;
  }
}

function namespaced(key: string): string {
  return key.startsWith(`${NAMESPACE}.`) ? key : `${NAMESPACE}.${key}`;
}

function createStorage(kind: StorageKind) {
  // Resolved lazily so SSR / test environments without `window` do not break
  // at import time.
  let driver: Storage | null | undefined;
  const getDriver = () => (driver === undefined ? (driver = resolveDriver(kind)) : driver);

  return {
    /** Reads and parses a value, returning `fallback` on absence or corruption. */
    get<T>(key: string, fallback: T): T {
      const store = getDriver();
      if (!store) return fallback;

      try {
        const raw = store.getItem(namespaced(key));
        return raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        // Corrupted entry — drop it so the app recovers on the next write.
        this.remove(key);
        return fallback;
      }
    },

    /** Serialises and writes a value. Returns false when storage is unavailable. */
    set<T>(key: string, value: T): boolean {
      const store = getDriver();
      if (!store) return false;

      try {
        store.setItem(namespaced(key), JSON.stringify(value));
        return true;
      } catch {
        // Quota exceeded or blocked — never let persistence break a user flow.
        return false;
      }
    },

    remove(key: string): void {
      try {
        getDriver()?.removeItem(namespaced(key));
      } catch {
        /* no-op */
      }
    },

    /** Removes only this application's namespaced keys. */
    clear(): void {
      const store = getDriver();
      if (!store) return;

      try {
        const owned = Object.keys(store).filter((key) => key.startsWith(`${NAMESPACE}.`));
        owned.forEach((key) => store.removeItem(key));
      } catch {
        /* no-op */
      }
    },

    has(key: string): boolean {
      try {
        return getDriver()?.getItem(namespaced(key)) !== null;
      } catch {
        return false;
      }
    },

    /** Fully-qualified key, for `storage` event listeners across tabs. */
    resolveKey(key: string): string {
      return namespaced(key);
    },
  };
}

export const localStorageService = createStorage('local');
export const sessionStorageService = createStorage('session');
