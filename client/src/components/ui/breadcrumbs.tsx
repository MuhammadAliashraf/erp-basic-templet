import { Fragment } from 'react';
import { LuChevronRight, LuEllipsis } from 'react-icons/lu';
import { Link } from 'react-router';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the final crumb — the current page is not a link. */
  to?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  /** Collapses the middle when the trail exceeds this length. */
  maxItems?: number;
  className?: string;
}

/**
 * Hierarchical trail.
 *
 * Deep navigation is the norm in enterprise consoles, so long trails collapse
 * to `Home / … / Parent / Current` rather than wrapping onto a second line.
 */
export function Breadcrumbs({ items, maxItems = 4, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const isCollapsed = items.length > maxItems;
  const visible = isCollapsed ? [items[0], ...items.slice(-(maxItems - 1))] : items;
  const collapseAfterIndex = isCollapsed ? 0 : -1;

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1 text-xs">
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex min-w-0 items-center">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="truncate rounded-xs text-fg-muted transition-colors hover:text-accent-fg hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn('truncate', isLast ? 'font-medium text-fg' : 'text-fg-muted')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {!isLast ? (
                <li aria-hidden="true" className="flex items-center text-fg-disabled">
                  <LuChevronRight className="size-3.5" />
                </li>
              ) : null}

              {index === collapseAfterIndex ? (
                <>
                  <li className="flex items-center text-fg-disabled" title="Hidden levels">
                    <LuEllipsis className="size-3.5" />
                  </li>
                  <li aria-hidden="true" className="flex items-center text-fg-disabled">
                    <LuChevronRight className="size-3.5" />
                  </li>
                </>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
