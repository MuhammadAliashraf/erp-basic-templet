/**
 * Route path registry.
 *
 * Every path in the application is declared once here. Linking through
 * `ROUTES.settingsProfile` instead of a `'/settings/profile'` string literal
 * means a URL change is a single edit that TypeScript verifies, rather than a
 * grep across the codebase.
 *
 * The template ships only infrastructure routes. Product modules add their own
 * entries here and a matching lazy route in `app/router/routes.tsx`.
 */
export const ROUTES = {
  root: '/',

  /* Public */
  login: '/login',
  forgotPassword: '/forgot-password',

  /* Authenticated */
  dashboard: '/dashboard',

  /** Living reference for the design system — remove it in a real product. */
  designSystem: '/design-system',
  designSystemDataTable: '/design-system/data-table',

  /* Access control (RBAC administration) */
  accessControl: '/access',
  roles: '/access/roles',
  roleDetail: '/access/roles/:id',
  permissions: '/access/permissions',

  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsAppearance: '/settings/appearance',

  /* System */
  forbidden: '/403',
  notFound: '/404',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Fills the params of a parameterised path: `buildPath('/users/:id', { id })`. */
export function buildPath(path: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce<string>(
    (result, [key, value]) => result.replace(`:${key}`, encodeURIComponent(String(value))),
    path,
  );
}
