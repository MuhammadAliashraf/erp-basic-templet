import { type ReactNode, useId } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';

export interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: ReactNode;
  /** Supporting copy under the label. */
  description?: ReactNode;
  /** Renders a switch instead of a checkbox, for settings that apply instantly. */
  as?: 'checkbox' | 'switch';
  disabled?: boolean;
  className?: string;
}

/**
 * Boolean control with a clickable label.
 *
 * The label and description are inside the `<label>`, so the whole block is a
 * hit target — a small change that makes a settings page far easier to use on
 * touch devices.
 */
export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  as = 'checkbox',
  disabled,
  className,
}: CheckboxFieldProps<TFieldValues>) {
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const Control = as === 'switch' ? Switch : Checkbox;

        return (
          <div className={cn('flex flex-col gap-1', className)}>
            <label className="flex cursor-pointer items-start gap-2.5">
              <span className={cn('flex items-center', as === 'switch' ? 'h-5' : 'h-5')}>
                <Control
                  name={field.name}
                  ref={field.ref}
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  disabled={disabled}
                  aria-describedby={description ? descriptionId : undefined}
                />
              </span>

              <span className="min-w-0">
                <span className="block text-sm text-fg">{label}</span>
                {description ? (
                  <span id={descriptionId} className="mt-0.5 block text-xs text-fg-muted">
                    {description}
                  </span>
                ) : null}
              </span>
            </label>

            {fieldState.error?.message ? (
              <p role="alert" className="text-xs text-critical-fg">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
