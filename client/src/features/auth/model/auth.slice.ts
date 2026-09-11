import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { localStorageService, StorageKeys } from '@/lib/storage';

import type { AuthState, AuthUser, Permission, Role } from './auth.types';

/**
 * A minimal root-state shape that is local to this slice.
 *
 * Using the real `RootState` from `@/app/store/types` would create a circular
 * dependency: root-reducer → auth → auth.slice → store/types → root-reducer.
 * Declaring only the `auth` key here breaks that cycle while keeping selectors
 * fully typed.
 */
interface AuthRootState {
  auth: AuthState;
}

/**
 * Session state.
 *
 * Only the *user* lives here. Tokens are deliberately kept out of Redux — see
 * `lib/http/token-store.ts` for why — so the store stays serialisable and no
 * credential is ever written into a devtools trace or a persisted state dump.
 */

const initialState: AuthState = {
  // Hydrating from storage lets the shell render immediately on reload; the
  // bootstrap request then confirms or clears it.
  user: localStorageService.get<AuthUser | null>(StorageKeys.user, null),
  status: 'idle',
  error: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticationStarted(state) {
      state.status = 'authenticating';
      state.error = null;
    },

    sessionEstablished(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
      state.isInitialized = true;
      localStorageService.set(StorageKeys.user, action.payload);
    },

    authenticationFailed(state, action: PayloadAction<string | null>) {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = action.payload;
      state.isInitialized = true;
      localStorageService.remove(StorageKeys.user);
    },

    /** Cleared session — used for both explicit sign-out and a failed refresh. */
    sessionEnded(state) {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
      state.isInitialized = true;
      localStorageService.remove(StorageKeys.user);
    },

    /** Applies a profile update without a full re-authentication. */
    userUpdated(state, action: PayloadAction<Partial<AuthUser>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      localStorageService.set(StorageKeys.user, state.user);
    },

    errorCleared(state) {
      state.error = null;
    },
  },
});

export const {
  authenticationStarted,
  sessionEstablished,
  authenticationFailed,
  sessionEnded,
  userUpdated,
  errorCleared,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export const selectAuthState = (state: AuthRootState) => state.auth;
export const selectCurrentUser = (state: AuthRootState) => state.auth.user;
export const selectAuthStatus = (state: AuthRootState) => state.auth.status;
export const selectAuthError = (state: AuthRootState) => state.auth.error;
export const selectIsAuthInitialized = (state: AuthRootState) => state.auth.isInitialized;
export const selectIsAuthenticated = (state: AuthRootState) =>
  state.auth.status === 'authenticated';

/** Memoised so a new array identity never re-renders every consumer. */
export const selectPermissions = createSelector(
  selectCurrentUser,
  (user): Permission[] => user?.permissions ?? [],
);

export const selectRoles = createSelector(selectCurrentUser, (user): Role[] => user?.roles ?? []);
