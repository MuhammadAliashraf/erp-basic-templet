import { z } from 'zod';

import { optionalString, requiredString } from '@/lib/validation';

import { PERMISSION_SCOPES } from './rbac.types';

/**
 * Form schemas for role and permission administration.
 *
 * The catalogue of permission *values* is never validated against a client-side
 * list — that would reintroduce the hardcoding this module exists to remove.
 * Only the *shape* of a key is checked; the server rejects unknown keys.
 */

/** Machine keys are lowercase, colon-segmented and safe to put in a URL. */
export const permissionKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Permission key is required.')
  .max(120, 'Permission key is too long.')
  .regex(
    /^(\*|[a-z0-9-]+(:[a-z0-9-]+|:\*)*)$/,
    'Use lowercase segments separated by colons, e.g. "roles:update".',
  );

export const roleKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Role key is required.')
  .max(60, 'Role key is too long.')
  .regex(/^[a-z][a-z0-9-]*$/, 'Use lowercase letters, numbers and hyphens, starting with a letter.');

export const roleFormSchema = z.object({
  key: roleKeySchema,
  name: requiredString('Role name', 80),
  description: optionalString(280),
  isDefault: z.boolean().default(false),
  /** Assigned keys. Empty is legitimate: a role with no grants is a valid shell. */
  permissions: z.array(z.string()).default([]),
  deniedPermissions: z.array(z.string()).default([]),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const permissionFormSchema = z.object({
  key: permissionKeySchema,
  name: requiredString('Display name', 80),
  description: optionalString(280),
  scope: z.enum(PERMISSION_SCOPES),
  group: requiredString('Group', 60),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
