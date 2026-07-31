import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

import { env } from '@/config/env';

import { Button } from '../ui/button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Reporting hook — wire this to Sentry, Application Insights, etc. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Changing this value resets the boundary — pass the route key. */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-phase errors so one broken subtree cannot blank the console.
 *
 * Still a class component: React provides no hook equivalent of
 * `componentDidCatch`, and this is the one place a class is still correct.
 *
 * Note that it does *not* catch errors in event handlers, async callbacks or
 * outside the render phase — those must be handled where they occur.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    if (env.isDevelopment) {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }
  }

  override componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    // Navigating away from a broken route should give the user a working app
    // again without a full reload.
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;
    if (fallback) return fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="flex min-h-96 flex-col items-center justify-center px-6 py-16 text-center"
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-critical-subtle text-critical"
        >
          <LuTriangleAlert className="size-5" />
        </span>

        <h2 className="mt-4 text-lg font-semibold text-fg">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          An unexpected error occurred while rendering this view. Retrying often resolves it; if it
          persists, contact your administrator.
        </p>

        {/* The stack is a development aid only — never expose it in production. */}
        {env.isDevelopment ? (
          <pre className="mt-4 max-w-2xl overflow-x-auto rounded-md border border-border bg-surface-sunken p-3 text-left font-mono text-2xs text-critical-fg">
            {error.stack ?? error.message}
          </pre>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="primary" leadingIcon={<LuRefreshCw />} onClick={this.reset}>
            Try again
          </Button>
          <Button onClick={() => window.location.assign('/')}>Return to dashboard</Button>
        </div>
      </div>
    );
  }
}
