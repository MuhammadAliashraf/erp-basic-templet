import type { ReactNode } from 'react';
import { LuInbox } from 'react-icons/lu';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  /** The action that resolves the emptiness — usually "create the first record". */
  action?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Shown when a list, table or panel has no content.
 *
 * An empty state should always tell the user *why* it is empty and what to do
 * next; a bare "No data" is a dead end and reads as a bug.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'px-4 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-full border border-border bg-surface-sunken text-fg-disabled',
          size === 'sm' ? 'size-9 [&_svg]:size-4' : 'size-12 [&_svg]:size-5',
        )}
      >
        {icon ?? <LuInbox />}
      </span>

      <h3 className={cn('mt-3 font-semibold text-fg', size === 'sm' ? 'text-sm' : 'text-md')}>
        {title}
      </h3>

      {description ? (
        <p className="mt-1 max-w-sm text-xs text-fg-muted sm:text-sm">{description}</p>
      ) : null}

      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
