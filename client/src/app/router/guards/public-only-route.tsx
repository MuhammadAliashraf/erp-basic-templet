import { Navigate, Outlet, useSearchParams } from 'react-router';

import { PageLoader } from '@/components/feedback';
import { appConfig } from '@/config/app.config';
import { useAuth } from '@/features/auth';

/**
 * Keeps signed-in users off the login and password-reset screens.
 *
 * Honours `?redirectTo=` so the deep link captured by `ProtectedRoute` is
 * restored once authentication succeeds.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [searchParams] = useSearchParams();

  if (!isInitialized) {
    return <PageLoader isFullScreen label="Checking your session" />;
  }

  if (isAuthenticated) {
    const redirectTo = searchParams.get('redirectTo');

    // Only same-origin relative paths are honoured — accepting an arbitrary
    // value here would be an open-redirect vulnerability.
    const isSafeRedirect =
      redirectTo != null && redirectTo.startsWith('/') && !redirectTo.startsWith('//');

    return (
      <Navigate
        to={isSafeRedirect ? redirectTo : appConfig.auth.defaultAuthenticatedPath}
        replace
      />
    );
  }

  return <Outlet />;
}
