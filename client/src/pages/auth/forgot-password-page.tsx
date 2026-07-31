import { useState } from 'react';
import { LuArrowLeft, LuMailCheck } from 'react-icons/lu';
import { Link } from 'react-router';

import { FormActions, TextField, useZodForm } from '@/components/form';
import { Alert, Button, Card } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { ForgotPasswordFormValues } from '@/features/auth';
import { forgotPasswordSchema, useForgotPasswordMutation } from '@/features/auth';
import { useDocumentTitle, useFormErrorHandler } from '@/hooks';

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestReset] = useForgotPasswordMutation();
  const applyServerErrors = useFormErrorHandler<ForgotPasswordFormValues>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestReset({ email: values.email }).unwrap();
    } catch (error) {
      applyServerErrors(error, setError);
      return;
    }
    setIsSubmitted(true);
  });

  if (isSubmitted) {
    return (
      <Card elevation="raised" className="p-5 sm:p-6">
        <Alert intent="positive" icon={<LuMailCheck />} title="Check your inbox">
          If an account exists for that address, we have sent password reset instructions. The link
          expires in 30 minutes.
        </Alert>

        <Link
          to={ROUTES.login}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xs text-xs text-accent-fg hover:underline"
        >
          <LuArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card elevation="raised" className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-md font-semibold text-fg">Reset your password</h2>
        <p className="mt-1 text-xs text-fg-muted">
          Enter your email address and we will send you a reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          control={control}
          name="email"
          label="Email address"
          type="email"
          autoComplete="username"
          placeholder="you@company.com"
          autoFocus
          isRequired
        />

        <FormActions>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
            Send reset link
          </Button>
        </FormActions>
      </form>

      <Link
        to={ROUTES.login}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xs text-xs text-accent-fg hover:underline"
      >
        <LuArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </Card>
  );
}
