import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Optional centred label, e.g. "or". */
  label?: string;
}

export function Separator({
  orientation = 'horizontal',
  label,
  className,
  ...props
}: SeparatorProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)} {...props}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-fg-subtle">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
