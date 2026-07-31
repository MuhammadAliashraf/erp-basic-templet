import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  isInvalid?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { isInvalid = false, className, disabled, ...props },
  ref,
) {
  return (
    <span className={cn('relative inline-flex size-4 shrink-0 items-center justify-center', className)}>
      <input
        ref={ref}
        type="radio"
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...props}
      />

      <span
        aria-hidden="true"
        className={cn(
          'grid size-4 place-items-center rounded-full border bg-surface transition-colors',
          'peer-checked:border-accent',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-focus-ring',
          'peer-disabled:bg-surface-disabled peer-disabled:opacity-60',
          // Inner dot, revealed from this sibling because it is a descendant.
          '[&>span]:scale-0 peer-checked:[&>span]:scale-100',
          isInvalid ? 'border-critical' : 'border-border-strong',
        )}
      >
        <span className="size-2 rounded-full bg-accent transition-transform duration-100" />
      </span>
    </span>
  );
});
