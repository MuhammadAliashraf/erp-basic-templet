import { useEffect } from 'react';

import { appConfig } from '@/config/app.config';

/**
 * Sets `document.title` for the lifetime of a screen.
 *
 * A correct title is not cosmetic: it is what screen readers announce on route
 * change and what users scan when several console tabs are open.
 */
export function useDocumentTitle(title: string | undefined, options: { exact?: boolean } = {}) {
  const { exact = false } = options;

  useEffect(() => {
    if (!title) return;

    const previous = document.title;
    document.title = exact ? title : `${title} · ${appConfig.titleSuffix}`;

    return () => {
      document.title = previous;
    };
  }, [title, exact]);
}
