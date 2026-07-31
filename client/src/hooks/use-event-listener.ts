import { useEffect, useRef } from 'react';

/**
 * Attaches a DOM event listener with an always-current handler.
 *
 * The indirection through a ref means the listener is not detached and
 * re-attached on every render just because the handler identity changed —
 * a common source of missed events and jank.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document,
  options?: AddEventListenerOptions,
): void;
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: Window | Document | HTMLElement | null,
  options?: AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element ?? window;
    if (!target?.addEventListener) return;

    const listener = (event: Event) => handlerRef.current(event);
    target.addEventListener(eventName, listener, options);

    return () => target.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

/**
 * Runs a handler when a specific key is pressed anywhere in the document.
 * Used for Escape-to-close and command-palette shortcuts.
 */
export function useKeyDown(
  key: string,
  handler: (event: KeyboardEvent) => void,
  enabled = true,
): void {
  useEventListener(
    'keydown',
    (event) => {
      if (!enabled) return;
      if (event.key === key) handler(event);
    },
    document,
  );
}
