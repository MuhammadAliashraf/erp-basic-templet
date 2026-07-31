import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { env } from '@/config/env';
import { registerUiListeners } from '@/features/ui';
import { apiSlice } from '@/lib/api';

import { listenerMiddleware } from './listener-middleware';
import { rootReducer } from './root-reducer';

/**
 * Application store.
 *
 * Middleware order matters: the listener middleware is prepended so it observes
 * actions *before* they reach reducers, while the RTK Query middleware is
 * appended to handle caching, invalidation and polling.
 */
export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // RTK Query's internal actions carry non-serialisable helpers.
        ignoredActions: ['api/executeQuery/fulfilled'],
        ignoredPaths: ['api.queries', 'api.mutations'],
      },
      // Deep-equality scanning every action is expensive on large tables;
      // it pays for itself in development only.
      immutableCheck: env.isDevelopment,
    })
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),

  devTools: env.isDevelopment && {
    name: `${env.appName} (${env.mode})`,
  },
});

/**
 * Enables `refetchOnReconnect` / `refetchOnFocus` by wiring RTK Query to the
 * browser's online and visibility events.
 */
setupListeners(store.dispatch);

/**
 * Registers the application's reactive side effects.
 *
 * Done here at module scope rather than in a component: listeners belong to the
 * store's lifetime, not to any mounted tree, and registering during render
 * would run twice under StrictMode.
 *
 * Features add their `register*Listeners()` call to this block.
 */
registerUiListeners();

export * from './hooks';
export { addAppListener, startAppListening } from './listener-middleware';
export type { AppDispatch, AppStore, AppThunk, RootState } from './types';
