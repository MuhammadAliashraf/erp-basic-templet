import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  BUTTON_GAP_STYLES,
  type ButtonSize,
  buttonStyles,
  type ButtonVariant,
} from './button-styles';
import { Spinner } from './spinner';

export type { ButtonSize, ButtonVariant };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a spinner and blocks interaction without changing width. */
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Stretches to the container width — the mobile form default. */
  fullWidth?: boolean;
}

/**
 * The primary action control.
 *
 * Only one `primary` button should appear per view; competing primaries are the
 * fastest way to make an enterprise screen feel amateurish.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      // Announces the pending state to assistive technology, which a spinner
      // alone does not do.
      aria-busy={isLoading || undefined}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      )}

      {/* Content keeps its box while loading so the button never resizes. */}
      <span
        className={cn('inline-flex items-center', BUTTON_GAP_STYLES[size], isLoading && 'invisible')}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    </button>
  );
});
