import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Intent } from '@/types/common';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: Intent;
  /** `subtle` for status in dense tables, `solid` for counts and emphasis. */
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Leading status dot — the clearest status affordance in a dense grid. */
  withDot?: boolean;
  icon?: ReactNode;
}

const SUBTLE_STYLES: Record<Intent, string> = {
  neutral: 'bg-surface-sunken text-fg-muted border-border',
  accent: 'bg-accent-subtle text-accent-fg border-transparent',
  positive: 'bg-positive-subtle text-positive-fg border-transparent',
  caution: 'bg-caution-subtle text-caution-fg border-transparent',
  critical: 'bg-critical-subtle text-critical-fg border-transparent',
};

const SOLID_STYLES: Record<Intent, string> = {
  neutral: 'bg-fg-muted text-surface border-transparent',
  accent: 'bg-accent text-fg-on-accent border-transparent',
  positive: 'bg-positive text-fg-on-accent border-transparent',
  caution: 'bg-caution text-fg-on-accent border-transparent',
  critical: 'bg-critical text-fg-on-accent border-transparent',
};

const OUTLINE_STYLES: Record<Intent, string> = {
  neutral: 'bg-transparent text-fg-muted border-border-strong',
  accent: 'bg-transparent text-accent-fg border-accent',
  positive: 'bg-transparent text-positive-fg border-positive',
  caution: 'bg-transparent text-caution-fg border-caution',
  critical: 'bg-transparent text-critical-fg border-critical',
};

const DOT_STYLES: Record<Intent, string> = {
  neutral: 'bg-fg-subtle',
  accent: 'bg-accent',
  positive: 'bg-positive',
  caution: 'bg-caution',
  critical: 'bg-critical',
};

/**
 * Compact status indicator.
 *
 * Intent carries the meaning, so colour is never the only signal — pair with
 * the dot or a clear label for colour-blind users.
 */
export function Badge({
  intent = 'neutral',
  variant = 'subtle',
  size = 'md',
  withDot = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles =
    variant === 'solid' ? SOLID_STYLES : variant === 'outline' ? OUTLINE_STYLES : SUBTLE_STYLES;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-sm border font-medium whitespace-nowrap',
        size === 'sm' ? 'h-4 px-1.5 text-2xs' : 'h-5 px-2 text-xs',
        '[&_svg]:size-3',
        variantStyles[intent],
        className,
      )}
      {...props}
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            variant === 'solid' ? 'bg-current' : DOT_STYLES[intent],
          )}
        />
      ) : null}
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
