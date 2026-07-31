import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md';
}

const TRACK_STYLES = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
} as const;

const THUMB_STYLES = {
  sm: 'size-3 peer-checked:translate-x-3',
  md: 'size-4 peer-checked:translate-x-4',
} as const;

/**
 * Toggle for settings that apply immediately.
 *
 * If the change only takes effect on save, use a `<Checkbox>` instead — a
 * switch implies the system has already acted.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'md', className, disabled, ...props },
  ref,
) {
  return (
    <span className={cn('relative inline-flex shrink-0 items-center', TRACK_STYLES[size], className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...props}
      />

      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 rounded-full border border-border-strong bg-surface-sunken transition-colors',
          'peer-checked:border-accent peer-checked:bg-accent',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-focus-ring',
          'peer-disabled:opacity-60',
        )}
      />

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none relative ml-0.5 rounded-full bg-surface shadow-xs transition-transform duration-150',
          'border border-border-strong peer-checked:border-transparent',
          THUMB_STYLES[size],
        )}
      />
    </span>
  );
});
