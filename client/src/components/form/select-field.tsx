import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Select, type SelectProps } from '../ui/select';
import { FormField } from './form-field';

export interface SelectFieldProps<TFieldValues extends FieldValues>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  isRequired?: boolean;
  className?: string;
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  hint,
  isRequired,
  className,
  ...selectProps
}: SelectFieldProps<TFieldValues>) {
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
          <Select
            {...selectProps}
            name={field.name}
            ref={field.ref}
            value={(field.value as string | undefined) ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        </FormField>
      )}
    />
  );
}
