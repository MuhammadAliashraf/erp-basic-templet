import { cn } from '@/lib/utils';

import { Spinner } from '../ui/spinner';

export interface PageLoaderProps {
  label?: string;
  /** Fills the viewport — for the initial application boot. */
  isFullScreen?: boolean;
  className?: string;
}

/**
 * Route-level loading indicator, used as the Suspense fallback for lazy pages.
 *
 * Intentionally minimal: a heavy skeleton here would flash for the ~50ms a
 * chunk usually takes to arrive, which is worse than a quiet spinner.
 */
export function PageLoader({ label = 'Loading', isFullScreen = false, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        isFullScreen ? 'min-h-dvh bg-canvas' : 'min-h-64 w-full',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-fg-subtle">
        <Spinner size="lg" label={null} />
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
}
