/**
 * Single registry of every persisted key.
 *
 * Centralising them makes storage migrations and "clear everything on logout"
 * auditable — grep one file instead of the whole codebase.
 */
export const StorageKeys = {
  /** 'light' | 'dark' | 'system' — also read by the inline script in index.html. */
  theme: 'theme',
  /** Whether the desktop sidebar is collapsed to icons. */
  sidebarCollapsed: 'sidebar.collapsed',
  /** Bearer access/refresh tokens (only when `authStrategy === 'bearer'`). */
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  /** Cached user profile, for optimistic shell rendering before /auth/me resolves. */
  user: 'auth.user',
  /** Persisted table density preference. */
  tableDensity: 'table.density',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
