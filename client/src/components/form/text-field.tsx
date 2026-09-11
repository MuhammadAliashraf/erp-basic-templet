import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from '../ui/input';
import { FormField } from './form-field';

export interface TextFieldProps<TFieldValues extends FieldValues> extends Omit<
  InputProps,
  'name' | 'defaultValue' | 'value' | 'onChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  isRequired?: boolean;
  isOptional?: boolean;
  /** Wrapper class. Use `inputClassName` to style the control itself. */
  className?: string;
  inputClassName?: string;
}

/**
 * Text input bound to React Hook Form.
 *
 * `Controller` rather than `register`: it keeps the field's error state local,
 * so typing in one field does not re-render the whole form.
 */
export function TextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  hint,
  isRequired,
  isOptional,
  className,
  inputClassName,
  ...inputProps
}: TextFieldProps<TFieldValues>) {
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
          isOptional={isOptional}
          className={className}
        >
          <Input
            {...inputProps}
            className={inputClassName}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | number | undefined) ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={field.disabled ?? inputProps.disabled}
          />
        </FormField>
      )}
    />
  );
}
