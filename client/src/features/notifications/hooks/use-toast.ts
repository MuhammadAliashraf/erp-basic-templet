import { useCallback, useMemo } from 'react';

import { useAppDispatch } from '@/app/store';
import { isHttpError } from '@/lib/http';

import {
  allToastsDismissed,
  toastDismissed,
  type ToastInput,
  toastShown,
} from '../model/notifications.slice';

/**
 * Ergonomic toast API for components.
 *
 * ```tsx
 * const toast = useToast();
 * toast.success({ title: 'Settings saved' });
 * toast.fromError(error);   // normalises any thrown value into a message
 * ```
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const show = useCallback((input: ToastInput) => dispatch(toastShown(input)), [dispatch]);

  return useMemo(
    () => ({
      show,

      info: (input: Omit<ToastInput, 'intent'>) => show({ ...input, intent: 'accent' }),
      success: (input: Omit<ToastInput, 'intent'>) => show({ ...input, intent: 'positive' }),
      warning: (input: Omit<ToastInput, 'intent'>) => show({ ...input, intent: 'caution' }),
      error: (input: Omit<ToastInput, 'intent'>) => show({ ...input, intent: 'critical' }),

      /** Surfaces any caught value, using the normalised message when present. */
      fromError: (error: unknown, fallbackTitle = 'Something went wrong') => {
        const description = isHttpError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : undefined;

        return show({ title: fallbackTitle, description, intent: 'critical' });
      },

      dismiss: (id: string) => dispatch(toastDismissed(id)),
      dismissAll: () => dispatch(allToastsDismissed()),
    }),
    [dispatch, show],
  );
}
