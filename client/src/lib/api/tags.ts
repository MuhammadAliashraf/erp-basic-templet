/**
 * Cache tag registry.
 *
 * Every tag the application uses is declared here and passed to `createApi`.
 * Features add their own entries as they are built; keeping the list in one
 * place is what makes cross-feature invalidation (`invalidatesTags`) reviewable.
 */
export const API_TAGS = {
  /** The authenticated principal and its permissions. */
  Session: 'Session',
  /** The effective authorisation policy for the current session. */
  AccessPolicy: 'AccessPolicy',
  /** RBAC roles. */
  Role: 'Role',
  /** The permission catalogue. */
  Permission: 'Permission',
  /** Infrastructure-level: an entity list, for demonstration and reuse. */
  Entity: 'Entity',
} as const;

export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];

/**
 * Builds `providesTags` for a list endpoint: one tag per item plus a `LIST`
 * sentinel, so a create/delete can invalidate the list without touching the
 * cached detail entries.
 */
export function providesList<TItem extends { id: string | number }>(
  items: TItem[] | undefined,
  tag: ApiTag,
) {
  return items
    ? [{ type: tag, id: 'LIST' as const }, ...items.map((item) => ({ type: tag, id: item.id }))]
    : [{ type: tag, id: 'LIST' as const }];
}
