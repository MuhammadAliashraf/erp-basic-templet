import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { isInvalid = false, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={isInvalid || undefined}
      className={cn(
        'w-full rounded-md border bg-surface px-2.5 py-2 text-sm text-fg transition-colors',
        // Vertical-only resize: horizontal resizing breaks form grids.
        'resize-y outline-none',
        'focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-focus-ring',
        'disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:opacity-70',
        isInvalid ? 'border-critical' : 'border-border-strong hover:border-fg-subtle',
        className,
      )}
      {...props}
    />
  );
});
