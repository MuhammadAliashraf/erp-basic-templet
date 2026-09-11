import { forwardRef, type SelectHTMLAttributes } from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types/common';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  options: readonly SelectOption[];
  /** Rendered as a disabled first option when the field has no value yet. */
  placeholder?: string;
}

const SIZE_STYLES: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'h-7 text-xs',
  md: 'h-8 text-sm',
  lg: 'h-10 text-base',
};

/**
 * Native `<select>`.
 *
 * Deliberately not a custom listbox: the native control gives correct keyboard
 * behaviour, screen-reader support and mobile pickers for free. Reach for a
 * custom component only when multi-select or rich options are genuinely needed.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', isInvalid = false, options, placeholder, className, disabled, ...props },
  ref,
) {
  return (
    <div className={cn('relative w-full', className)}>
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'w-full appearance-none rounded-md border bg-surface pr-8 pl-2.5 text-fg transition-colors',
          'outline-none focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-focus-ring',
          'disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:opacity-70',
          SIZE_STYLES[size],
          isInvalid ? 'border-critical' : 'border-border-strong hover:border-fg-subtle',
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      <LuChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
});
