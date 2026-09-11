import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

import type { AccessRequirementInput, PermissionKey } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

export interface CanProps {
  /** Shorthand: a single key, a list (any-of), or a full requirement. */
  permission?: AccessRequirementInput;
  /** Holds at least one. */
  anyOf?: readonly PermissionKey[];
  /** Holds every one. */
  allOf?: readonly PermissionKey[];
  /** Holds none — a veto that outranks the grants above. */
  noneOf?: readonly PermissionKey[];
  /** Holds at least one of these roles. */
  roles?: readonly string[];

  /**
   * `hide` removes the subtree (the default, and the right answer for actions
   * a user will never be granted).
   *
   * `disable` keeps it visible but inert — use it when the control's absence
   * would make a familiar layout look broken, or when its existence is itself
   * useful information ("you could request this").
   */
  mode?: 'hide' | 'disable';

  /** Rendered in place of the subtree when access is denied. */
  fallback?: ReactNode;

  /** Rendered while the policy is still resolving. Defaults to nothing. */
  loading?: ReactNode;

  /**
   * A subtree, or a render prop when the caller needs the answer itself:
   * `<Can permission="x">{(allowed) => …}</Can>`.
   */
  children: ReactNode | ((isAllowed: boolean) => ReactNode);
}

/**
 * The component-level authorisation guard.
 *
 * ```tsx
 * <Can permission="roles:create">
 *   <Button variant="primary">New role</Button>
 * </Can>
 *
 * <Can allOf={['orders:read', 'orders:approve']} mode="disable">
 *   <Button>Approve</Button>
 * </Can>
 * ```
 *
 * Nothing is rendered until the policy has resolved, so a control never flashes
 * into view and then vanishes — the flicker that makes permission-driven UIs
 * feel untrustworthy.
 */
export function Can({
  permission,
  anyOf,
  allOf,
  noneOf,
  roles,
  mode = 'hide',
  fallback = null,
  loading = null,
  children,
}: CanProps) {
  const { can, isReady } = usePermissionContext();

  // An explicit `permission` wins; the individual props are the verbose form.
  const requirement: AccessRequirementInput | undefined =
    permission ?? (anyOf || allOf || noneOf || roles ? { anyOf, allOf, noneOf, roles } : undefined);

  const isAllowed = can(requirement);

  if (typeof children === 'function') {
    return <>{isReady ? children(isAllowed) : loading}</>;
  }

  if (!isReady) return <>{loading}</>;
  if (isAllowed) return <>{children}</>;

  if (mode === 'disable' && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      disabled: true,
      'aria-disabled': true,
      // Explains the inert control; without it a disabled button is a dead end.
      title: 'You do not have permission to perform this action.',
    });
  }

  return <>{fallback}</>;
}
