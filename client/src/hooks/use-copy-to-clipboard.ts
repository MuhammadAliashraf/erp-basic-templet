import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text to the clipboard and reports transient success.
 *
 * Falls back to the legacy `execCommand` path for non-secure contexts, where
 * the async Clipboard API is unavailable — an on-premises reality for internal
 * tools served over plain HTTP.
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let succeeded: boolean;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          succeeded = true;
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          // Deprecated, but the only option outside a secure context — which
          // internal tools served over plain HTTP still are.
          succeeded = document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      } catch {
        succeeded = false;
      }

      setIsCopied(succeeded);
      if (succeeded) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsCopied(false), resetAfterMs);
      }

      return succeeded;
    },
    [resetAfterMs],
  );

  return { copy, isCopied };
}
