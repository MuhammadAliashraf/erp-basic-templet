import { useMemo } from 'react';

import type { AccessRequirementInput, PermissionKey } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

/**
 * The general-purpose authorisation hook.
 *
 * ```ts
 * const { can, canAny, isReady } = useAccess();
 * if (can('roles:update')) …
 * if (can({ allOf: ['roles:read', 'users:read'] })) …
 * if (can({ anyOf: ['reports:export'], noneOf: ['account:suspended'] })) …
 * ```
 *
 * Every returned predicate is stable for a given policy, so passing them into
 * `useMemo` dependency lists or memoised children is safe.
 *
 * Reminder: these checks shape the interface. The server enforces the same
 * rules — a hidden button is a courtesy, not a control.
 */
export function useAccess() {
  const { can, isReady, isLoading, error, permissions, roles, subject, previewRoleKey, refresh } =
    usePermissionContext();

  return useMemo(
    () => ({
      /** True once the policy has resolved. Guards must wait on this. */
      isReady,
      isLoading,
      error,
      permissions,
      roles,
      previewRoleKey,
      refresh,

      can,
      cannot: (requirement: AccessRequirementInput | null | undefined) => !can(requirement),

      /** Holds at least one of the listed permissions. */
      canAny: (required: readonly PermissionKey[]) => can({ anyOf: required }),
      /** Holds every listed permission. */
      canAll: (required: readonly PermissionKey[]) => can({ allOf: required }),

      hasRole: (role: string) => can({ roles: [role] }),
      hasAnyRole: (required: readonly string[]) => can({ roles: required }),

      /** Raw indexed subject, for callers filtering large lists in one pass. */
      subject,
    }),
    [can, error, isLoading, isReady, permissions, previewRoleKey, refresh, roles, subject],
  );
}
