import type { AccessRequirement } from '@/lib/access';

import { ROUTES } from './routes';

/**
 * Where permissions are required.
 *
 * This file declares *requirements*, never *grants*. It says "the roles screen
 * needs `roles:read`"; it never says who holds `roles:read` — that answer
 * arrives at runtime in the access policy, which is why adding a customer,
 * changing a role or tightening a screen needs no frontend release.
 *
 * Every entry here is a default. `policy.routes`, `policy.menus` and
 * `policy.endpoints` override it by the same key, so the backend can re-classify
 * any target without a deployment.
 *
 * Route paths are matched exactly, then by the longest declared ancestor, so a
 * rule on `/access` covers `/access/roles/:id` automatically.
 */
export interface AccessMap {
  /** Route path -> requirement. Consumed by `<RouteGuard>`. */
  routes: Record<string, AccessRequirement>;
  /** Navigation item id -> requirement. Consumed by the sidebar. */
  menus: Record<string, AccessRequirement>;
  /** `METHOD /path` -> requirement. Consumed by `useApiAccess`. */
  endpoints: Record<string, AccessRequirement>;
}

/** Requirements for the access-control module itself. */
const ROLES_READ: AccessRequirement = { anyOf: ['roles:read'] };
const PERMISSIONS_READ: AccessRequirement = { anyOf: ['permissions:read'] };

export const ACCESS_MAP: AccessMap = {
  routes: {
    [ROUTES.accessControl]: { anyOf: ['roles:read', 'permissions:read'] },
    [ROUTES.roles]: ROLES_READ,
    [ROUTES.roleDetail]: ROLES_READ,
    [ROUTES.permissions]: PERMISSIONS_READ,
  },

  menus: {
    'access-control': { anyOf: ['roles:read', 'permissions:read'] },
    'access-roles': ROLES_READ,
    'access-permissions': PERMISSIONS_READ,
  },

  endpoints: {
    'GET /rbac/roles': ROLES_READ,
    'POST /rbac/roles': { anyOf: ['roles:create'] },
    'PATCH /rbac/roles/*': { anyOf: ['roles:update'] },
    'PUT /rbac/roles/*': { anyOf: ['roles:assign'] },
    'DELETE /rbac/roles/*': { anyOf: ['roles:delete'] },

    'GET /rbac/permissions': PERMISSIONS_READ,
    'POST /rbac/permissions': { anyOf: ['permissions:create'] },
    'PATCH /rbac/permissions/*': { anyOf: ['permissions:update'] },
    'DELETE /rbac/permissions/*': { anyOf: ['permissions:delete'] },
  },
};
