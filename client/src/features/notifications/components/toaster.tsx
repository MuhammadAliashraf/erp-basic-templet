import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from 'react-icons/lu';
import { Link } from 'react-router';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { cn } from '@/lib/utils';
import type { Intent } from '@/types/common';

import { selectToasts, type Toast,toastDismissed } from '../model/notifications.slice';

const ICONS: Record<Intent, React.ReactNode> = {
  neutral: <LuInfo />,
  accent: <LuInfo />,
  positive: <LuCircleCheck />,
  caution: <LuTriangleAlert />,
  critical: <LuCircleAlert />,
};

const ICON_STYLES: Record<Intent, string> = {
  neutral: 'text-fg-subtle',
  accent: 'text-accent',
  positive: 'text-positive',
  caution: 'text-caution',
  critical: 'text-critical',
};

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toast.duration == null) return;
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), toast.duration);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
      className="pointer-events-auto flex w-full gap-3 rounded-md border border-border bg-surface-raised p-3 shadow-lg"
    >
      <span className={cn('mt-0.5 shrink-0 [&_svg]:size-4', ICON_STYLES[toast.intent])} aria-hidden="true">
        {ICONS[toast.intent]}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs break-words text-fg-muted">{toast.description}</p>
        ) : null}
        {toast.action ? (
          <Link
            to={toast.action.href}
            onClick={() => dispatch(toastDismissed(toast.id))}
            className="mt-1.5 inline-block text-xs font-medium text-accent-fg hover:underline"
          >
            {toast.action.label}
          </Link>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid size-6 shrink-0 place-items-center rounded-sm text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <LuX className="size-3.5" />
      </button>
    </motion.li>
  );
}

/**
 * Renders the toast queue.
 *
 * Mounted once, near the root. The region is `aria-live="polite"` so messages
 * are announced without interrupting whatever the user is currently doing, and
 * `pointer-events-none` on the container keeps the page clickable around the
 * toasts.
 *
 * Positioned bottom-right on desktop and full-width at the top on mobile, where
 * the bottom of the screen is occupied by browser and OS chrome.
 */
export function Toaster() {
  const toasts = useAppSelector(selectToasts);

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed z-[60] flex flex-col gap-2',
        'inset-x-3 top-3 sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:w-88',
      )}
    >
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </ul>
    </div>,
    document.body,
  );
}
