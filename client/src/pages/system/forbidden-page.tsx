import { LuArrowLeft, LuLayoutDashboard } from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router';

import { Button, LinkButton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth';
import type { ForbiddenRouteState } from '@/features/rbac';
import { useDocumentTitle } from '@/hooks';

import { SystemMessage } from './system-message';

/**
 * The unauthorised screen.
 *
 * `<RouteGuard>` sends the attempted URL and the permissions that would have
 * granted it, so this page can say *what* was refused rather than only that
 * something was. That is the difference between a user who can file an
 * actionable access request and one who files "the app is broken".
 */
export default function ForbiddenPage() {
  useDocumentTitle('Access denied');

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state as ForbiddenRouteState | null;
  const requiredPermissions = state?.requiredPermissions ?? [];

  return (
    <SystemMessage
      code="403"
      title="Access denied"
      description={
        <>
          You do not have permission to view
          {state?.from ? <span className="font-medium text-fg"> {state.from}</span> : ' this page'}.
          If you believe this is a mistake, contact your administrator and quote the account
          {/* Naming the account shortcuts the "which login were you using?" round trip. */}
          {user?.email ? <span className="font-medium text-fg"> {user.email}</span> : null}.
          {requiredPermissions.length > 0 ? (
            <span className="mt-3 block text-xs text-fg-subtle">
              Requires{' '}
              {requiredPermissions.map((permission, index) => (
                <span key={permission}>
                  {index > 0 ? ' or ' : null}
                  <code className="rounded-xs bg-surface-sunken px-1 py-0.5 font-mono">
                    {permission}
                  </code>
                </span>
              ))}
            </span>
          ) : null}
        </>
      }
      actions={
        <>
          <Button leadingIcon={<LuArrowLeft />} onClick={() => void navigate(-1)}>
            Go back
          </Button>
          <LinkButton to={ROUTES.dashboard} variant="primary" leadingIcon={<LuLayoutDashboard />}>
            Go to dashboard
          </LinkButton>
        </>
      }
    />
  );
}
