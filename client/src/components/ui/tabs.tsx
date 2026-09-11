import { type ReactNode, useCallback, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface TabItem<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  /** Trailing count, e.g. the number of rows behind the tab. */
  badge?: ReactNode;
  isDisabled?: boolean;
}

export interface TabsProps<TValue extends string = string> {
  items: readonly TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  'aria-label': string;
  className?: string;
}

/**
 * Underlined tab bar.
 *
 * Implements the WAI-ARIA tabs pattern: arrow keys move between tabs, Home/End
 * jump to the ends, and only the active tab is in the page tab order.
 *
 * Scrolls horizontally on narrow viewports rather than wrapping, which keeps
 * the header height stable on mobile.
 */
export function Tabs<TValue extends string = string>({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: TabsProps<TValue>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const enabled = items.filter((item) => !item.isDisabled);
      const currentIndex = enabled.findIndex((item) => item.value === value);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabled.length;
      if (event.key === 'ArrowLeft')
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = enabled.length - 1;

      if (nextIndex === null) return;
      event.preventDefault();

      const nextValue = enabled[nextIndex].value;
      onChange(nextValue);
      listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${nextValue}"]`)?.focus();
    },
    [items, onChange, value],
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn('flex scrollbar-none gap-1 overflow-x-auto border-b border-border', className)}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={isActive}
            disabled={item.isDisabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 px-3 py-2 whitespace-nowrap',
              'text-sm font-medium transition-colors [&_svg]:size-4',
              'disabled:cursor-not-allowed disabled:text-fg-disabled',
              isActive
                ? 'text-accent-fg after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {item.icon}
            {item.label}
            {item.badge != null ? (
              <span
                className={cn(
                  'rounded-sm px-1.5 py-0.5 text-2xs font-semibold',
                  isActive ? 'bg-accent-subtle text-accent-fg' : 'bg-surface-sunken text-fg-muted',
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
