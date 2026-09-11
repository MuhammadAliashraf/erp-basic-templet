import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names and resolves Tailwind conflicts so the last
 * declaration wins. This is what makes every component's `className` prop a
 * reliable override point:
 *
 * ```tsx
 * <Button className="px-8" />  // overrides the variant's own padding
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
