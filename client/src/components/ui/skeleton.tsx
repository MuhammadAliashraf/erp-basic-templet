import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

/**
 * Loading placeholder.
 *
 * Prefer a skeleton over a spinner whenever the shape of the incoming content
 * is known: it holds layout, which prevents the page from jumping on arrival.
 */
export function Skeleton({ variant = 'rect', className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-surface-sunken',
        variant === 'text' && 'h-4 rounded-xs',
        variant === 'rect' && 'rounded-md',
        variant === 'circle' && 'rounded-full',
        className,
      )}
      {...props}
    />
  );
}

/** Convenience block for table and list placeholders. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          // A shorter final line reads as a paragraph rather than a block.
          className={index === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}
