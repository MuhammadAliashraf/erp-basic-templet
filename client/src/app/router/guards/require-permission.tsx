import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { ROUTES } from '@/config/routes';
import { type Permission, usePermissions } from '@/features/auth';

export interface RequirePermissionProps {
  /** Permissions to test against the current user. */
  permissions: readonly Permission[];
  /** `any` (default) needs one; `all` needs every one. */
  mode?: 'any' | 'all';
  /** Rendered instead of redirecting — for gating a region rather than a route. */
  fallback?: ReactNode;
  children?: ReactNode;
}

/**
 * Authorisation gate.
 *
 * Works as a route element (renders an `<Outlet>`) or as a wrapper around any
 * subtree. Reminder: this shapes the interface only. The server must enforce
 * the same rules — anything reachable by URL is reachable by fetch.
 */
export function RequirePermission({
  permissions,
  mode = 'any',
  fallback,
  children,
}: RequirePermissionProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const isAllowed =
    mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

  if (!isAllowed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
