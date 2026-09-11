import { isAnyOf } from '@reduxjs/toolkit';

import { startAppListening } from '@/app/store/listener-middleware';
import { localStorageService, StorageKeys } from '@/lib/storage';

import { sidebarCollapsedSet, sidebarToggled, tableDensityChanged, themeChanged } from './ui.slice';

/**
 * Persists shell preferences.
 *
 * Doing this in a listener rather than in the reducer keeps reducers pure and
 * side-effect free — a hard requirement for predictable state replay — while
 * guaranteeing persistence happens on every path that changes the value.
 */
export function registerUiListeners(): void {
  startAppListening({
    actionCreator: themeChanged,
    effect: (action) => {
      localStorageService.set(StorageKeys.theme, action.payload);
    },
  });

  startAppListening({
    matcher: isAnyOf(sidebarToggled, sidebarCollapsedSet),
    effect: (_action, listenerApi) => {
      localStorageService.set(
        StorageKeys.sidebarCollapsed,
        listenerApi.getState().ui.isSidebarCollapsed,
      );
    },
  });

  startAppListening({
    actionCreator: tableDensityChanged,
    effect: (action) => {
      localStorageService.set(StorageKeys.tableDensity, action.payload);
    },
  });
}
