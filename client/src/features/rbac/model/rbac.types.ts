import type {
  AccessRequirement,
  FieldAccessLevel,
  FieldAccessRules,
  PermissionKey,
} from '@/lib/access';

/**
 * RBAC domain contracts.
 *
 * The client ships no permission list of its own. Roles, permissions and the
 * effective policy are all fetched, so adding a capability is a backend change
 * plus — at most — one declaration of *where* it is required.
 */

/**
 * Which layer of the application a permission governs.
 *
 * A single engine enforces all of them; the scope exists so the administration
 * UI can group the catalogue the way operators think about it, and so a review
 * can answer "what does this role actually reach?" without reading code.
 */
export const PERMISSION_SCOPES = [
  'menu',
  'route',
  'page',
  'component',
  'button',
  'field',
  'api',
  'data',
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export interface PermissionDefinition {
  id: string;
  /** The key checked at runtime, e.g. `roles:update`. */
  key: PermissionKey;
  name: string;
  description?: string;
  /** First key segment — the thing being protected. */
  resource: string;
  /** Remaining segments — what may be done to it. */
  action: string;
  scope: PermissionScope;
  /** Grouping label for the catalogue and the assignment matrix. */
  group: string;
  /** System permissions are referenced by the platform and cannot be deleted. */
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Per-field visibility attached to a role. */
export interface FieldRule {
  resource: string;
  field: string;
  access: FieldAccessLevel;
}

export interface Role {
  id: string;
  /** Stable machine key, e.g. `operations-manager`. Never renamed. */
  key: string;
  name: string;
  description?: string;
  /** Built-in roles cannot be deleted and their key cannot change. */
  isSystem: boolean;
  /** Assigned automatically to new users. */
  isDefault: boolean;
  permissions: PermissionKey[];
  /** Explicit exclusions carved out of a broader grant. */
  deniedPermissions: PermissionKey[];
  fieldRules: FieldRule[];
  /** Number of users currently holding the role. */
  userCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/** Payload for creating or replacing a role. */
export interface RoleWritePayload {
  key: string;
  name: string;
  description?: string;
  isDefault: boolean;
  permissions: PermissionKey[];
  deniedPermissions?: PermissionKey[];
  fieldRules?: FieldRule[];
}

export interface PermissionWritePayload {
  key: PermissionKey;
  name: string;
  description?: string;
  scope: PermissionScope;
  group: string;
}

/**
 * The authorisation contract for the current session, resolved server-side.
 *
 * `permissions` is the flattened, already-expanded grant set — the client never
 * walks a role graph, which keeps a role-hierarchy change from becoming a
 * frontend release.
 *
 * The four maps make menu, route, API and field decisions data rather than
 * code: the backend can tighten any of them without a deployment.
 */
export interface AccessPolicy {
  roles: string[];
  permissions: PermissionKey[];
  /** Deny-overrides: these beat anything in `permissions`. */
  denied: PermissionKey[];
  /** Navigation item id -> requirement. Overrides the client declaration. */
  menus: Record<string, AccessRequirement>;
  /** Route path -> requirement. Overrides the client declaration. */
  routes: Record<string, AccessRequirement>;
  /** `METHOD /path` -> requirement, for pre-flighting API calls. */
  endpoints: Record<string, AccessRequirement>;
  /** `resource.field` -> level. */
  fields: FieldAccessRules;
  /** Changes whenever the policy is re-issued; used to detect staleness. */
  version: string;
  issuedAt: string;
}

/** Query parameters accepted by the permission catalogue endpoint. */
export interface PermissionQueryParams {
  search?: string;
  scope?: PermissionScope;
  resource?: string;
}

/** Re-exported so consumers need only the feature barrel. */
export type { AccessRequirement, FieldAccessLevel, PermissionKey };
