import { LuRefreshCw } from 'react-icons/lu';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Button, LinkButton } from '@/components/ui';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';

import { SystemMessage } from './system-message';

/**
 * Router-level `errorElement`.
 *
 * Catches anything thrown during route rendering — including a failed lazy
 * chunk fetch, which is common right after a deployment when the old chunk
 * hashes have disappeared. A reload is the correct fix for that case, which is
 * why it is the primary action.
 */
export default function RouteErrorPage() {
  const error = useRouteError();

  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className="min-h-dvh bg-canvas">
      <SystemMessage
        code={String(status)}
        title="Something went wrong"
        description={
          <>
            This view could not be displayed. Reloading usually resolves it — if the problem
            persists, contact your administrator.
            {env.isDevelopment ? (
              <span className="mt-3 block rounded-md border border-border bg-surface-sunken p-2 text-left font-mono text-2xs text-critical-fg">
                {message}
              </span>
            ) : null}
          </>
        }
        actions={
          <>
            <LinkButton to={ROUTES.dashboard}>Go to dashboard</LinkButton>
            <Button
              variant="primary"
              leadingIcon={<LuRefreshCw />}
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </>
        }
      />
    </div>
  );
}
