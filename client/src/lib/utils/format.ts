/**
 * Presentation formatters.
 *
 * All of these are locale-aware and null-safe: they return a stable placeholder
 * rather than throwing or printing "null" into the UI. `Intl` formatters are
 * memoised because constructing them is comparatively expensive.
 */

const EMPTY = '—';

const formatterCache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function cached<T extends Intl.NumberFormat | Intl.DateTimeFormat>(
  key: string,
  create: () => T,
): T {
  const existing = formatterCache.get(key);
  if (existing) return existing as T;
  const created = create();
  formatterCache.set(key, created);
  return created;
}

export interface FormatOptions {
  locale?: string;
  /** Rendered when the value is null/undefined/NaN. Defaults to an em dash. */
  fallback?: string;
}

/** `1234567` → `1,234,567` */
export function formatNumber(
  value: number | null | undefined,
  options: FormatOptions & Intl.NumberFormatOptions = {},
): string {
  const { locale = 'en-US', fallback = EMPTY, ...numberOptions } = options;
  if (value == null || Number.isNaN(value)) return fallback;

  return cached(
    `n:${locale}:${JSON.stringify(numberOptions)}`,
    () => new Intl.NumberFormat(locale, numberOptions),
  ).format(value);
}

/** `1234.5` → `$1,234.50` */
export function formatCurrency(
  value: number | null | undefined,
  options: FormatOptions & { currency?: string } & Intl.NumberFormatOptions = {},
): string {
  const { currency = 'USD', ...rest } = options;
  return formatNumber(value, { style: 'currency', currency, ...rest });
}

/** `0.4213` → `42.1%` */
export function formatPercent(
  value: number | null | undefined,
  options: FormatOptions & Intl.NumberFormatOptions = {},
): string {
  return formatNumber(value, {
    style: 'percent',
    maximumFractionDigits: 1,
    ...options,
  });
}

/** `1536` → `1.5 KB`. Uses binary units, as storage dashboards expect. */
export function formatBytes(value: number | null | undefined, fractionDigits = 1): string {
  if (value == null || Number.isNaN(value)) return EMPTY;
  if (value === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(value)) / Math.log(1024)),
    units.length - 1,
  );
  const scaled = value / 1024 ** exponent;

  return `${scaled.toFixed(exponent === 0 ? 0 : fractionDigits)} ${units[exponent]}`;
}

type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `2026-08-01` → `Aug 1, 2026` */
export function formatDate(
  value: DateInput,
  options: FormatOptions & Intl.DateTimeFormatOptions = {},
): string {
  const { locale = 'en-US', fallback = EMPTY, ...dateOptions } = options;
  const date = toDate(value);
  if (!date) return fallback;

  const resolved: Intl.DateTimeFormatOptions = Object.keys(dateOptions).length
    ? dateOptions
    : { year: 'numeric', month: 'short', day: 'numeric' };

  return cached(
    `d:${locale}:${JSON.stringify(resolved)}`,
    () => new Intl.DateTimeFormat(locale, resolved),
  ).format(date);
}

/** `2026-08-01T14:05Z` → `Aug 1, 2026, 2:05 PM` */
export function formatDateTime(value: DateInput, options: FormatOptions = {}): string {
  return formatDate(value, {
    ...options,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** `Date.now() - 90_000` → `2 minutes ago` */
export function formatRelativeTime(value: DateInput, options: FormatOptions = {}): string {
  const { locale = 'en-US', fallback = EMPTY } = options;
  const date = toDate(value);
  if (!date) return fallback;

  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.348],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];

  let unitValue = deltaSeconds;
  for (const [unit, limit] of thresholds) {
    if (Math.abs(unitValue) < limit) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        Math.round(unitValue),
        unit,
      );
    }
    unitValue /= limit;
  }

  return fallback;
}

/** `3_725_000` → `1h 2m`. Intended for durations, not timestamps. */
export function formatDuration(milliseconds: number | null | undefined): string {
  if (milliseconds == null || Number.isNaN(milliseconds)) return EMPTY;

  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
