import { cn } from '@/lib/utils';
import type { Size } from '@/types/common';

export interface SpinnerProps {
  size?: Size | 'xs';
  className?: string;
  /** Accessible label. Set to null inside a control that already announces itself. */
  label?: string | null;
}

const SIZE_STYLES: Record<NonNullable<SpinnerProps['size']>, string> = {
  xs: 'size-3 border',
  sm: 'size-4 border',
  md: 'size-5 border-2',
  lg: 'size-8 border-2',
};

/**
 * Indeterminate progress indicator.
 *
 * A bordered ring rather than an animated SVG: one element, no layout cost, and
 * it inherits `currentColor` so it works on any background without a variant.
 */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      className={cn('inline-flex shrink-0', className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent opacity-70',
          SIZE_STYLES[size],
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
