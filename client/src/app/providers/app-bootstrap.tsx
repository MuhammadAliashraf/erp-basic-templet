import { type ReactNode, useEffect } from 'react';

import { useSessionBootstrap } from '@/features/auth';
import { useTheme } from '@/features/ui';

/**
 * Startup work that must run inside the Redux provider but before the router.
 *
 * Two responsibilities, both of which need store access:
 *   - resolve the session, so guards never see an unknown auth state;
 *   - apply the resolved theme to `<html>` and keep following the OS.
 *
 * Listener-middleware registration deliberately lives in `app/store`, not here:
 * it belongs to the store's lifetime rather than a mounted component's.
 *
 * Children render immediately — the *guards* decide what to show while the
 * session resolves, which keeps public routes instant.
 */
export function AppBootstrap({ children }: { children: ReactNode }) {
  useSessionBootstrap();
  const { resolvedTheme } = useTheme();

  // Keeps `color-scheme` in sync so native form controls and scrollbars match.
  useEffect(() => {
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return <>{children}</>;
}
