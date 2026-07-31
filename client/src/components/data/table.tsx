import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * Unstyled-ish table primitives.
 *
 * Use these when a screen needs a bespoke table. For the standard listing —
 * sorting, selection, loading, empty and error states — use `<DataTable>`,
 * which is built on top of these.
 */

export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    // Horizontal scrolling is confined here so the page body never scrolls
    // sideways on a narrow viewport.
    <div className={cn('w-full overflow-x-auto', className)} {...props} />
  );
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-left', className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-sunken', className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isSelected?: boolean;
  isInteractive?: boolean;
}

export function TableRow({ isSelected, isInteractive, className, ...props }: TableRowProps) {
  return (
    <tr
      aria-selected={isSelected || undefined}
      className={cn(
        'transition-colors',
        isSelected ? 'bg-surface-selected' : 'hover:bg-surface-hover',
        isInteractive && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  /** Pins the column while the table scrolls horizontally. */
  isSticky?: boolean;
}

export function TableHeaderCell({
  align = 'left',
  isSticky,
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-border px-3 py-2 text-xs font-semibold whitespace-nowrap text-fg-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        isSticky && 'sticky left-0 z-10 bg-surface-sunken',
        className,
      )}
      {...props}
    />
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
  /** Compact rows for dense listings. */
  density?: 'comfortable' | 'compact';
}

export function TableCell({
  align = 'left',
  isSticky,
  density = 'comfortable',
  className,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(
        'px-3 align-middle text-sm text-fg',
        density === 'compact' ? 'py-1.5' : 'py-2.5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        isSticky && 'sticky left-0 z-10 bg-surface',
        className,
      )}
      {...props}
    />
  );
}
