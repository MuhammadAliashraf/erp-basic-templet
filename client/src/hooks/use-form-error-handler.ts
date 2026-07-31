import { useCallback } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { isHttpError } from '@/lib/http';

/**
 * Maps a server rejection onto a React Hook Form instance.
 *
 * Per-field messages from `HttpError.fieldErrors` are attached to their inputs;
 * anything else becomes a form-level error under the `root` key, which forms
 * render in a banner above the fields.
 *
 * @example
 * const applyServerErrors = useFormErrorHandler<LoginFormValues>();
 * try { await save(values); }
 * catch (error) { applyServerErrors(error, form.setError); }
 */
export function useFormErrorHandler<TFieldValues extends FieldValues>() {
  return useCallback(
    (error: unknown, setError: UseFormSetError<TFieldValues>, fallbackMessage?: string) => {
      if (isHttpError(error) && error.fieldErrors) {
        let matched = false;

        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (!messages?.length) continue;
          matched = true;
          setError(field as Path<TFieldValues>, { type: 'server', message: messages[0] });
        }

        // A 422 with no recognisable field still has to be shown somewhere.
        if (matched) return;
      }

      const message = isHttpError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : (fallbackMessage ?? 'The request could not be completed. Please try again.');

      setError('root.serverError' as Path<TFieldValues>, { type: 'server', message });
    },
    [],
  );
}
