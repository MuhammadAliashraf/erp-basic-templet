/**
 * Transport-level contracts shared by every API slice.
 *
 * These describe the *envelope* the backend speaks, not any business entity.
 * Adjust them once here to match your gateway and every feature follows.
 */

/** Standard success envelope: `{ data, meta? }`. */
export interface ApiResponse<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}

/** Cursor/offset pagination metadata returned alongside list endpoints. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}

/** Query parameters accepted by any list endpoint. */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Normalised error shape. Every failure — network, HTTP, validation or
 * unexpected — is converted into this by `lib/http/http-error.ts`, so UI code
 * never has to branch on Axios internals.
 */
export interface ApiErrorPayload {
  /** Machine-readable code, e.g. `VALIDATION_FAILED`, `UNAUTHORIZED`. */
  code: string;
  /** Human-readable message safe to display to an end user. */
  message: string;
  /** HTTP status, or 0 when the request never reached the server. */
  status: number;
  /** Per-field messages for form-level error mapping. */
  fieldErrors?: Record<string, string[]>;
  /** Correlation id from the backend, surfaced in support flows. */
  traceId?: string;
  details?: unknown;
}

/** Canonical error codes the client reacts to structurally. */
export const ApiErrorCode = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_FAILED',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCodeValue = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
