/**
 * Authentication and authorisation contracts.
 *
 * Roles and permissions are typed as open string unions: the template ships a
 * sensible default set, and a product built on it extends the union without
 * editing this file's consumers.
 */

/** Coarse-grained role, typically used for navigation shaping. */
export type Role = 'admin' | 'manager' | 'user' | (string & {});

/**
 * Fine-grained capability, formatted `resource:action`.
 *
 * These are the claims the session carries. They are the *baseline* for
 * authorisation; the authority is the policy fetched by `features/rbac`, which
 * also defines how wildcards (`resource:*`, `*`) are matched.
 *
 * Authorisation checks should use permissions, not roles — roles change per
 * customer, permissions describe what the UI actually needs to gate.
 */
export type Permission = `${string}:${string}` | '*';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** Job title or department, rendered in the account menu. */
  title?: string;
  avatarUrl?: string;
  roles: Role[];
  permissions: Permission[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  /** Seconds until the access token expires. */
  expiresIn?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

/**
 * `idle` -> the session has not been checked yet (first paint).
 * `authenticating` -> a bootstrap or login request is in flight.
 * The distinction matters: routing must not redirect to /login while the
 * session is merely *unknown*.
 */
export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  /** Message from the last failed authentication attempt. */
  error: string | null;
  /** True once a session check has completed at least once. */
  isInitialized: boolean;
}
