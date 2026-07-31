import { type Key, type ReactNode, useCallback, useMemo } from 'react';
import { LuArrowDown, LuArrowUp, LuChevronsUpDown } from 'react-icons/lu';

import { cn } from '@/lib/utils';
import type { SortDirection, SortState } from '@/types/common';

import { EmptyState } from '../feedback/empty-state';
import { ErrorState } from '../feedback/error-state';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from './table';

export interface DataTableColumn<TRow> {
  /** Stable key; also the sort field sent to the server. */
  id: string;
  header: ReactNode;
  /** Cell renderer. Return a node, not a raw object. */
  cell: (row: TRow, rowIndex: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  isSortable?: boolean;
  /** Fixed width, e.g. `'12rem'` or `'80px'`. */
  width?: string;
  /** Hides the column below the `md` breakpoint. */
  hideOnMobile?: boolean;
  /** Pins the column to the left edge during horizontal scroll. */
  isSticky?: boolean;
}

export interface DataTableProps<TRow> {
  columns: readonly DataTableColumn<TRow>[];
  rows: readonly TRow[];
  /** Stable identity for each row — required for selection and React keys. */
  getRowId: (row: TRow) => Key;

  isLoading?: boolean;
  /** Rendered instead of the body when set. */
  error?: unknown;
  onRetry?: () => void;

  /** Controlled sort state; omit to disable sorting entirely. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;

  /** Controlled selection; omit to disable selection. */
  selectedIds?: readonly Key[];
  onSelectionChange?: (ids: Key[]) => void;

  onRowClick?: (row: TRow) => void;

  density?: 'comfortable' | 'compact';
  emptyState?: ReactNode;
  /** Accessible description of the table's contents. */
  caption: string;
  skeletonRowCount?: number;
  className?: string;
}

/**
 * The standard listing table.
 *
 * Deliberately a *controlled* component: sorting, selection and pagination
 * state live with the caller, usually in the URL. That is what makes a filtered
 * view shareable and what lets the same table be driven by server-side or
 * client-side data without changing its API.
 *
 * Responsive strategy is horizontal scroll with optional column hiding, not a
 * card transformation: operators comparing rows need the tabular structure,
 * and a stack of cards destroys it.
 */
export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  error,
  onRetry,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  onRowClick,
  density = 'comfortable',
  emptyState,
  caption,
  skeletonRowCount = 8,
  className,
}: DataTableProps<TRow>) {
  const isSelectable = Boolean(selectedIds && onSelectionChange);
  const selectedSet = useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

  const allRowIds = useMemo(() => rows.map(getRowId), [rows, getRowId]);
  const areAllSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedSet.has(id));
  const areSomeSelected = !areAllSelected && allRowIds.some((id) => selectedSet.has(id));

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    onSelectionChange(areAllSelected ? [] : allRowIds);
  }, [areAllSelected, allRowIds, onSelectionChange]);

  const toggleRow = useCallback(
    (id: Key) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange([...next]);
    },
    [onSelectionChange, selectedSet],
  );

  const handleSort = useCallback(
    (columnId: string) => {
      if (!onSortChange) return;
      const nextDirection: SortDirection =
        sort?.field === columnId && sort.direction === 'asc' ? 'desc' : 'asc';
      onSortChange({ field: columnId, direction: nextDirection });
    },
    [onSortChange, sort],
  );

  const columnCount = columns.length + (isSelectable ? 1 : 0);

  return (
    <div className={cn('w-full', className)}>
      <TableContainer>
        <Table>
          <caption className="sr-only">{caption}</caption>

          <TableHead>
            <tr>
              {isSelectable ? (
                <TableHeaderCell className="w-10 pr-0">
                  <Checkbox
                    checked={areAllSelected}
                    indeterminate={areSomeSelected}
                    onChange={toggleAll}
                    aria-label={areAllSelected ? 'Deselect all rows' : 'Select all rows'}
                    disabled={rows.length === 0}
                  />
                </TableHeaderCell>
              ) : null}

              {columns.map((column) => {
                const isSorted = sort?.field === column.id;
                const canSort = column.isSortable && Boolean(onSortChange);

                return (
                  <TableHeaderCell
                    key={column.id}
                    align={column.align}
                    isSticky={column.isSticky}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                    // Communicates the current sort to assistive technology.
                    aria-sort={
                      isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.id)}
                        className={cn(
                          'group inline-flex items-center gap-1 rounded-xs transition-colors hover:text-fg',
                          isSorted && 'text-fg',
                        )}
                      >
                        {column.header}
                        {isSorted ? (
                          sort.direction === 'asc' ? (
                            <LuArrowUp className="size-3" />
                          ) : (
                            <LuArrowDown className="size-3" />
                          )
                        ) : (
                          <LuChevronsUpDown className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHeaderCell>
                );
              })}
            </tr>
          </TableHead>

          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {Array.from({ length: columnCount }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} density={density}>
                        <Skeleton variant="text" className="w-full max-w-40" />
                      </TableCell>
                    ))}
                  </tr>
                ))
              : rows.map((row, rowIndex) => {
                  const id = getRowId(row);
                  const isSelected = selectedSet.has(id);

                  return (
                    <TableRow
                      key={id}
                      isSelected={isSelected}
                      isInteractive={Boolean(onRowClick)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {isSelectable ? (
                        <TableCell
                          density={density}
                          className="w-10 pr-0"
                          // Prevents the row click from firing when the intent
                          // was only to tick the checkbox.
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </TableCell>
                      ) : null}

                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          isSticky={column.isSticky}
                          density={density}
                          className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                        >
                          {column.cell(row, rowIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Non-row states live outside the table so they are not constrained by
          the column grid and can centre properly. */}
      {!isLoading && error ? <ErrorState error={error} onRetry={onRetry} size="sm" /> : null}

      {!isLoading && !error && rows.length === 0
        ? (emptyState ?? (
            <EmptyState
              size="sm"
              title="No records found"
              description="Try adjusting your filters or search terms."
            />
          ))
        : null}
    </div>
  );
}
