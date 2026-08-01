/**
 * Router guards.
 *
 * Authentication only. Authorisation lives in `features/rbac` (`<RouteGuard>`),
 * so there is exactly one place that decides what a permission means.
 */
export * from './protected-route';
export * from './public-only-route';
