import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store';

import { selectTheme, themeChanged } from '../model/ui.slice';
import type { ResolvedTheme, ThemePreference } from '../model/ui.types';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Reads and writes the theme preference, and applies the resolved theme to
 * `<html data-theme>` — the single hook that touches the DOM for theming.
 *
 * The matching inline script in `index.html` performs the same resolution
 * before React mounts, which is what prevents a flash of the wrong theme.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const preference = useAppSelector(selectTheme);

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light',
  );

  // Keep following the OS while the preference is `system`.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => (preference === 'system' ? systemTheme : preference),
    [preference, systemTheme],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      dispatch(themeChanged(next));
    },
    [dispatch],
  );

  /** Cycles light -> dark -> system, the pattern used by the toolbar toggle. */
  const cycleTheme = useCallback(() => {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    setTheme(order[(order.indexOf(preference) + 1) % order.length]);
  }, [preference, setTheme]);

  return { theme: preference, resolvedTheme, setTheme, cycleTheme };
}
