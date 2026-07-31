import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface FormActionsProps {
  children: ReactNode;
  /** `end` for dialogs and panels, `between` when a destructive action sits left. */
  align?: 'end' | 'between';
  className?: string;
}

/**
 * Action row for a form.
 *
 * Reversed on mobile so the primary action — passed last, right-most on
 * desktop — sits at the top of the stack, closest to the thumb.
 */
export function FormActions({ children, align = 'end', className }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 pt-2',
        'sm:flex-row sm:items-center',
        align === 'between' ? 'sm:justify-between' : 'sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  );
}
