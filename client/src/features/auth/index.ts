/**
 * Public surface of the auth feature.
 *
 * Everything outside `features/auth` imports from this barrel only — the
 * `no-restricted-imports` ESLint rule enforces it. Internals can therefore be
 * refactored freely as long as this contract holds.
 *
 * Scope: this feature answers *who you are*. What you may do is
 * `features/rbac`, which consumes the claims exported here as its baseline.
 * Keeping the two apart is what stops a second, subtly different authorisation
 * check from growing inside the login flow.
 */

export * from './api/auth.api';
export * from './components/login-form';
export * from './hooks/use-auth';
export * from './hooks/use-session-bootstrap';
export * from './model/auth.schemas';
export {
  authenticationFailed,
  authenticationStarted,
  authReducer,
  errorCleared,
  selectAuthError,
  selectAuthState,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectPermissions,
  selectRoles,
  sessionEnded,
  sessionEstablished,
  userUpdated,
} from './model/auth.slice';
export type * from './model/auth.types';
