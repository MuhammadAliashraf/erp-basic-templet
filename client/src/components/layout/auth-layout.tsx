import { type ReactNode,Suspense } from 'react';
import { Outlet } from 'react-router';

import { appConfig } from '@/config/app.config';

import { PageLoader } from '../feedback/page-loader';

export interface AuthLayoutProps {
  children?: ReactNode;
}

/**
 * Frame for unauthenticated screens.
 *
 * A single centred card on a plain canvas. Deliberately austere: split-screen
 * hero imagery reads as consumer marketing, and internal tools are judged on
 * how quickly someone can get past this screen.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-90">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-md bg-accent text-sm font-bold text-fg-on-accent"
            >
              {appConfig.shortName}
            </span>
            <h1 className="text-lg font-semibold text-fg">{appConfig.name}</h1>
          </div>

          <Suspense fallback={<PageLoader />}>{children ?? <Outlet />}</Suspense>
        </div>
      </div>

      <footer className="px-4 pb-6 text-center text-2xs text-fg-subtle">
        <p>
          {appConfig.name} v{appConfig.version} · Authorised use only
        </p>
      </footer>
    </div>
  );
}
