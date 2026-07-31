import { useSyncExternalStore } from 'react';

import { appConfig } from '@/config/app.config';

/**
 * Subscribes to a CSS media query.
 *
 * Built on `useSyncExternalStore` rather than `useState` + `useEffect`: it is
 * tear-free under concurrent rendering and reports the correct value on the
 * very first render, avoiding a layout flash on mount.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', onStoreChange);
    return () => mediaQuery.removeEventListener('change', onStoreChange);
  };

  const getSnapshot = () => window.matchMedia(query).matches;
  // Server/prerender snapshot: assume the desktop-first default.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

type Breakpoint = keyof typeof appConfig.ui.breakpoints;

/** True at or above the named Tailwind breakpoint. */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${appConfig.ui.breakpoints[breakpoint]}px)`);
}

/**
 * Coarse device buckets for layout decisions that CSS alone cannot express —
 * for example swapping a data table for a card list, or a sidebar for a drawer.
 */
export function useResponsive() {
  const isMdUp = useBreakpoint('md');
  const isLgUp = useBreakpoint('lg');
  const isXlUp = useBreakpoint('xl');

  return {
    isMobile: !isMdUp,
    isTablet: isMdUp && !isLgUp,
    isDesktop: isLgUp,
    isWide: isXlUp,
    /** Below this the sidebar must behave as an overlay drawer. */
    isCompactLayout: !isLgUp,
  };
}
