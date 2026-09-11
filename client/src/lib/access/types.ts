/**
 * Authorisation primitives.
 *
 * This module is deliberately free of React, Redux and any knowledge of the
 * backend: it describes *how* an access decision is made, never *what* the
 * current user holds. Grants always arrive at runtime from the server, which is
 * what keeps the client free of hardcoded permissions.
 */

/**
 * A capability, formatted as colon-separated segments: `roles:create`,
 * `billing:invoices:export`.
 *
 * Typed as a plain string on purpose. A literal union would have to be edited
 * every time the backend grows a permission, which is exactly the coupling this
 * system exists to remove.
 */
export type PermissionKey = string;

/** How much of a field the current user may see. */
export type FieldAccessLevel = 'hidden' | 'read' | 'write';

/**
 * A declarative access rule.
 *
 * Clauses combine with AND: every clause present must pass. Within `anyOf` the
 * test is OR, within `allOf` it is AND, and `noneOf` is a veto. An empty
 * requirement (or `isPublic`) allows everyone — the safe default for a screen
 * that has not been classified yet is decided by the caller, not here.
 */
export interface AccessRequirement {
  /** Passes when the subject holds at least one of these. */
  anyOf?: readonly PermissionKey[];
  /** Passes only when the subject holds every one of these. */
  allOf?: readonly PermissionKey[];
  /** Fails when the subject holds any of these — a veto that outranks grants. */
  noneOf?: readonly PermissionKey[];
  /** Passes when the subject holds at least one of these roles. */
  roles?: readonly string[];
  /** Marks the target as intentionally unrestricted. */
  isPublic?: boolean;
}

/**
 * Ergonomic shorthand accepted everywhere a requirement is expected:
 * `'roles:read'`, `['roles:read', 'roles:update']` (any-of), or the full object.
 */
export type AccessRequirementInput = PermissionKey | readonly PermissionKey[] | AccessRequirement;

/**
 * The evaluated principal: what the current session holds, indexed for O(1)
 * lookup. Built once per policy change and shared by every check in the tree.
 */
export interface AccessSubject {
  grants: ReadonlySet<PermissionKey>;
  /** Explicit denials. A denial always beats a grant, including `*`. */
  denials: ReadonlySet<PermissionKey>;
  roles: ReadonlySet<string>;
}

/** Field-level rules, keyed `resource.field`. Both parts accept `*`. */
export type FieldAccessRules = Readonly<Record<string, FieldAccessLevel>>;
