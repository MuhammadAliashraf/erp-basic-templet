import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { localStorageService, StorageKeys } from '@/lib/storage';

import type { TableDensity, ThemePreference, UiState } from './ui.types';

/**
 * Local root-state shape used only by this slice's selectors.
 * Avoids the circular dependency: root-reducer → ui → ui.slice → store/types → root-reducer.
 */
interface UiRootState {
  ui: UiState;
}

/**
 * Shell/chrome state.
 *
 * Preferences are read from storage at construction and written back by a
 * listener (see `ui.listeners.ts`) rather than inside reducers, keeping
 * reducers pure.
 */
const initialState: UiState = {
  theme: localStorageService.get<ThemePreference>(StorageKeys.theme, 'system'),
  isSidebarCollapsed: localStorageService.get<boolean>(StorageKeys.sidebarCollapsed, false),
  isMobileSidebarOpen: false,
  isCommandPaletteOpen: false,
  tableDensity: localStorageService.get<TableDensity>(StorageKeys.tableDensity, 'comfortable'),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    themeChanged(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },

    sidebarToggled(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },

    sidebarCollapsedSet(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload;
    },

    mobileSidebarToggled(state) {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },

    mobileSidebarSet(state, action: PayloadAction<boolean>) {
      state.isMobileSidebarOpen = action.payload;
    },

    commandPaletteSet(state, action: PayloadAction<boolean>) {
      state.isCommandPaletteOpen = action.payload;
    },

    tableDensityChanged(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload;
    },
  },
});

export const {
  themeChanged,
  sidebarToggled,
  sidebarCollapsedSet,
  mobileSidebarToggled,
  mobileSidebarSet,
  commandPaletteSet,
  tableDensityChanged,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

export const selectTheme = (state: UiRootState) => state.ui.theme;
export const selectIsSidebarCollapsed = (state: UiRootState) => state.ui.isSidebarCollapsed;
export const selectIsMobileSidebarOpen = (state: UiRootState) => state.ui.isMobileSidebarOpen;
export const selectIsCommandPaletteOpen = (state: UiRootState) => state.ui.isCommandPaletteOpen;
export const selectTableDensity = (state: UiRootState) => state.ui.tableDensity;
