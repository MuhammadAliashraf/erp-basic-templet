import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { type FieldValues, useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Any Zod schema whose *input* is an object — the only shape a form can bind to.
 * Constraining here means passing e.g. `z.string()` is a compile error at the
 * call site rather than a confusing failure inside the resolver.
 */
export type FormSchema = z.ZodType<unknown, FieldValues>;

export type UseZodFormProps<TSchema extends FormSchema> = Omit<
  UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>,
  'resolver'
> & {
  schema: TSchema;
};

/**
 * `useForm` pre-wired to a Zod schema.
 *
 * Input and output types are tracked separately, which matters whenever the
 * schema transforms: the fields are typed as what the user enters
 * (`z.input`), while `handleSubmit` hands the callback the parsed, defaulted,
 * coerced value (`z.output`). The schema is therefore the single source of
 * truth for both validation and typing — they cannot drift.
 *
 * Validation runs on submit first, then on change. That is the least irritating
 * cadence: a field is never marked invalid while the user is still filling it
 * in for the first time.
 *
 * @example
 * const form = useZodForm({ schema: loginSchema, defaultValues: { email: '' } });
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 */
export function useZodForm<TSchema extends FormSchema>({
  schema,
  ...formProps
}: UseZodFormProps<TSchema>): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: standardSchemaResolver<z.input<TSchema>, unknown, z.output<TSchema>>(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    ...formProps,
  });
}
