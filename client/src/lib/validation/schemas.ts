import { z } from 'zod';

/**
 * Reusable Zod primitives.
 *
 * Validation rules that appear in more than one form belong here so error copy
 * stays consistent across the product. Feature schemas compose these.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .email('Enter a valid email address.')
  .max(254, 'Email address is too long.')
  .toLowerCase();

/** Sign-in: only assert non-empty. Never leak the policy on the login screen. */
export const passwordSchema = z.string().min(1, 'Password is required.');

/** Registration / password change: the full policy. */
export const strongPasswordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Include at least one lowercase letter.')
  .regex(/[A-Z]/, 'Include at least one uppercase letter.')
  .regex(/\d/, 'Include at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Include at least one symbol.');

export const requiredString = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const optionalString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{7,20}$/, 'Enter a valid phone number.');

export const urlSchema = z.string().trim().url('Enter a valid URL.');

export const uuidSchema = z.string().uuid('Invalid identifier.');

/** Positive integer, coerced from the strings that inputs and URLs produce. */
export const positiveInt = z.coerce.number().int().positive();

/** Query parameters shared by every paginated list screen. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

/** Confirms two fields match; attaches the error to the confirmation field. */
export function withMatchingFields<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  field: string,
  confirmField: string,
  message = 'The values do not match.',
) {
  return schema.refine(
    (value) => (value as Record<string, unknown>)[field] === (value as Record<string, unknown>)[confirmField],
    { message, path: [confirmField] },
  );
}
