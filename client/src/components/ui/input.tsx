import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

// `size` and `prefix` both collide with legacy HTML attributes of the same
// name, so they are replaced rather than extended.
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'sm' | 'md' | 'lg';
  /** Applies the error treatment. Usually supplied by `<FormField>`. */
  isInvalid?: boolean;
  /** Icon or text rendered inside the leading edge. */
  prefix?: ReactNode;
  /** Icon, unit or action rendered inside the trailing edge. */
  suffix?: ReactNode;
}

const SIZE_STYLES: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'h-7 text-xs',
  md: 'h-8 text-sm',
  lg: 'h-10 text-base',
};

/**
 * Text input.
 *
 * The visible border sits on a wrapper so prefix/suffix adornments live inside
 * the field, and the focus ring surrounds the whole control rather than just
 * the `<input>` box.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', isInvalid = false, prefix, suffix, className, disabled, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'flex w-full items-center rounded-md border bg-surface transition-colors',
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-focus-ring',
        SIZE_STYLES[size],
        isInvalid ? 'border-critical' : 'border-border-strong hover:border-fg-subtle',
        disabled && 'cursor-not-allowed bg-surface-disabled opacity-70 hover:border-border-strong',
        className,
      )}
    >
      {prefix ? (
        <span className="grid shrink-0 place-items-center pl-2.5 text-fg-subtle [&_svg]:size-4">
          {prefix}
        </span>
      ) : null}

      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'w-full min-w-0 bg-transparent px-2.5 text-fg outline-none',
          'disabled:cursor-not-allowed',
          prefix && 'pl-1.5',
          suffix && 'pr-1.5',
        )}
        {...props}
      />

      {suffix ? (
        <span className="grid shrink-0 place-items-center pr-2.5 text-fg-subtle [&_svg]:size-4">
          {suffix}
        </span>
      ) : null}
    </div>
  );
});
