import { useEffect, useMemo, useRef, useState } from 'react';

import { appConfig } from '@/config/app.config';

/**
 * Debounces a rapidly-changing value.
 *
 * The canonical use is a search box: bind the input to state for instant
 * feedback, and pass the debounced value to the query so the network sees one
 * request per pause rather than one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = appConfig.ui.searchDebounceMs): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Debounces a callback, returning a stable function plus a `cancel` handle.
 * The latest callback is always invoked, so stale closures are not a hazard.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = appConfig.ui.searchDebounceMs,
): ((...args: TArgs) => void) & { cancel: () => void } {
  const callbackRef = useRef(callback);
  const delayRef = useRef(delayMs);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delayMs;
  }, [callback, delayMs]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // Built once via `useMemo` so the returned function keeps a stable identity.
  // The refs are read inside the closure at call time — never during render.
  return useMemo(() => {
    const debounced = (...args: TArgs) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayRef.current);
    };

    debounced.cancel = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    return debounced;
  }, []);
}
