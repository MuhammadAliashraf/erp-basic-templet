/**
 * Public surface of the RBAC feature.
 *
 * This feature owns *authorisation* — what the signed-in principal may see and
 * do. Identity belongs to `features/auth`, whose claims are consumed here as
 * the baseline until the server's policy arrives.
 *
 * The layers, from the bottom up:
 *
 *   lib/access          pure matching and evaluation, no React, no store
 *   model/              domain contracts, the permission slice, form schemas
 *   api/                roles, permissions and the effective policy
 *   context/            one evaluated subject published to the whole tree
 *   hooks/              useAccess · useCan · useFieldAccess · navigation · API
 *   guards/             Can · PermissionGuard · RouteGuard · FieldGuard
 *   components/         the administration surfaces
 *
 * Nothing in the bundle knows what any user holds. Grants arrive at runtime.
 */

export * from './api/rbac.api';
export * from './components/access-denied';
export * from './components/permission-button';
export * from './components/permission-form-dialog';
export * from './components/permission-matrix';
export * from './components/role-form-dialog';
export * from './components/role-preview-banner';
export type { AccessTargetKind, PermissionContextValue } from './context/permission-context';
export { usePermissionContext } from './context/permission-context';
export * from './context/permission-provider';
export * from './guards/can';
export * from './guards/field-guard';
export * from './guards/permission-guard';
export * from './guards/route-guard';
export * from './hooks/use-access';
export * from './hooks/use-api-access';
export * from './hooks/use-authorized-navigation';
export * from './hooks/use-can';
export * from './hooks/use-field-access';
export * from './hooks/use-role-preview';
export * from './hooks/use-route-access';
export * from './model/rbac.schemas';
export {
  accessPolicyCleared,
  accessPolicyFailed,
  accessPolicyResolved,
  rbacReducer,
  rolePreviewEnded,
  rolePreviewStarted,
  selectAccessError,
  selectAccessPolicy,
  selectIsAccessResolved,
  selectIsPreviewingRole,
  selectPreviewRoleKey,
} from './model/rbac.slice';
export type * from './model/rbac.types';
export { PERMISSION_SCOPES } from './model/rbac.types';
