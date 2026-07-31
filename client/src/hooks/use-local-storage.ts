import { useCallback, useEffect, useState } from 'react';

import { localStorageService } from '@/lib/storage';

/**
 * `useState` backed by localStorage, synchronised across browser tabs.
 *
 * Cross-tab sync matters in admin tooling: operators routinely keep several
 * tabs open, and a preference changed in one should not be silently reverted by
 * another.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => localStorageService.get(key, initialValue));

  const setStoredValue = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = next instanceof Function ? next(current) : next;
        localStorageService.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const removeStoredValue = useCallback(() => {
    localStorageService.remove(key);
    setValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    const namespacedKey = localStorageService.resolveKey(key);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== namespacedKey) return;
      setValue(localStorageService.get(key, initialValue));
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [value, setStoredValue, removeStoredValue] as const;
}
