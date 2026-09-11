import { createContext, type ReactNode, useCallback, useContext, useId, useMemo } from 'react';
import { Link } from 'react-router';

import { useClickOutside, useDisclosure, useKeyDown } from '@/hooks';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
  isOpen: boolean;
  close: () => void;
  toggle: () => void;
  menuId: string;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <DropdownMenu>.`);
  }
  return context;
}

export interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
}

/**
 * Compound dropdown menu.
 *
 * ```tsx
 * <DropdownMenu>
 *   <DropdownTrigger>
 *     {({ toggle, isOpen }) => <Button onClick={toggle} aria-expanded={isOpen}>Actions</Button>}
 *   </DropdownTrigger>
 *   <DropdownContent align="end">
 *     <DropdownItem onSelect={onEdit}>Edit</DropdownItem>
 *     <DropdownSeparator />
 *     <DropdownItem intent="critical" onSelect={onDelete}>Delete</DropdownItem>
 *   </DropdownContent>
 * </DropdownMenu>
 * ```
 *
 * Positioned with CSS rather than a floating-element library: menus in this
 * shell always anchor to a known edge, so the extra dependency and runtime cost
 * are not justified.
 */
export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const menuId = useId();

  const containerRef = useClickOutside<HTMLDivElement>(close, isOpen);
  useKeyDown('Escape', close, isOpen);

  const value = useMemo<DropdownContextValue>(
    () => ({ isOpen, close, toggle, menuId }),
    [isOpen, close, toggle, menuId],
  );

  return (
    <DropdownContext.Provider value={value}>
      <div ref={containerRef} className={cn('relative inline-flex', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps {
  /** Render prop, so any control can act as the trigger. */
  children: (state: { isOpen: boolean; toggle: () => void; menuId: string }) => ReactNode;
}

export function DropdownTrigger({ children }: DropdownTriggerProps) {
  const { isOpen, toggle, menuId } = useDropdownContext('DropdownTrigger');
  return <>{children({ isOpen, toggle, menuId })}</>;
}

export interface DropdownContentProps {
  children: ReactNode;
  /** Which edge of the trigger the menu aligns to. */
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  className?: string;
}

export function DropdownContent({
  children,
  align = 'start',
  side = 'bottom',
  className,
}: DropdownContentProps) {
  const { isOpen, menuId } = useDropdownContext('DropdownContent');
  if (!isOpen) return null;

  return (
    <div
      id={menuId}
      role="menu"
      className={cn(
        'absolute z-40 min-w-48 animate-fade-in overflow-hidden rounded-md border border-border',
        'bg-surface-raised py-1 shadow-lg',
        side === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  /** Renders the item as a router link instead of a button. */
  to?: string;
  icon?: ReactNode;
  /** Right-aligned hint, typically a keyboard shortcut. */
  shortcut?: string;
  intent?: 'default' | 'critical';
  isDisabled?: boolean;
}

export function DropdownItem({
  children,
  onSelect,
  to,
  icon,
  shortcut,
  intent = 'default',
  isDisabled = false,
}: DropdownItemProps) {
  const { close } = useDropdownContext('DropdownItem');

  const handleSelect = useCallback(() => {
    if (isDisabled) return;
    onSelect?.();
    // Selecting an item always dismisses the menu — the expected behaviour for
    // every command menu on every desktop platform.
    close();
  }, [close, isDisabled, onSelect]);

  const styles = cn(
    'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors',
    '[&_svg]:size-4 [&_svg]:shrink-0',
    isDisabled
      ? 'cursor-not-allowed text-fg-disabled'
      : intent === 'critical'
        ? 'text-critical-fg hover:bg-critical-subtle'
        : 'text-fg hover:bg-surface-hover',
  );

  const content = (
    <>
      {icon ? <span className="text-fg-subtle">{icon}</span> : null}
      <span className="flex-1 truncate">{children}</span>
      {shortcut ? <span className="text-2xs text-fg-subtle">{shortcut}</span> : null}
    </>
  );

  if (to && !isDisabled) {
    return (
      <Link role="menuitem" to={to} onClick={close} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={isDisabled}
      onClick={handleSelect}
      className={styles}
    >
      {content}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-2xs font-semibold tracking-wide text-fg-subtle uppercase">
      {children}
    </div>
  );
}
