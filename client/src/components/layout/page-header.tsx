import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { type BreadcrumbItem, Breadcrumbs } from '../ui/breadcrumbs';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Page-level actions. The primary action goes last. */
  actions?: ReactNode;
  /** Tabs or filters rendered flush to the bottom edge. */
  children?: ReactNode;
  className?: string;
}

/**
 * Standard page heading.
 *
 * Every screen uses this so the title, trail and action placement are identical
 * across the product — the kind of consistency that makes a large console feel
 * like one application rather than a stitched-together suite.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-border bg-surface', className)}>
      <div className="px-4 pt-3 pb-3 sm:px-6">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} className="mb-1.5" /> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-fg sm:text-2xl">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-3xl text-xs text-fg-muted sm:text-sm">{description}</p>
            ) : null}
          </div>

          {actions ? (
            // Wraps rather than scrolls on mobile so no action is unreachable.
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>

      {children ? <div className="px-4 sm:px-6">{children}</div> : null}
    </div>
  );
}
