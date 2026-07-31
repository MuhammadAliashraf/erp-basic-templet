/** Object and collection helpers. */

/** Type-safe `Object.keys`. */
export function objectKeys<T extends object>(value: T): (keyof T)[] {
  return Object.keys(value) as (keyof T)[];
}

/** Type-safe `Object.entries`. */
export function objectEntries<T extends object>(value: T): [keyof T, T[keyof T]][] {
  return Object.entries(value) as [keyof T, T[keyof T]][];
}

/** Returns a copy containing only the listed keys. */
export function pick<T extends object, K extends keyof T>(value: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in value) result[key] = value[key];
  }
  return result;
}

/** Returns a copy without the listed keys. */
export function omit<T extends object, K extends keyof T>(value: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...value };
  for (const key of keys) delete result[key];
  return result;
}

/**
 * Strips `undefined`, `null` and empty-string entries.
 * Used before serialising query parameters so URLs stay clean.
 */
export function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined && entry !== null && entry !== '') {
      result[key as keyof T] = entry as T[keyof T];
    }
  }
  return result;
}

/** Groups items by a derived key. */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (accumulator, item) => {
      const key = getKey(item);
      (accumulator[key] ??= []).push(item);
      return accumulator;
    },
    {} as Record<K, T[]>,
  );
}

/** Removes duplicates, optionally by a derived identity. */
export function uniqueBy<T>(items: readonly T[], getKey: (item: T) => unknown = (item) => item): T[] {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Shallow structural equality — the comparison RTK selectors expect. */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}
