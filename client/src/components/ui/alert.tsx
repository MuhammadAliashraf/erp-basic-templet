import type { HTMLAttributes, ReactNode } from 'react';
import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from 'react-icons/lu';

import { cn } from '@/lib/utils';
import type { Intent } from '@/types/common';

// `title` is omitted from the HTML attributes: the native attribute is a
// tooltip string, while ours is rendered content.
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  intent?: Intent;
  title?: ReactNode;
  icon?: ReactNode;
  /** Renders a dismiss button when provided. */
  onDismiss?: () => void;
  /** Buttons or links rendered under the message. */
  actions?: ReactNode;
}

const CONTAINER_STYLES: Record<Intent, string> = {
  neutral: 'bg-surface-sunken border-border text-fg',
  accent: 'bg-accent-subtle border-accent/30 text-fg',
  positive: 'bg-positive-subtle border-positive/30 text-fg',
  caution: 'bg-caution-subtle border-caution/30 text-fg',
  critical: 'bg-critical-subtle border-critical/30 text-fg',
};

const ICON_STYLES: Record<Intent, string> = {
  neutral: 'text-fg-subtle',
  accent: 'text-accent',
  positive: 'text-positive',
  caution: 'text-caution',
  critical: 'text-critical',
};

const DEFAULT_ICONS: Record<Intent, ReactNode> = {
  neutral: <LuInfo />,
  accent: <LuInfo />,
  positive: <LuCircleCheck />,
  caution: <LuTriangleAlert />,
  critical: <LuCircleAlert />,
};

/**
 * Inline message tied to a region of the page.
 *
 * Use for persistent, contextual information. For transient confirmation of an
 * action the user just took, raise a toast instead.
 */
export function Alert({
  intent = 'neutral',
  title,
  icon,
  onDismiss,
  actions,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      // `alert` interrupts a screen reader; reserve it for genuine problems.
      role={intent === 'critical' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-md border p-3', CONTAINER_STYLES[intent], className)}
      {...props}
    >
      <span
        className={cn('mt-0.5 shrink-0 [&_svg]:size-4', ICON_STYLES[intent])}
        aria-hidden="true"
      >
        {icon ?? DEFAULT_ICONS[intent]}
      </span>

      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold text-fg">{title}</p> : null}
        {children ? (
          <div className={cn('text-sm text-fg-muted', title && 'mt-0.5')}>{children}</div>
        ) : null}
        {actions ? <div className="mt-2.5 flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mt-1 -mr-1 grid size-6 shrink-0 place-items-center rounded-sm text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <LuX className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
