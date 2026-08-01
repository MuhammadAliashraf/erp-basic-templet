import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { ACCESS_MAP } from '@/config/access';
import type { AccessRequirement, AccessRequirementInput } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

export interface RouteAccess {
  /** The requirement that applied, after policy override. Null means public. */
  requirement: AccessRequirement | null;
  isAllowed: boolean;
  /** False while the policy resolves — never deny on this. */
  isReady: boolean;
}

/**
 * Resolves the requirement guarding a route path.
 *
 * Precedence: the server policy wins, the static declaration in
 * `config/access.ts` is the fallback, and an explicit `requirement` argument
 * overrides both — that last case is for routes whose rule depends on data the
 * config cannot know, such as a record's owner.
 *
 * Paths are matched exactly first, then by the longest declared prefix, so a
 * rule on `/access` automatically covers `/access/roles/:id` without every
 * child having to repeat it.
 */
export function useRouteAccess(
  path?: string,
  requirementOverride?: AccessRequirementInput | null,
): RouteAccess {
  const { pathname } = useLocation();
  const { can, requirementFor, isReady } = usePermissionContext();

  const targetPath = path ?? pathname;

  return useMemo(() => {
    const declared =
      requirementOverride ??
      requirementFor('route', targetPath) ??
      resolveDeclaredRouteRequirement(targetPath);

    const requirement = (declared as AccessRequirement | null | undefined) ?? null;

    return {
      requirement,
      isAllowed: can(declared),
      isReady,
    };
  }, [can, isReady, requirementFor, requirementOverride, targetPath]);
}

/** Exact match, then the longest declared ancestor path. */
function resolveDeclaredRouteRequirement(path: string): AccessRequirement | undefined {
  const routes = ACCESS_MAP.routes;

  const exact = routes[path];
  if (exact) return exact;

  let bestMatch: { length: number; requirement: AccessRequirement } | null = null;

  for (const [declaredPath, requirement] of Object.entries(routes)) {
    if (declaredPath === '/' || !path.startsWith(`${declaredPath}/`)) continue;
    if (!bestMatch || declaredPath.length > bestMatch.length) {
      bestMatch = { length: declaredPath.length, requirement };
    }
  }

  return bestMatch?.requirement;
}
