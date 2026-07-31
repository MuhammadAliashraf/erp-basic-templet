import { env } from './env';

/**
 * Application-wide constants.
 *
 * Anything a downstream product may want to re-brand or re-tune lives here, so
 * forking the template means editing one file rather than hunting through
 * components.
 */
export const appConfig = Object.freeze({
  name: env.appName,
  shortName: 'EA',
  /** Suffix appended by `useDocumentTitle`. */
  titleSuffix: env.appName,
  version: __APP_VERSION__,

  api: {
    baseUrl: env.apiBaseUrl,
    timeout: env.apiTimeout,
    /** Retry budget for idempotent requests that fail with a network error. */
    retryCount: 2,
    retryDelayMs: 400,
  },

  auth: {
    strategy: env.authStrategy,
    /** Refresh the access token this many ms before it expires. */
    refreshSkewMs: 60_000,
    loginPath: '/login',
    /** Where a user lands after authenticating with no `redirectTo` present. */
    defaultAuthenticatedPath: '/dashboard',
  },

  ui: {
    /** Tailwind breakpoints, mirrored in TS so hooks and CSS cannot drift. */
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    /** Below this width the sidebar becomes an overlay drawer. */
    sidebarOverlayBelow: 1024,
    toastDurationMs: 5_000,
    toastLimit: 4,
    tableDefaultPageSize: 25,
    tablePageSizeOptions: [10, 25, 50, 100],
    /** Debounce applied to search inputs before they hit the network. */
    searchDebounceMs: 300,
  },
} as const);

export type AppConfig = typeof appConfig;
