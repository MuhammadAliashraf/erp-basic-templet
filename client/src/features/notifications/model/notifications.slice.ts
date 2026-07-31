import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import { appConfig } from '@/config/app.config';
import type { Intent } from '@/types/common';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  intent: Intent;
  /** Milliseconds before auto-dismissal. `null` requires manual dismissal. */
  duration: number | null;
  /** Optional inline action, e.g. "Undo" or "View details". */
  action?: { label: string; href: string };
}

export type ToastInput = Omit<Toast, 'id' | 'intent' | 'duration'> &
  Partial<Pick<Toast, 'intent' | 'duration'>>;

interface NotificationsState {
  toasts: Toast[];
}

/**
 * Local root-state shape used only by this slice's selectors.
 * Avoids the circular dependency: root-reducer → notifications → notifications.slice → store/types → root-reducer.
 */
interface NotificationsRootState {
  notifications: NotificationsState;
}

const initialState: NotificationsState = { toasts: [] };

/**
 * Transient user feedback.
 *
 * Toasts live in Redux rather than a React context so non-component code —
 * listener middleware, RTK Query `onQueryStarted`, error boundaries — can raise
 * one by dispatching, with no provider in scope.
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        // Oldest-out queue: an unbounded stack of toasts covers the UI.
        if (state.toasts.length >= appConfig.ui.toastLimit) state.toasts.shift();
        state.toasts.push(action.payload);
      },
      prepare(input: ToastInput) {
        return {
          payload: {
            id: nanoid(),
            intent: 'neutral' as Intent,
            duration: appConfig.ui.toastDurationMs,
            ...input,
          } satisfies Toast,
        };
      },
    },

    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },

    allToastsDismissed(state) {
      state.toasts = [];
    },
  },
});

export const { toastShown, toastDismissed, allToastsDismissed } = notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;

export const selectToasts = (state: NotificationsRootState) => state.notifications.toasts;
