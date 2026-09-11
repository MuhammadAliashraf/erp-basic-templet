import {
  addListener,
  createListenerMiddleware,
  type TypedAddListener,
  type TypedStartListening,
} from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from './types';

/**
 * Listener middleware — the sanctioned place for reactive side effects.
 *
 * Prefer a listener over an effect in a component whenever the reaction is a
 * consequence of *state*, not of a rendered view: persisting preferences,
 * clearing caches on logout, emitting analytics. Listeners run outside React,
 * so the behaviour cannot be lost by unmounting a component.
 */
export const listenerMiddleware = createListenerMiddleware();

/** Pre-typed `startListening`, so `state` and `dispatch` are inferred. */
export const startAppListening = listenerMiddleware.startListening as TypedStartListening<
  RootState,
  AppDispatch
>;

/** Pre-typed `addListener`, for adding listeners dynamically at runtime. */
export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
