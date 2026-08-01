import { createContext, useContext } from 'react';

import type {
  AccessRequirement,
  AccessRequirementInput,
  AccessSubject,
  FieldAccessLevel,
  PermissionKey,
} from '@/lib/access';

import type { AccessPolicy } from '../model/rbac.types';

/**
 * The evaluation context every guard, hook and menu filter reads from.
 *
 * Centralising it is not ceremony: the subject is an indexed set built once per
 * policy change, so a screen with two hundred guarded controls performs two
 * hundred set lookups rather than two hundred array scans, and a policy refresh
 * re-renders them all exactly once.
 */

/** Which server-supplied requirement map to consult. */
export type AccessTargetKind = 'menu' | 'route' | 'endpoint';

export interface PermissionContextValue {
  /**
   * False while the policy is still being resolved.
   *
   * Guards must wait on this rather than denying: rendering "access denied"
   * before the answer has arrived is the single most common bug in
   * permission-driven UIs.
   */
  isReady: boolean;
  isLoading: boolean;
  /** Set when policy resolution failed; the session falls back to its claims. */
  error: string | null;

  /** Indexed grants, denials and roles for the effective principal. */
  subject: AccessSubject;
  policy: AccessPolicy | null;
  permissions: readonly PermissionKey[];
  roles: readonly string[];

  /** Non-null while an administrator is previewing the UI as another role. */
  previewRoleKey: string | null;

  /** The one decision point. Accepts a key, a list (any-of) or a requirement. */
  can: (requirement: AccessRequirementInput | null | undefined) => boolean;

  /** Server-declared requirement for a menu id, route path or endpoint. */
  requirementFor: (kind: AccessTargetKind, id: string) => AccessRequirement | undefined;

  fieldAccess: (resource: string, field: string) => FieldAccessLevel;

  /** Re-fetches the policy, e.g. after the current user's role was edited. */
  refresh: () => void;
}

export const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * Raw access to the permission context.
 *
 * Prefer `useAccess`, `useCan` or `useFieldAccess` in components — they are the
 * intention-revealing API. Reach for this when you need the policy itself.
 */
export function usePermissionContext(): PermissionContextValue {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error(
      'Permission hooks must be used inside <PermissionProvider>. ' +
        'It is mounted in app/providers/app-providers.tsx.',
    );
  }

  return context;
}
