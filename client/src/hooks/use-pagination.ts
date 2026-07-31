import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { appConfig } from '@/config/app.config';

export interface UsePaginationOptions {
  totalItems?: number;
  defaultPageSize?: number;
  /** Prefix the params, so two tables on one screen do not collide. */
  paramPrefix?: string;
}

/**
 * URL-synchronised pagination state.
 *
 * Keeping page and page size in the query string — not component state — makes
 * a filtered, paginated view shareable, bookmarkable and survivable across a
 * refresh. That expectation is close to universal in enterprise tooling.
 */
export function usePagination(options: UsePaginationOptions = {}) {
  const {
    totalItems = 0,
    defaultPageSize = appConfig.ui.tableDefaultPageSize,
    paramPrefix = '',
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const pageKey = `${paramPrefix}page`;
  const sizeKey = `${paramPrefix}pageSize`;

  const page = Math.max(1, Number(searchParams.get(pageKey)) || 1);
  const pageSize = Math.max(1, Number(searchParams.get(sizeKey)) || defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      updateParams({ [pageKey]: clamped === 1 ? null : String(clamped) });
    },
    [pageKey, totalPages, updateParams],
  );

  const setPageSize = useCallback(
    (nextSize: number) => {
      // Returning to page 1 avoids landing on an out-of-range page.
      updateParams({
        [sizeKey]: nextSize === defaultPageSize ? null : String(nextSize),
        [pageKey]: null,
      });
    },
    [defaultPageSize, pageKey, sizeKey, updateParams],
  );

  return useMemo(
    () => ({
      page,
      pageSize,
      totalPages,
      totalItems,
      /** 1-based index of the first row on the current page. */
      firstItemIndex: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
      lastItemIndex: Math.min(page * pageSize, totalItems),
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      setPage,
      setPageSize,
      nextPage: () => setPage(page + 1),
      previousPage: () => setPage(page - 1),
    }),
    [page, pageSize, totalItems, totalPages, setPage, setPageSize],
  );
}
