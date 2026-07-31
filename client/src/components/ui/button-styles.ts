import { cn } from '@/lib/utils';

export type ButtonVariant =
  /** The one primary action on a screen. */
  | 'primary'
  /** Default choice for most actions. */
  | 'secondary'
  /** Low-emphasis actions in toolbars and table rows. */
  | 'ghost'
  /** Destructive, irreversible actions. */
  | 'danger'
  /** Inline navigation styled as text. */
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-fg-on-accent border border-transparent hover:bg-accent-hover active:bg-accent-active shadow-xs',
  secondary:
    'bg-surface text-fg border border-border-strong hover:bg-surface-hover active:bg-surface-active shadow-xs',
  ghost:
    'bg-transparent text-fg border border-transparent hover:bg-surface-hover active:bg-surface-active',
  danger:
    'bg-critical text-fg-on-accent border border-transparent hover:bg-critical-hover active:bg-critical-hover shadow-xs',
  link: 'bg-transparent text-accent-fg border border-transparent underline-offset-4 hover:underline px-0',
};

/** Heights follow a dense 4px rhythm: 24 / 28 / 32 / 40px. */
const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-2xs rounded-sm',
  sm: 'h-7 px-2.5 text-xs rounded-sm',
  md: 'h-8 px-3 text-sm rounded-md',
  lg: 'h-10 px-4 text-base rounded-md',
};

/** Gap between icon and label. */
export const BUTTON_GAP_STYLES: Record<ButtonSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-1.5',
  lg: 'gap-2',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  xs: '[&_svg]:size-3',
  sm: '[&_svg]:size-3.5',
  md: '[&_svg]:size-4',
  lg: '[&_svg]:size-4',
};

const BASE_STYLES =
  'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium ' +
  'transition-colors duration-100 select-none disabled:pointer-events-none disabled:opacity-50';

/**
 * Shared style builder for button-like controls.
 *
 * Kept in its own module so `<Button>` and `<LinkButton>` share one definition
 * of what a button looks like, and so neither component file exports a
 * non-component value (which would break Fast Refresh).
 */
export function buttonStyles({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} = {}): string {
  return cn(
    BASE_STYLES,
    SIZE_STYLES[size],
    BUTTON_GAP_STYLES[size],
    ICON_SIZE[size],
    VARIANT_STYLES[variant],
    fullWidth && 'w-full',
  );
}
