import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { appConfig } from '@/config/app.config';
import { cn, formatNumber } from '@/lib/utils';

import { IconButton } from './icon-button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

/**
 * Builds a compact page list with ellipses, e.g. `1 … 6 7 8 … 42`.
 * Always shows the first and last page so the range is legible at a glance.
 */
function buildPageRange(current: number, total: number, siblings = 1): (number | 'ellipsis')[] {
  const totalSlots = siblings * 2 + 5;
  if (total <= totalSlots) return Array.from({ length: total }, (_, index) => index + 1);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const range: (number | 'ellipsis')[] = [1];
  if (showLeftEllipsis) range.push('ellipsis');

  for (let page = Math.max(left, 2); page <= Math.min(right, total - 1); page += 1) {
    range.push(page);
  }

  if (showRightEllipsis) range.push('ellipsis');
  range.push(total);

  return range;
}

/**
 * Table pagination bar.
 *
 * On mobile the numbered pages collapse to a "Page X of Y" label — tap targets
 * for eleven page numbers do not fit, and the row count matters more than
 * direct access to page 7.
 */
export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = appConfig.ui.tablePageSizeOptions,
  className,
}: PaginationProps) {
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);
  const pages = buildPageRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-3 border-t border-border px-4 py-2.5',
        'sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-4 text-xs text-fg-muted">
        <span aria-live="polite">
          {totalItems === 0
            ? 'No results'
            : `${formatNumber(firstItem)}–${formatNumber(lastItem)} of ${formatNumber(totalItems)}`}
        </span>

        {onPageSizeChange ? (
          <label className="hidden items-center gap-1.5 sm:flex">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-6 rounded-sm border border-border-strong bg-surface px-1 text-xs text-fg outline-none focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-focus-ring"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          aria-label="Previous page"
          icon={<LuChevronLeft />}
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />

        <span className="px-2 text-xs text-fg-muted sm:hidden">
          Page {page} of {totalPages}
        </span>

        <ol className="hidden items-center gap-1 sm:flex">
          {pages.map((entry, index) =>
            entry === 'ellipsis' ? (
              <li
                key={`ellipsis-${index}`}
                className="px-1 text-xs text-fg-disabled"
                aria-hidden="true"
              >
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  onClick={() => onPageChange(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  aria-label={`Page ${entry}`}
                  className={cn(
                    'h-7 min-w-7 rounded-sm px-2 text-xs font-medium transition-colors',
                    entry === page
                      ? 'bg-accent text-fg-on-accent'
                      : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                  )}
                >
                  {entry}
                </button>
              </li>
            ),
          )}
        </ol>

        <IconButton
          aria-label="Next page"
          icon={<LuChevronRight />}
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </nav>
  );
}
