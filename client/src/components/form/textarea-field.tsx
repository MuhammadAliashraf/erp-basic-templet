import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Textarea, type TextareaProps } from '../ui/textarea';
import { FormField } from './form-field';

export interface TextareaFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextareaProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: ReactNode;
  hint?: ReactNode;
  isRequired?: boolean;
  isOptional?: boolean;
  className?: string;
}

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  hint,
  isRequired,
  isOptional,
  className,
  ...textareaProps
}: TextareaFieldProps<TFieldValues>) {
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
          <Textarea
            {...textareaProps}
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
