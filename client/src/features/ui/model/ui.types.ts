/** Theme preference. `system` follows the OS setting reactively. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** The theme actually applied to the document. */
export type ResolvedTheme = 'light' | 'dark';

/** Row height for data tables; a standard control in enterprise grids. */
export type TableDensity = 'comfortable' | 'compact';

export interface UiState {
  theme: ThemePreference;
  /** Desktop: sidebar collapsed to an icon rail. */
  isSidebarCollapsed: boolean;
  /** Mobile/tablet: sidebar shown as an overlay drawer. */
  isMobileSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  tableDensity: TableDensity;
}
