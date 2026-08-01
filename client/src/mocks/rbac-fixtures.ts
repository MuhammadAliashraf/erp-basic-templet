import type {
  AccessPolicy,
  PermissionDefinition,
  PermissionScope,
  Role,
} from '@/features/rbac';

/**
 * Seed data for the RBAC mock backend. Development only.
 *
 * The catalogue below is the demonstration that the client hardcodes nothing:
 * every key here arrives over HTTP, and deleting one makes the guards that name
 * it deny everyone — exactly as it would in production.
 */

const NOW = '2026-08-01T09:00:00.000Z';

interface PermissionSeed {
  key: string;
  name: string;
  scope: PermissionScope;
  group: string;
  description?: string;
  isSystem?: boolean;
}

const PERMISSION_SEEDS: PermissionSeed[] = [
  /* Access control — the module that administers the rest. */
  { key: 'roles:read', name: 'View roles', scope: 'page', group: 'Access control', isSystem: true, description: 'Open the roles screen and inspect assignments.' },
  { key: 'roles:create', name: 'Create roles', scope: 'button', group: 'Access control', isSystem: true },
  { key: 'roles:update', name: 'Edit roles', scope: 'button', group: 'Access control', isSystem: true },
  { key: 'roles:delete', name: 'Delete roles', scope: 'button', group: 'Access control', isSystem: true },
  { key: 'roles:assign', name: 'Assign permissions', scope: 'api', group: 'Access control', isSystem: true, description: 'Change which permissions a role grants.' },
  { key: 'permissions:read', name: 'View permission catalogue', scope: 'page', group: 'Access control', isSystem: true },
  { key: 'permissions:create', name: 'Create permissions', scope: 'button', group: 'Access control', isSystem: true },
  { key: 'permissions:update', name: 'Edit permissions', scope: 'button', group: 'Access control', isSystem: true },
  { key: 'permissions:delete', name: 'Delete permissions', scope: 'button', group: 'Access control', isSystem: true },

  /* User management — the module the template expects a product to add next. */
  { key: 'users:read', name: 'View users', scope: 'page', group: 'User management' },
  { key: 'users:create', name: 'Invite users', scope: 'button', group: 'User management' },
  { key: 'users:update', name: 'Edit users', scope: 'button', group: 'User management' },
  { key: 'users:delete', name: 'Delete users', scope: 'button', group: 'User management' },
  { key: 'users:activate', name: 'Activate and suspend users', scope: 'button', group: 'User management' },
  { key: 'users:assign-roles', name: 'Assign roles to users', scope: 'component', group: 'User management' },
  { key: 'users:export', name: 'Export the user list', scope: 'api', group: 'User management' },
  { key: 'users:field:email', name: 'See user email addresses', scope: 'field', group: 'User management' },
  { key: 'users:field:phone', name: 'See user phone numbers', scope: 'field', group: 'User management' },

  /* Reference module, to show scopes other than page and button. */
  { key: 'reports:read', name: 'View reports', scope: 'menu', group: 'Reporting' },
  { key: 'reports:export', name: 'Export reports', scope: 'api', group: 'Reporting' },
  { key: 'reports:schedule', name: 'Schedule reports', scope: 'component', group: 'Reporting' },
  { key: 'reports:field:cost', name: 'See cost figures', scope: 'field', group: 'Reporting', description: 'Unit costs and margin columns.' },

  { key: 'audit:read', name: 'View the audit log', scope: 'page', group: 'Compliance' },
  { key: 'audit:export', name: 'Export the audit log', scope: 'api', group: 'Compliance' },

  { key: 'settings:read', name: 'View settings', scope: 'page', group: 'Platform' },
  { key: 'settings:update', name: 'Change settings', scope: 'button', group: 'Platform' },
  { key: 'design-system:read', name: 'View the design system', scope: 'menu', group: 'Platform' },
];

export const MOCK_PERMISSIONS: PermissionDefinition[] = PERMISSION_SEEDS.map((seed, index) => {
  const [resource, ...actionSegments] = seed.key.split(':');

  return {
    id: `prm_${String(index + 1).padStart(6, '0')}`,
    key: seed.key,
    name: seed.name,
    description: seed.description,
    resource,
    action: actionSegments.join(':'),
    scope: seed.scope,
    group: seed.group,
    isSystem: seed.isSystem ?? false,
    createdAt: NOW,
    updatedAt: NOW,
  };
});

const ALL_KEYS = MOCK_PERMISSIONS.map((permission) => permission.key);

function defineRole(
  index: number,
  seed: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
): Role {
  return {
    id: `rol_${String(index).padStart(6, '0')}`,
    createdAt: NOW,
    updatedAt: NOW,
    createdBy: 'system',
    updatedBy: 'Alex Morgan',
    ...seed,
  };
}

/**
 * Five roles spanning the interesting cases: a superuser wildcard, a broad
 * administrator, a mid-level manager, a read-only auditor, and a role with an
 * explicit denial carved out of a wildcard grant.
 */
export const MOCK_ROLES: Role[] = [
  role(1, {
    key: 'platform-owner',
    name: 'Platform owner',
    description: 'Unrestricted. Break-glass access for the platform team.',
    isSystem: true,
    isDefault: false,
    permissions: ['*'],
    deniedPermissions: [],
    fieldRules: [],
    userCount: 2,
  }),

  role(2, {
    key: 'administrator',
    name: 'Administrator',
    description: 'Runs access control and user management day to day.',
    isSystem: true,
    isDefault: false,
    permissions: [
      'roles:*',
      'permissions:*',
      'users:*',
      'settings:read',
      'settings:update',
      'audit:read',
      'design-system:read',
    ],
    deniedPermissions: [],
    fieldRules: [],
    userCount: 6,
  }),

  role(3, {
    key: 'operations-manager',
    name: 'Operations manager',
    description: 'Manages people and reporting, but cannot change access rules.',
    isSystem: false,
    isDefault: false,
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'users:activate',
      'reports:read',
      'reports:export',
      'reports:schedule',
      'roles:read',
    ],
    deniedPermissions: [],
    // Cost figures are visible to finance, not to line management.
    fieldRules: [{ resource: 'reports', field: 'cost', access: 'hidden' }],
    userCount: 14,
  }),

  role(4, {
    key: 'auditor',
    name: 'Auditor',
    description: 'Read-only across the platform, including the audit log.',
    isSystem: false,
    isDefault: false,
    permissions: ['audit:read', 'audit:export', 'users:read', 'roles:read', 'permissions:read'],
    deniedPermissions: [],
    fieldRules: [
      { resource: 'users', field: 'phone', access: 'hidden' },
      { resource: 'users', field: 'email', access: 'read' },
    ],
    userCount: 3,
  }),

  role(5, {
    key: 'member',
    name: 'Member',
    description: 'The baseline every new account starts with.',
    isSystem: true,
    isDefault: true,
    permissions: ['reports:read', 'design-system:read'],
    deniedPermissions: ['reports:export'],
    fieldRules: [{ resource: 'reports', field: 'cost', access: 'hidden' }],
    userCount: 128,
  }),
];

/**
 * The policy the signed-in demo user receives.
 *
 * The maps are populated deliberately: they show the backend classifying menus,
 * routes, endpoints and fields, which is what lets a deployment tighten the UI
 * without a frontend release.
 */
export const MOCK_ACCESS_POLICY: AccessPolicy = {
  roles: ['platform-owner'],
  permissions: ['*'],
  denied: [],

  menus: {
    'access-roles': { anyOf: ['roles:read'] },
    'access-permissions': { anyOf: ['permissions:read'] },
    'design-system': { anyOf: ['design-system:read'] },
    'data-table': { anyOf: ['design-system:read'] },
  },

  routes: {
    '/access/roles': { anyOf: ['roles:read'] },
    '/access/permissions': { anyOf: ['permissions:read'] },
  },

  endpoints: {
    'GET /rbac/roles': { anyOf: ['roles:read'] },
    'POST /rbac/roles': { anyOf: ['roles:create'] },
    'PUT /rbac/roles/*': { anyOf: ['roles:assign'] },
    'DELETE /rbac/roles/*': { anyOf: ['roles:delete'] },
  },

  fields: {},

  version: '2026-08-01.1',
  issuedAt: NOW,
};

/** Expands the wildcards in a role's grants into the catalogue's real keys. */
export function expandPermissions(keys: readonly string[]): string[] {
  if (keys.includes('*')) return ['*'];

  const expanded = new Set<string>();

  for (const key of keys) {
    if (!key.endsWith(':*')) {
      expanded.add(key);
      continue;
    }

    const prefix = key.slice(0, -1);
    for (const candidate of ALL_KEYS) {
      if (candidate.startsWith(prefix)) expanded.add(candidate);
    }
  }

  return [...expanded];
}
