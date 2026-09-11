import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { ButtonVariant } from './button-styles';
import { Spinner } from './spinner';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control has no visible text to announce. */
  'aria-label': string;
  icon: ReactNode;
  variant?: Exclude<ButtonVariant, 'link'>;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<IconButtonProps['variant']>, string> = {
  primary: 'bg-accent text-fg-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary:
    'bg-surface text-fg border border-border-strong hover:bg-surface-hover active:bg-surface-active shadow-xs',
  ghost:
    'bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg active:bg-surface-active',
  danger: 'bg-critical text-fg-on-accent hover:bg-critical-hover',
};

const SIZE_STYLES: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'size-7 rounded-sm [&_svg]:size-3.5',
  md: 'size-8 rounded-md [&_svg]:size-4',
  lg: 'size-10 rounded-md [&_svg]:size-5',
};

/**
 * Square, icon-only action. Used throughout toolbars, table rows and the
 * top bar, where a text label would cost more space than it earns.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    variant = 'ghost',
    size = 'md',
    isLoading = false,
    className,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-grid shrink-0 place-items-center transition-colors duration-100',
        'disabled:pointer-events-none disabled:opacity-50',
        SIZE_STYLES[size],
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label={null} /> : icon}
    </button>
  );
});
