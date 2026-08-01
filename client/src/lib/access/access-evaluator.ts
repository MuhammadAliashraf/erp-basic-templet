import { matchesPermission, normalizePermissionKey, toPermissionSet } from './permission-matcher';
import type {
  AccessRequirement,
  AccessRequirementInput,
  AccessSubject,
  FieldAccessLevel,
  FieldAccessRules,
  PermissionKey,
} from './types';

/**
 * Requirement evaluation.
 *
 * The decision procedure, in order:
 *   1. an explicit denial vetoes, whatever else is held (`noneOf`, `denials`);
 *   2. `allOf` must be fully satisfied;
 *   3. `anyOf` must be satisfied by at least one grant;
 *   4. `roles` must be satisfied by at least one role.
 *
 * Deny-overrides is the standard enterprise resolution strategy: it lets an
 * administrator carve an exception out of a broad grant without having to
 * decompose the grant itself.
 */

/** Nothing is required — used for unclassified targets. */
export const PUBLIC_REQUIREMENT: AccessRequirement = Object.freeze({ isPublic: true });

/** Builds a subject from the raw claims a session carries. */
export function createAccessSubject(input: {
  permissions?: readonly string[];
  denied?: readonly string[];
  roles?: readonly string[];
}): AccessSubject {
  return {
    grants: toPermissionSet(input.permissions),
    denials: toPermissionSet(input.denied),
    roles: toPermissionSet(input.roles),
  };
}

/** An empty subject: holds nothing, so every non-public requirement fails. */
export const EMPTY_SUBJECT: AccessSubject = createAccessSubject({});

/** Normalises the shorthand forms into a full requirement object. */
export function toAccessRequirement(
  input: AccessRequirementInput | null | undefined,
): AccessRequirement | null {
  if (input == null) return null;
  if (typeof input === 'string') return { anyOf: [input] };
  if (Array.isArray(input)) return input.length ? { anyOf: input } : null;
  return input as AccessRequirement;
}

/** True when the requirement places no constraint on anyone. */
export function isPublicRequirement(requirement: AccessRequirement | null): boolean {
  if (!requirement) return true;
  if (requirement.isPublic) return true;

  return (
    !requirement.anyOf?.length &&
    !requirement.allOf?.length &&
    !requirement.noneOf?.length &&
    !requirement.roles?.length
  );
}

/** A single capability check, honouring denials. */
export function isPermissionGranted(subject: AccessSubject, required: PermissionKey): boolean {
  if (matchesPermission(subject.denials, required)) return false;
  return matchesPermission(subject.grants, required);
}

export function hasAnyPermission(
  subject: AccessSubject,
  required: readonly PermissionKey[],
): boolean {
  return required.some((key) => isPermissionGranted(subject, key));
}

export function hasAllPermissions(
  subject: AccessSubject,
  required: readonly PermissionKey[],
): boolean {
  return required.every((key) => isPermissionGranted(subject, key));
}

export function hasAnyRole(subject: AccessSubject, roles: readonly string[]): boolean {
  return roles.some((role) => subject.roles.has(normalizePermissionKey(role)));
}

/** The single decision point every guard in the application funnels through. */
export function isRequirementSatisfied(
  subject: AccessSubject,
  input: AccessRequirementInput | null | undefined,
): boolean {
  const requirement = toAccessRequirement(input);
  if (isPublicRequirement(requirement)) return true;
  if (!requirement) return true;

  // Veto first: a denial must not be rescuable by a broad grant listed later.
  if (requirement.noneOf?.length && hasAnyPermission(subject, requirement.noneOf)) return false;

  if (requirement.allOf?.length && !hasAllPermissions(subject, requirement.allOf)) return false;
  if (requirement.anyOf?.length && !hasAnyPermission(subject, requirement.anyOf)) return false;
  if (requirement.roles?.length && !hasAnyRole(subject, requirement.roles)) return false;

  return true;
}

/**
 * Every requirement must hold — used where constraints stack, such as a nested
 * route inheriting its parent's rule, or a config declaration combined with a
 * server-supplied override.
 *
 * Evaluated one at a time rather than merged into a single object: two `anyOf`
 * clauses cannot be concatenated without silently *widening* access, which is
 * the wrong direction for a security control to fail in.
 */
export function isEveryRequirementSatisfied(
  subject: AccessSubject,
  inputs: readonly (AccessRequirementInput | null | undefined)[],
): boolean {
  return inputs.every((input) => isRequirementSatisfied(subject, input));
}

/** Collects the permission keys a requirement mentions, for diagnostics. */
export function describeRequirement(
  input: AccessRequirementInput | null | undefined,
): PermissionKey[] {
  const requirement = toAccessRequirement(input);
  if (!requirement) return [];

  return [
    ...(requirement.allOf ?? []),
    ...(requirement.anyOf ?? []),
    ...(requirement.roles ?? []).map((role) => `role:${role}`),
  ];
}

/* -------------------------------------------------------------------------- */
/* Field-level access                                                         */
/* -------------------------------------------------------------------------- */

const FIELD_SEPARATOR = '.';

/**
 * Resolves the level for `resource.field`, most specific rule first:
 * `orders.total` · `orders.*` · `*.total` · `*.*` · the caller's default.
 *
 * Field rules are how a product hides a salary column from a team lead while
 * leaving the rest of the record editable — the granularity that role-only
 * systems cannot express.
 */
export function resolveFieldAccess(
  rules: FieldAccessRules | undefined,
  resource: string,
  field: string,
  fallback: FieldAccessLevel = 'write',
): FieldAccessLevel {
  if (!rules) return fallback;

  const normalizedResource = normalizePermissionKey(resource);
  const normalizedField = normalizePermissionKey(field);

  const lookups = [
    `${normalizedResource}${FIELD_SEPARATOR}${normalizedField}`,
    `${normalizedResource}${FIELD_SEPARATOR}*`,
    `*${FIELD_SEPARATOR}${normalizedField}`,
    `*${FIELD_SEPARATOR}*`,
  ];

  for (const lookup of lookups) {
    const level = rules[lookup];
    if (level) return level;
  }

  return fallback;
}

export function canReadField(level: FieldAccessLevel): boolean {
  return level !== 'hidden';
}

export function canWriteField(level: FieldAccessLevel): boolean {
  return level === 'write';
}
