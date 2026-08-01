import type { AccessRequirementInput } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

/**
 * A single access answer, for the common case where a component needs one
 * boolean rather than the whole evaluator.
 *
 * ```tsx
 * const canDelete = useCan('roles:delete');
 * const canReview = useCan({ allOf: ['orders:read', 'orders:approve'] });
 * ```
 *
 * Prefer the `<Can>` component when the answer only decides whether a subtree
 * renders — it keeps the condition next to the markup it governs.
 */
export function useCan(requirement: AccessRequirementInput | null | undefined): boolean {
  return usePermissionContext().can(requirement);
}

/**
 * Access for a target whose requirement is declared server-side.
 *
 * The requirement is looked up in the policy by id, so tightening a screen is a
 * backend change rather than a release.
 */
export function useCanAccessTarget(
  kind: 'menu' | 'route' | 'endpoint',
  id: string,
  /** Used when the policy says nothing about this target. */
  fallbackRequirement?: AccessRequirementInput | null,
): boolean {
  const { can, requirementFor } = usePermissionContext();
  return can(requirementFor(kind, id) ?? fallbackRequirement);
}
