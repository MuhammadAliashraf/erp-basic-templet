import { cn } from '@/lib/utils';
import type { Intent } from '@/types/common';

export interface ProgressProps {
  /** 0–100. Omit for an indeterminate bar. */
  value?: number;
  intent?: Intent;
  size?: 'sm' | 'md';
  label?: string;
  /** Shows the numeric percentage alongside the label. */
  showValue?: boolean;
  className?: string;
}

const FILL_STYLES: Record<Intent, string> = {
  neutral: 'bg-fg-muted',
  accent: 'bg-accent',
  positive: 'bg-positive',
  caution: 'bg-caution',
  critical: 'bg-critical',
};

export function Progress({
  value,
  intent = 'accent',
  size = 'md',
  label,
  showValue = false,
  className,
}: ProgressProps) {
  const isIndeterminate = value == null;
  const clamped = isIndeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {label || showValue ? (
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          {label ? <span className="text-fg-muted">{label}</span> : <span />}
          {showValue && !isIndeterminate ? (
            <span className="font-medium text-fg tabular-nums">{Math.round(clamped)}%</span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-sunken',
          size === 'sm' ? 'h-1' : 'h-1.5',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            FILL_STYLES[intent],
            isIndeterminate && 'w-1/3 animate-pulse',
          )}
          style={isIndeterminate ? undefined : { width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
