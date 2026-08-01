import { type ReactNode, useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { selectPermissions, selectRoles, useAuth } from '@/features/auth';
import {
  type AccessRequirementInput,
  createAccessSubject,
  type FieldAccessLevel,
  type FieldAccessRules,
  isRequirementSatisfied,
  resolveFieldAccess,
} from '@/lib/access';
import { isHttpError } from '@/lib/http';

import { useGetAccessPolicyQuery, useGetAllRolesQuery } from '../api/rbac.api';
import {
  accessPolicyCleared,
  accessPolicyFailed,
  accessPolicyResolved,
  selectAccessError,
  selectAccessPolicy,
  selectIsAccessResolved,
  selectPreviewRoleKey,
} from '../model/rbac.slice';
import type { FieldRule } from '../model/rbac.types';
import {
  type AccessTargetKind,
  PermissionContext,
  type PermissionContextValue,
} from './permission-context';

/** Turns a role's field rules into the flat `resource.field` map the engine reads. */
function toFieldRules(rules: readonly FieldRule[] | undefined): FieldAccessRules {
  const result: Record<string, FieldAccessLevel> = {};
  for (const rule of rules ?? []) {
    result[`${rule.resource}.${rule.field}`.toLowerCase()] = rule.access;
  }
  return result;
}

/**
 * Resolves the effective authorisation policy and publishes it to the tree.
 *
 * Three layers, narrowest last:
 *   1. the claims carried by the session — enough to render the shell instantly
 *      on a reload, and the fallback if the policy endpoint is unavailable;
 *   2. the policy fetched from `/rbac/me/policy` — the authority, and the
 *      reason no permission is compiled into this bundle;
 *   3. an optional role preview, which narrows the interface locally so an
 *      administrator can see what a role will actually look like.
 *
 * Mounted once, above the router.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAuth();

  /* Session claims — the baseline. */
  const claimPermissions = useAppSelector(selectPermissions);
  const claimRoles = useAppSelector(selectRoles);

  const policy = useAppSelector(selectAccessPolicy);
  const isResolved = useAppSelector(selectIsAccessResolved);
  const error = useAppSelector(selectAccessError);
  const previewRoleKey = useAppSelector(selectPreviewRoleKey);

  const {
    data: fetchedPolicy,
    error: policyError,
    isFetching,
    refetch,
  } = useGetAccessPolicyQuery(undefined, {
    // Waiting for the session avoids an unauthenticated request on first paint.
    skip: !isInitialized || !isAuthenticated,
  });

  /** Only needed while previewing — the picker itself is behind `roles:read`. */
  const { data: allRoles } = useGetAllRolesQuery(undefined, { skip: !previewRoleKey });

  /* Mirror the query result into the slice so evaluation has one synchronous
     source and a preview can be layered over it. */
  useEffect(() => {
    if (fetchedPolicy) dispatch(accessPolicyResolved(fetchedPolicy));
  }, [dispatch, fetchedPolicy]);

  useEffect(() => {
    if (!policyError) return;
    const message = isHttpError(policyError)
      ? policyError.message
      : 'The access policy could not be loaded.';
    dispatch(accessPolicyFailed(message));
  }, [dispatch, policyError]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) dispatch(accessPolicyCleared());
  }, [dispatch, isAuthenticated, isInitialized]);

  const previewedRole = useMemo(
    () => (previewRoleKey ? allRoles?.find((role) => role.key === previewRoleKey) : undefined),
    [allRoles, previewRoleKey],
  );

  const permissions = useMemo<readonly string[]>(() => {
    if (previewedRole) return previewedRole.permissions;
    return policy?.permissions ?? claimPermissions;
  }, [claimPermissions, policy, previewedRole]);

  const roles = useMemo<readonly string[]>(() => {
    if (previewedRole) return [previewedRole.key];
    return policy?.roles ?? claimRoles;
  }, [claimRoles, policy, previewedRole]);

  const denied = useMemo<readonly string[]>(() => {
    if (previewedRole) return previewedRole.deniedPermissions;
    return policy?.denied ?? [];
  }, [policy, previewedRole]);

  const subject = useMemo(
    () => createAccessSubject({ permissions, denied, roles }),
    [denied, permissions, roles],
  );

  const fieldRules = useMemo<FieldAccessRules>(() => {
    if (previewedRole) return { ...policy?.fields, ...toFieldRules(previewedRole.fieldRules) };
    return policy?.fields ?? {};
  }, [policy, previewedRole]);

  const can = useCallback(
    (requirement: AccessRequirementInput | null | undefined) =>
      isRequirementSatisfied(subject, requirement),
    [subject],
  );

  const requirementFor = useCallback(
    (kind: AccessTargetKind, id: string) => {
      if (!policy) return undefined;
      if (kind === 'menu') return policy.menus[id];
      if (kind === 'route') return policy.routes[id];
      return policy.endpoints[id];
    },
    [policy],
  );

  const fieldAccess = useCallback(
    (resource: string, field: string) => resolveFieldAccess(fieldRules, resource, field),
    [fieldRules],
  );

  const refresh = useCallback(() => void refetch(), [refetch]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      // An unauthenticated tree has nothing to wait for; a preview is resolved
      // the moment the role it names is in hand.
      isReady:
        (!isAuthenticated && isInitialized) ||
        (isResolved && (!previewRoleKey || previewedRole !== undefined)),
      isLoading: isFetching,
      error,
      subject,
      policy,
      permissions,
      roles,
      previewRoleKey,
      can,
      requirementFor,
      fieldAccess,
      refresh,
    }),
    [
      can,
      error,
      fieldAccess,
      isAuthenticated,
      isFetching,
      isInitialized,
      isResolved,
      permissions,
      policy,
      previewRoleKey,
      previewedRole,
      refresh,
      requirementFor,
      roles,
      subject,
    ],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
