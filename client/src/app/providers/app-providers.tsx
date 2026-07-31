import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/app/store';
import { ErrorBoundary, SkipLink } from '@/components/common';
import { Toaster } from '@/features/notifications';

import { AppBootstrap } from './app-bootstrap';

/**
 * Composition root for every cross-cutting provider.
 *
 * Order is deliberate:
 *   ErrorBoundary  outermost, so a provider that throws is still caught;
 *   ReduxProvider  next, because everything below reads from the store;
 *   AppBootstrap   registers listeners and resolves the session;
 *   Toaster        last, so notifications can be raised from anywhere above it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AppBootstrap>
          <SkipLink />
          {children}
          <Toaster />
        </AppBootstrap>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
