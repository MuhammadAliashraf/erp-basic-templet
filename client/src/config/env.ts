import { z } from 'zod';

/**
 * Runtime environment validation.
 *
 * A misconfigured deployment should fail loudly at startup with an actionable
 * message, not silently at the first network call. This module is imported by
 * `main.tsx` before anything else, so parsing happens exactly once.
 */

/** Accepts "true"/"1"/"false"/"0" and real booleans from `import.meta.env`. */
const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === 'boolean' ? value : ['true', '1', 'yes'].includes(value.toLowerCase()),
  );

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Enterprise Admin'),
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_API_TIMEOUT: z.coerce.number().int().positive().default(30_000),
  VITE_AUTH_STRATEGY: z.enum(['cookie', 'bearer']).default('bearer'),
  VITE_ENABLE_MOCK_API: booleanish.default(false),
});

type RawEnv = z.infer<typeof envSchema>;

function parseEnv(): RawEnv {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment configuration.\n\n${issues}\n\n` +
        'Copy `.env.example` to `.env.local` and provide the missing values.',
    );
  }

  return result.data;
}

const parsed = parseEnv();

/**
 * Validated, immutable environment. Import this — never `import.meta.env`
 * directly — so every consumer gets parsed, typed values.
 */
export const env = Object.freeze({
  appName: parsed.VITE_APP_NAME,
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  apiTimeout: parsed.VITE_API_TIMEOUT,
  authStrategy: parsed.VITE_AUTH_STRATEGY,
  enableMockApi: parsed.VITE_ENABLE_MOCK_API,

  /** Vite build-time flags, normalised into the same object. */
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});

export type Env = typeof env;
