import { forwardRef, type InputHTMLAttributes, useEffect, useRef } from 'react';
import { LuCheck, LuMinus } from 'react-icons/lu';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Partial selection — the "some rows selected" header state in tables. */
  indeterminate?: boolean;
  isInvalid?: boolean;
}

/**
 * Checkbox.
 *
 * The real `<input>` stays in the DOM (visually hidden but focusable) so form
 * submission, labels and assistive technology behave natively; the visible box
 * is a sibling driven by `peer-*` state.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, isInvalid = false, className, disabled, ...props },
  forwardedRef,
) {
  const innerRef = useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property with no HTML attribute equivalent.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <span className={cn('relative inline-flex size-4 shrink-0 items-center justify-center', className)}>
      <input
        ref={(node) => {
          innerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type="checkbox"
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...props}
      />

      <span
        aria-hidden="true"
        className={cn(
          'grid size-4 place-items-center rounded-xs border bg-surface transition-colors',
          'peer-checked:border-accent peer-checked:bg-accent peer-checked:text-fg-on-accent',
          'peer-indeterminate:border-accent peer-indeterminate:bg-accent peer-indeterminate:text-fg-on-accent',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-focus-ring',
          'peer-disabled:bg-surface-disabled peer-disabled:opacity-60',
          // The glyph is a descendant, so its visibility is driven from this
          // sibling element rather than with `peer-checked:` on the icon itself.
          '[&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100 peer-indeterminate:[&_svg]:opacity-100',
          isInvalid ? 'border-critical' : 'border-border-strong',
        )}
      >
        {indeterminate ? (
          <LuMinus className="size-3" strokeWidth={3} />
        ) : (
          <LuCheck className="size-3" strokeWidth={3} />
        )}
      </span>
    </span>
  );
});
