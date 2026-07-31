import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends the required marker. */
  isRequired?: boolean;
  /** Appends a muted "Optional" hint — clearer than marking every required field. */
  isOptional?: boolean;
}

export function Label({ isRequired, isOptional, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('inline-flex items-center gap-1 text-xs font-medium text-fg', className)}
      {...props}
    >
      {children}
      {isRequired ? (
        <span className="text-critical" aria-hidden="true">
          *
        </span>
      ) : null}
      {isOptional ? <span className="font-normal text-fg-subtle">(optional)</span> : null}
    </label>
  );
}
