import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useId } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';

import { useFocusTrap, useKeyDown, useLockBodyScroll } from '@/hooks';
import { cn } from '@/lib/utils';

import { IconButton } from './icon-button';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  /** Hides the built-in header, for fully custom panels such as the mobile nav. */
  hasHeader?: boolean;
  'aria-label'?: string;
}

const SIZE_STYLES: Record<NonNullable<DrawerProps['size']>, string> = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-xl',
};

/**
 * Edge-anchored panel.
 *
 * Preferred over a modal for side-by-side work — filters, detail inspection,
 * record editing — because it keeps the underlying list visible for context.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'md',
  hasHeader = true,
  'aria-label': ariaLabel,
}: DrawerProps) {
  const titleId = useId();

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
  useLockBodyScroll(isOpen);
  useKeyDown('Escape', onClose, isOpen);

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className={cn('fixed inset-0 z-50 flex', side === 'right' && 'justify-end')}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? ariaLabel : undefined}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'relative flex h-full w-full flex-col bg-surface shadow-xl',
              side === 'right' ? 'border-l' : 'border-r',
              'border-border',
              SIZE_STYLES[size],
            )}
          >
            {hasHeader ? (
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3">
                <h2 id={titleId} className="truncate text-md font-semibold text-fg">
                  {title}
                </h2>
                <IconButton
                  aria-label="Close panel"
                  icon={<LuX />}
                  size="sm"
                  onClick={onClose}
                  className="-mr-1"
                />
              </header>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

            {footer ? (
              <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface-sunken px-4 py-3">
                {footer}
              </footer>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
