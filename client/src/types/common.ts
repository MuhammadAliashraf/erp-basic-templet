/**
 * Framework-agnostic type helpers shared across the application.
 * Nothing in here may import from `@/features` or `@/components`.
 */

/** Makes the listed keys optional while leaving the rest untouched. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Makes the listed keys required while leaving the rest untouched. */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** A value that may still be loading. */
export type Nullable<T> = T | null;

export type Maybe<T> = T | null | undefined;

/** Object whose values are all of type `V`, keyed by a string union. */
export type Dictionary<V, K extends string = string> = Record<K, V>;

/**
 * Widens a literal union to also accept arbitrary strings while keeping
 * autocomplete for the known members.
 */
export type LooseUnion<T extends string> = T | (string & {});

/** Recursively marks every property optional — useful for partial updates. */
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Extracts the element type of an array. */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

/** Prettifies intersections so hover tooltips show a flat object. */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Sort direction used by tables and list queries. */
export type SortDirection = 'asc' | 'desc';

export interface SortState<TField extends string = string> {
  field: TField;
  direction: SortDirection;
}

/** Status of any asynchronous unit of work. */
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/** Generic option shape consumed by selects, radios and filters. */
export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
}

/** Visual intent shared by badges, alerts, toasts and buttons. */
export type Intent = 'neutral' | 'accent' | 'positive' | 'caution' | 'critical';

/** Control size scale shared across the design system. */
export type Size = 'sm' | 'md' | 'lg';
