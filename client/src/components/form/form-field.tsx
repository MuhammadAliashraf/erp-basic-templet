import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils';

import { Label } from '../ui/label';

export interface FormFieldProps {
  label?: ReactNode;
  /** Guidance shown under the control while it is valid. */
  hint?: ReactNode;
  /** Validation message. Replaces the hint and applies the error treatment. */
  error?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  className?: string;
  children: ReactElement<Record<string, unknown>>;
}

/**
 * Layout and accessibility wrapper for a single control.
 *
 * Generates the id, wires `htmlFor`, `aria-describedby` and `aria-invalid`, and
 * forwards `isInvalid` to the child. Doing this once here is what keeps every
 * form in the product accessible without the author having to think about it.
 */
export function FormField({
  label,
  hint,
  error,
  isRequired,
  isOptional,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = (children.props.id as string | undefined) ?? generatedId;

  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(' ');

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        isInvalid: Boolean(error),
        'aria-describedby': describedBy || undefined,
      })
    : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={controlId} isRequired={isRequired} isOptional={isOptional}>
          {label}
        </Label>
      ) : null}

      {control}

      {error ? (
        // `role="alert"` announces the message the moment validation fails.
        <p id={errorId} role="alert" className="text-xs text-critical-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
