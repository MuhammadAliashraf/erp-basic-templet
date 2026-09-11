import type { ReactNode } from 'react';

/**
 * Shared layout for the 403 / 404 / 500 screens.
 *
 * The status code is present but de-emphasised: it matters to whoever handles
 * the support ticket, while the user needs the explanation and a way out.
 */
export function SystemMessage({
  code,
  title,
  description,
  actions,
}: {
  code: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-xs font-semibold tracking-widest text-fg-disabled">{code}</p>
        <h1 className="mt-2 text-2xl font-semibold text-fg">{title}</h1>
        <p className="mt-2 text-sm text-fg-muted">{description}</p>

        {actions ? (
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
