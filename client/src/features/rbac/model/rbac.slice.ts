import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AccessPolicy } from './rbac.types';

/**
 * Permission state.
 *
 * Holds the resolved policy plus the administrator's "preview as role" choice.
 * The policy itself is *fetched* server state; it is mirrored here rather than
 * read straight from the RTK Query cache so that the evaluation context has one
 * synchronous source, and so a preview can be layered over it without touching
 * the cache every other consumer shares.
 */

export interface RbacState {
  policy: AccessPolicy | null;
  /** True once a policy resolution has settled, successfully or not. */
  isResolved: boolean;
  /** Set when policy resolution failed; the session falls back to its claims. */
  error: string | null;
  /**
   * Role key an administrator is previewing the interface as.
   *
   * Client-side only and purely visual: it narrows what the UI offers, never
   * what the server accepts. Its value is in letting someone verify a role's
   * navigation and actions before assigning it to a person.
   */
  previewRoleKey: string | null;
}

/** Local root shape — avoids the store → feature → store import cycle. */
interface RbacRootState {
  rbac: RbacState;
}

const initialState: RbacState = {
  policy: null,
  isResolved: false,
  error: null,
  previewRoleKey: null,
};

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    accessPolicyResolved(state, action: PayloadAction<AccessPolicy>) {
      // The policy's requirements use `readonly` arrays, which Immer's draft
      // type cannot express. It is replaced wholesale and never edited in
      // place, so the cast is contained here and the readonly guarantee holds
      // everywhere the policy is actually read.
      state.policy = action.payload as typeof state.policy;
      state.isResolved = true;
      state.error = null;
    },

    /**
     * The policy endpoint failed. The session keeps whatever claims the login
     * response carried, so a policy outage degrades access rather than locking
     * everyone out of a working session.
     */
    accessPolicyFailed(state, action: PayloadAction<string | null>) {
      state.isResolved = true;
      state.error = action.payload;
    },

    accessPolicyCleared() {
      return initialState;
    },

    rolePreviewStarted(state, action: PayloadAction<string>) {
      state.previewRoleKey = action.payload;
    },

    rolePreviewEnded(state) {
      state.previewRoleKey = null;
    },
  },
});

export const {
  accessPolicyResolved,
  accessPolicyFailed,
  accessPolicyCleared,
  rolePreviewStarted,
  rolePreviewEnded,
} = rbacSlice.actions;

export const rbacReducer = rbacSlice.reducer;

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export const selectRbacState = (state: RbacRootState) => state.rbac;
export const selectAccessPolicy = (state: RbacRootState) => state.rbac.policy;
export const selectIsAccessResolved = (state: RbacRootState) => state.rbac.isResolved;
export const selectAccessError = (state: RbacRootState) => state.rbac.error;
export const selectPreviewRoleKey = (state: RbacRootState) => state.rbac.previewRoleKey;
export const selectIsPreviewingRole = (state: RbacRootState) => state.rbac.previewRoleKey !== null;

/** Memoised: the maps are read on every access check in the tree. */
export const selectPolicyMenus = createSelector(
  selectAccessPolicy,
  (policy) => policy?.menus ?? {},
);

export const selectPolicyRoutes = createSelector(
  selectAccessPolicy,
  (policy) => policy?.routes ?? {},
);
