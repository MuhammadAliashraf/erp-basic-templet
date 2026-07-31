import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useId } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';

import { useFocusTrap, useKeyDown, useLockBodyScroll } from '@/hooks';
import { cn } from '@/lib/utils';

import { IconButton } from './icon-button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Footer actions. Primary action goes last (right-most) on desktop. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Blocks dismissal via backdrop click and Escape. Use for destructive
   * confirmations and any dialog with unsaved input.
   */
  isDismissable?: boolean;
}

const SIZE_STYLES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/**
 * Modal dialog.
 *
 * Accessibility contract, all of which is required for a dialog to be usable:
 * focus is trapped inside and restored on close, Escape dismisses, background
 * scrolling is locked, and the dialog is labelled by its own title.
 *
 * Responsive behaviour: a centred panel on tablet and up; a bottom sheet on
 * mobile, where a centred dialog fights the on-screen keyboard.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  isDismissable = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
  useLockBodyScroll(isOpen);
  useKeyDown('Escape', () => isDismissable && onClose(), isOpen);

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-overlay"
            onClick={isDismissable ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface shadow-xl',
              'rounded-t-xl sm:rounded-lg',
              'border border-border',
              SIZE_STYLES[size],
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <h2 id={titleId} className="text-md font-semibold text-fg">
                  {title}
                </h2>
                {description ? (
                  <p id={descriptionId} className="mt-0.5 text-xs text-fg-muted">
                    {description}
                  </p>
                ) : null}
              </div>

              {isDismissable ? (
                <IconButton
                  aria-label="Close dialog"
                  icon={<LuX />}
                  size="sm"
                  onClick={onClose}
                  className="-mr-1"
                />
              ) : null}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

            {footer ? (
              <footer
                className={cn(
                  'flex flex-col-reverse gap-2 border-t border-border bg-surface-sunken px-4 py-3',
                  'sm:flex-row sm:items-center sm:justify-end',
                )}
              >
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
