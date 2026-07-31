/** String helpers used across the design system. */

/** Unicode combining diacritical marks, stripped after NFKD normalisation. */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/** Removes accents so comparisons and slugs behave for non-ASCII input. */
function normalizeText(value: string): string {
  return value.normalize('NFKD').replace(COMBINING_MARKS, '');
}

/** `"ada lovelace"` -> `"AL"`. Used by `<Avatar>` when no image is available. */
export function getInitials(value: string | null | undefined, maxLength = 2): string {
  if (!value) return '';

  const parts = value
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, maxLength).toUpperCase();

  return parts
    .slice(0, maxLength)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Truncates in the middle so both ends stay readable: `"file...name.pdf"`. */
export function truncateMiddle(value: string, maxLength = 32): string {
  if (value.length <= maxLength) return value;
  const head = Math.ceil((maxLength - 1) / 2);
  const tail = Math.floor((maxLength - 1) / 2);
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

/** `"userAccountId"` -> `"User Account Id"` — for auto-labelling table columns. */
export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

/** URL/DOM-id safe slug. */
export function slugify(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Case- and accent-insensitive "contains", for client-side filtering. */
export function fuzzyIncludes(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return normalizeText(haystack).toLowerCase().includes(normalizeText(needle).toLowerCase());
}
