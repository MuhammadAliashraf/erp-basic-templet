import type { ReactNode } from 'react';
import { useState } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { LuEye, LuEyeOff } from 'react-icons/lu';

import { Input, type InputProps } from '../ui/input';
import { FormField } from './form-field';

export interface PasswordFieldProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, 'name' | 'type' | 'suffix' | 'value' | 'onChange' | 'onBlur'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  isRequired?: boolean;
  className?: string;
}

/**
 * Password input with a reveal toggle.
 *
 * The toggle is not a convenience: on mobile and for long generated passwords
 * it measurably reduces sign-in failures. It is `tabIndex={-1}` so it does not
 * sit between the password field and the submit button.
 */
export function PasswordField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  hint,
  isRequired,
  className,
  ...inputProps
}: PasswordFieldProps<TFieldValues>) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          hint={hint}
          error={fieldState.error?.message}
          isRequired={isRequired}
          className={className}
        >
          <Input
            {...inputProps}
            type={isRevealed ? 'text' : 'password'}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | undefined) ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            suffix={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsRevealed((current) => !current)}
                aria-label={isRevealed ? 'Hide password' : 'Show password'}
                className="grid size-5 place-items-center rounded-xs text-fg-subtle transition-colors hover:text-fg"
              >
                {isRevealed ? <LuEyeOff /> : <LuEye />}
              </button>
            }
          />
        </FormField>
      )}
    />
  );
}
