import { useCallback, useMemo } from 'react';

import { ACCESS_MAP } from '@/config/access';
import type { AccessRequirement } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

/** Endpoint keys are `METHOD /path`, e.g. `POST /rbac/roles`. */
export type EndpointKey = string;

export function toEndpointKey(method: string, path: string): EndpointKey {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${method.toUpperCase()} ${normalizedPath}`;
}

/**
 * Replaces concrete path segments with `*`, widest match last:
 * `GET /rbac/roles/rol_1` → `GET /rbac/roles/*` → `GET /rbac/*`.
 */
function endpointCandidates(key: EndpointKey): EndpointKey[] {
  const [method, path = ''] = key.split(' ');
  const segments = path.split('/').filter(Boolean);

  const candidates: EndpointKey[] = [key];

  for (let depth = segments.length - 1; depth >= 0; depth -= 1) {
    candidates.push(`${method} /${[...segments.slice(0, depth), '*'].join('/')}`);
  }

  return candidates;
}

/**
 * Authorisation for API endpoints.
 *
 * The server is the enforcer — this is not a security boundary. What it buys is
 * flow control: a wizard can skip a step the user could never submit, and a
 * bulk action can be withheld instead of firing a request that comes back 403.
 *
 * ```ts
 * const { canCall } = useApiAccess();
 * if (canCall('POST', '/rbac/roles')) …
 * ```
 */
export function useApiAccess() {
  const { can, requirementFor } = usePermissionContext();

  const requirementForEndpoint = useCallback(
    (method: string, path: string): AccessRequirement | undefined => {
      for (const candidate of endpointCandidates(toEndpointKey(method, path))) {
        const fromPolicy = requirementFor('endpoint', candidate);
        if (fromPolicy) return fromPolicy;

        const declared = ACCESS_MAP.endpoints[candidate];
        if (declared) return declared;
      }

      return undefined;
    },
    [requirementFor],
  );

  return useMemo(
    () => ({
      requirementForEndpoint,

      /** Undeclared endpoints are allowed: the server still has the final say. */
      canCall: (method: string, path: string) => can(requirementForEndpoint(method, path)),

      isDeclared: (method: string, path: string) =>
        requirementForEndpoint(method, path) !== undefined,
    }),
    [can, requirementForEndpoint],
  );
}
