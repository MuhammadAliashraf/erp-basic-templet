import { combineReducers } from '@reduxjs/toolkit';

// Import directly from slice files — NOT from the feature barrel exports.
// The barrels re-export hooks, listeners, and components that all import from
// `@/app/store`, creating a circular dependency that prevents `authReducer`
// (and others) from being initialised in time.
import { authReducer } from '@/features/auth/model/auth.slice';
import { notificationsReducer } from '@/features/notifications/model/notifications.slice';
import { rbacReducer } from '@/features/rbac/model/rbac.slice';
import { uiReducer } from '@/features/ui/model/ui.slice';
import { apiSlice } from '@/lib/api';

/**
 * Root reducer.
 *
 * Client state is grouped by feature; all *server* state lives under the single
 * `api` key managed by RTK Query. Adding a feature means adding one line here
 * and nothing else.
 */
export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  rbac: rbacReducer,
  ui: uiReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
