import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/app/store';
import { ErrorBoundary, SkipLink } from '@/components/common';
import { Toaster } from '@/features/notifications';
import { PermissionProvider } from '@/features/rbac';

import { AppBootstrap } from './app-bootstrap';

/**
 * Composition root for every cross-cutting provider.
 *
 * Order is deliberate:
 *   ErrorBoundary     outermost, so a provider that throws is still caught;
 *   ReduxProvider     next, because everything below reads from the store;
 *   AppBootstrap      registers listeners and resolves the session;
 *   PermissionProvider after the session — it needs to know who is signed in
 *                     before it can fetch their policy — and above the router,
 *                     so route guards can consult it;
 *   Toaster           last, so notifications can be raised from anywhere above it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AppBootstrap>
          <PermissionProvider>
            <SkipLink />
            {children}
            <Toaster />
          </PermissionProvider>
        </AppBootstrap>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
