import { useCallback, useMemo } from 'react';

import { useAppSelector } from '@/app/store';

import { selectPermissions, selectRoles } from '../model/auth.slice';
import type { Permission, Role } from '../model/auth.types';

/**
 * Authorisation checks for the UI layer.
 *
 * Two conventions are supported:
 *  - exact match: `entity:read`
 *  - resource wildcard: a user holding `entity:*` satisfies any `entity:` check,
 *    and `*` (superuser) satisfies everything.
 *
 * These checks shape the interface only. The server must enforce the same rules
 * — hiding a button is not access control.
 */
export function usePermissions() {
  const permissions = useAppSelector(selectPermissions);
  const roles = useAppSelector(selectRoles);

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);
  const roleSet = useMemo(() => new Set(roles), [roles]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (permissionSet.has('*')) return true;
      if (permissionSet.has(permission)) return true;

      const [resource] = permission.split(':');
      return permissionSet.has(`${resource}:*`);
    },
    [permissionSet],
  );

  /** True when the user holds at least one of the listed permissions. */
  const hasAnyPermission = useCallback(
    (required: readonly Permission[]): boolean => required.some(hasPermission),
    [hasPermission],
  );

  /** True only when the user holds every listed permission. */
  const hasAllPermissions = useCallback(
    (required: readonly Permission[]): boolean => required.every(hasPermission),
    [hasPermission],
  );

  const hasRole = useCallback((role: Role): boolean => roleSet.has(role), [roleSet]);

  const hasAnyRole = useCallback(
    (required: readonly Role[]): boolean => required.some((role) => roleSet.has(role)),
    [roleSet],
  );

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };
}
