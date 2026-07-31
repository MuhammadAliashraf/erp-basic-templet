import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

import { isHttpError } from '@/lib/http';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export interface ErrorStateProps {
  /** Any caught value. `HttpError` details are surfaced automatically. */
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Inline failure state for a region that could not load.
 *
 * Shows the correlation id when the backend supplied one: it is the difference
 * between a support ticket that can be traced and one that cannot.
 */
export function ErrorState({
  error,
  title = 'Unable to load this content',
  description,
  onRetry,
  size = 'md',
  className,
}: ErrorStateProps) {
  const message = description ?? (isHttpError(error) ? error.message : undefined);
  const traceId = isHttpError(error) ? error.traceId : undefined;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'px-4 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-full bg-critical-subtle text-critical',
          size === 'sm' ? 'size-9 [&_svg]:size-4' : 'size-12 [&_svg]:size-5',
        )}
      >
        <LuTriangleAlert />
      </span>

      <h3 className={cn('mt-3 font-semibold text-fg', size === 'sm' ? 'text-sm' : 'text-md')}>
        {title}
      </h3>

      {message ? <p className="mt-1 max-w-md text-xs text-fg-muted sm:text-sm">{message}</p> : null}

      {traceId ? (
        <p className="mt-2 font-mono text-2xs text-fg-subtle">
          Reference: <span className="select-all">{traceId}</span>
        </p>
      ) : null}

      {onRetry ? (
        <Button className="mt-4" size="sm" leadingIcon={<LuRefreshCw />} onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
