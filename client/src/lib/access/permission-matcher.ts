import type { PermissionKey } from './types';

/**
 * Permission key matching.
 *
 * One algorithm, used by every guard, hook and menu filter in the application.
 * Keeping it here — pure, synchronous and dependency-free — is what makes the
 * rules testable and prevents a second, subtly different implementation from
 * appearing in a component.
 */

/** Grants everything. Reserve it for break-glass and platform-owner roles. */
export const SUPERUSER_GRANT = '*';

export const PERMISSION_SEPARATOR = ':';

/** Matches any single segment inside a key: `roles:*`, `billing:invoices:*`. */
export const SEGMENT_WILDCARD = '*';

/**
 * Every grant that would satisfy `required`, widest first.
 *
 * `billing:invoices:export` is satisfied by, in order:
 *   `*` · `billing:*` · `billing:invoices:*` · `billing:invoices:export`
 *
 * Widest-first matters: superuser sessions — the common case in admin tooling —
 * exit on the first lookup.
 */
export function permissionCandidates(required: PermissionKey): PermissionKey[] {
  const segments = required.split(PERMISSION_SEPARATOR);
  const candidates: PermissionKey[] = [SUPERUSER_GRANT];

  for (let index = 0; index < segments.length - 1; index += 1) {
    candidates.push(
      `${segments.slice(0, index + 1).join(PERMISSION_SEPARATOR)}${PERMISSION_SEPARATOR}${SEGMENT_WILDCARD}`,
    );
  }

  candidates.push(required);
  return candidates;
}

/**
 * Candidate lists are recomputed on every render of every guarded node, so they
 * are cached. The key space is the permission catalogue — bounded, small, and
 * stable for the lifetime of the tab — so an unbounded map is appropriate here.
 */
const candidateCache = new Map<PermissionKey, PermissionKey[]>();

function cachedCandidates(required: PermissionKey): PermissionKey[] {
  const cached = candidateCache.get(required);
  if (cached) return cached;

  const candidates = permissionCandidates(required);
  candidateCache.set(required, candidates);
  return candidates;
}

/**
 * Keys are compared case-insensitively and trimmed, so `Roles:Read` from a
 * hand-written config still matches `roles:read` from the server.
 */
export function normalizePermissionKey(key: string): PermissionKey {
  return key.trim().toLowerCase();
}

export function toPermissionSet(keys: readonly string[] | undefined): Set<PermissionKey> {
  const set = new Set<PermissionKey>();
  for (const key of keys ?? []) {
    if (typeof key !== 'string') continue;
    const normalized = normalizePermissionKey(key);
    if (normalized) set.add(normalized);
  }
  return set;
}

/** True when any key in `held` — exactly or by wildcard — covers `required`. */
export function matchesPermission(
  held: ReadonlySet<PermissionKey>,
  required: PermissionKey,
): boolean {
  if (held.size === 0) return false;

  const normalized = normalizePermissionKey(required);
  if (!normalized) return false;

  return cachedCandidates(normalized).some((candidate) => held.has(candidate));
}
