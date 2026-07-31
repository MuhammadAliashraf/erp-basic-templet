import { useEffect, useRef } from 'react';

/**
 * Invokes a handler when a pointer press or focus lands outside the element.
 *
 * Listens on `pointerdown` rather than `click` so the menu closes on press —
 * matching native desktop behaviour and preventing a click from activating an
 * element that the closing menu was covering.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: PointerEvent | FocusEvent) => void,
  enabled = true,
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && ref.current !== null && !ref.current.contains(target);

    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) handlerRef.current(event);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) handlerRef.current(event);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, [enabled]);

  return ref;
}
