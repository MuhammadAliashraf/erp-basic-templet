import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { PageLoader } from '@/components/feedback';
import { ROUTES } from '@/config/routes';
import { type AccessRequirementInput, describeRequirement } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';
import { useRouteAccess } from '../hooks/use-route-access';

/** Carried to `/403` so the page can say what was attempted and why it failed. */
export interface ForbiddenRouteState {
  from: string;
  requiredPermissions: string[];
}

export interface RouteGuardProps {
  /**
   * Overrides the declared requirement. Omit it — the usual case — and the rule
   * is looked up from the access policy, falling back to `config/access.ts`.
   */
  requirement?: AccessRequirementInput;
  /** Defaults to `<Outlet>`, so the guard can wrap a branch of the route tree. */
  children?: ReactNode;
}

/**
 * Route-level authorisation.
 *
 * ```tsx
 * { element: <RouteGuard />, children: [ … ] }          // declared in config/access
 * { element: <RouteGuard requirement="reports:read" /> } // inline override
 * ```
 *
 * Two behaviours are deliberate:
 *
 * It *waits*. While the policy resolves the guard renders a loader rather than
 * a denial — bouncing a permitted user to `/403` for 300ms and then back is the
 * defining bug of client-side authorisation.
 *
 * It *redirects* rather than rendering in place, so the address bar tells the
 * truth. A denied deep link that keeps its original URL invites the user to
 * refresh forever; `/403` with the attempt in history does not.
 */
export function RouteGuard({ requirement, children }: RouteGuardProps) {
  const location = useLocation();
  const { isReady } = usePermissionContext();
  const { isAllowed, requirement: resolvedRequirement } = useRouteAccess(
    location.pathname,
    requirement,
  );

  if (!isReady) {
    return <PageLoader label="Checking permissions" />;
  }

  if (!isAllowed) {
    const state: ForbiddenRouteState = {
      from: `${location.pathname}${location.search}`,
      requiredPermissions: describeRequirement(resolvedRequirement),
    };

    return <Navigate to={ROUTES.forbidden} replace state={state} />;
  }

  return <>{children ?? <Outlet />}</>;
}
