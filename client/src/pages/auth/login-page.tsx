import { Card } from '@/components/ui';
import { env } from '@/config/env';
import { LoginForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

/**
 * Sign-in screen.
 *
 * Pages are thin: they own the document title and composition, and delegate all
 * behaviour to feature components. That is what keeps `pages/` free of logic
 * worth testing.
 */
export default function LoginPage() {
  useDocumentTitle('Sign in');

  return (
    <Card elevation="raised" className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-md font-semibold text-fg">Sign in to your account</h2>
        <p className="mt-1 text-xs text-fg-muted">
          Use your organisation credentials to continue.
        </p>
      </div>

      <LoginForm />

      {env.enableMockApi ? (
        // Only rendered while the mock API is active, so it can never leak into
        // a real deployment.
        <div className="mt-5 rounded-md border border-border bg-surface-sunken p-3">
          <p className="text-2xs font-semibold tracking-wide text-fg-subtle uppercase">
            Demo credentials
          </p>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs text-fg-muted">
            <dt>Email</dt>
            <dd className="select-all text-fg">admin@example.com</dd>
            <dt>Password</dt>
            <dd className="select-all text-fg">password</dd>
          </dl>
        </div>
      ) : null}
    </Card>
  );
}
