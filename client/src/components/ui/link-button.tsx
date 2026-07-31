import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from '@/lib/utils';

import { type ButtonSize, buttonStyles, type ButtonVariant } from './button-styles';

export interface LinkButtonProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

/**
 * Navigation styled as a button.
 *
 * Use this whenever the action is "go somewhere". It renders a real anchor, so
 * middle-click, Ctrl-click and "Copy link address" all work — none of which a
 * `<button onClick={navigate}>` supports.
 */
export function LinkButton({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(buttonStyles({ variant, size, fullWidth }), className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
