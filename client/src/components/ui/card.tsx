import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `flat` for content inside an already-bordered region;
   * `raised` for standalone panels that need separation from the canvas.
   */
  elevation?: 'flat' | 'raised';
  /** Removes the default body padding so tables can sit flush to the edges. */
  isPadded?: boolean;
}

/**
 * Surface container.
 *
 * The workhorse of enterprise layouts: one border, one small shadow, no colour.
 * Colour belongs to status, not to containers.
 */
export function Card({
  elevation = 'flat',
  isPadded = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface',
        elevation === 'raised' && 'shadow-sm',
        isPadded && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// See `AlertProps` — the native `title` attribute is a tooltip, ours is content.
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned controls: filters, overflow menu, primary action. */
  actions?: ReactNode;
}

export function CardHeader({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border px-4 py-3',
        // Actions drop below the title on narrow viewports rather than
        // squeezing it into an unreadable column.
        'sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <h3 className="truncate text-md font-semibold text-fg">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-fg-muted">{description}</p> : null}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      {children}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border bg-surface-sunken px-4 py-3',
        'sm:flex-row sm:items-center sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
