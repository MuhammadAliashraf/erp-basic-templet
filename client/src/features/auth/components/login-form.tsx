import { LuArrowRight } from 'react-icons/lu';
import { Link, useNavigate, useSearchParams } from 'react-router';

import {
  CheckboxField,
  FormActions,
  FormError,
  PasswordField,
  TextField,
  useZodForm,
} from '@/components/form';
import { Button } from '@/components/ui';
import { appConfig } from '@/config/app.config';
import { ROUTES } from '@/config/routes';
import { useFormErrorHandler } from '@/hooks';

import { useAuth } from '../hooks/use-auth';
import { type LoginFormValues, loginSchema } from '../model/auth.schemas';

/**
 * Sign-in form.
 *
 * Lives in the auth *feature*, not in `pages/`: the page is only a placement
 * decision, while this form is the reusable unit a product might also render
 * inside a session-expiry dialog.
 */
export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applyServerErrors = useFormErrorHandler<LoginFormValues>();

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    const result = await login({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (!result.success) {
      applyServerErrors(new Error(result.error), setError);
      return;
    }

    const redirectTo = searchParams.get('redirectTo');
    // Same-origin paths only — see `PublicOnlyRoute` for the same guard.
    const isSafeRedirect =
      redirectTo != null && redirectTo.startsWith('/') && !redirectTo.startsWith('//');

    void navigate(isSafeRedirect ? redirectTo : appConfig.auth.defaultAuthenticatedPath, {
      replace: true,
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError errors={errors} />

      <TextField
        control={control}
        name="email"
        label="Email address"
        type="email"
        autoComplete="username"
        placeholder="you@company.com"
        // Focus the first field on load: this screen has one job.
        autoFocus
        isRequired
      />

      <div>
        <PasswordField
          control={control}
          name="password"
          label="Password"
          autoComplete="current-password"
          isRequired
        />
        <div className="mt-1.5 flex justify-end">
          <Link
            to={ROUTES.forgotPassword}
            className="rounded-xs text-xs text-accent-fg hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <CheckboxField
        control={control}
        name="rememberMe"
        label="Keep me signed in"
        description="Not recommended on shared or public devices."
      />

      <FormActions className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          trailingIcon={<LuArrowRight />}
        >
          Sign in
        </Button>
      </FormActions>
    </form>
  );
}
