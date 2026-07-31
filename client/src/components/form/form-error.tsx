import type { FieldErrors, FieldValues } from 'react-hook-form';

import { Alert } from '../ui/alert';

export interface FormErrorProps<TFieldValues extends FieldValues> {
  errors: FieldErrors<TFieldValues>;
  className?: string;
}

/**
 * Renders the form-level (`root`) error raised by `useFormErrorHandler`.
 *
 * Place it directly above the fields: a submission failure that appears only
 * next to the submit button is easy to miss on a long form.
 */
export function FormError<TFieldValues extends FieldValues>({
  errors,
  className,
}: FormErrorProps<TFieldValues>) {
  const message = errors.root?.serverError?.message ?? errors.root?.message;
  if (!message) return null;

  return (
    <Alert intent="critical" className={className}>
      {message}
    </Alert>
  );
}
