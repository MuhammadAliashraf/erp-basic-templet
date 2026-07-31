import { Navigate, Outlet, useLocation } from 'react-router';

import { PageLoader } from '@/components/feedback';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth';

/**
 * Gate for authenticated areas.
 *
 * Renders nothing decisive until the session has been resolved. Redirecting
 * while auth is merely *unknown* is the bug that logs users out on every
 * refresh, so `isInitialized` is checked before `isAuthenticated`.
 *
 * The attempted URL is carried in `?redirectTo=` so a deep link survives the
 * detour through the login screen.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <PageLoader isFullScreen label="Checking your session" />;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    const target =
      redirectTo && redirectTo !== '/'
        ? `${ROUTES.login}?redirectTo=${encodeURIComponent(redirectTo)}`
        : ROUTES.login;

    // `replace` keeps the protected URL out of history, so Back does not
    // bounce the user through the redirect again.
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
