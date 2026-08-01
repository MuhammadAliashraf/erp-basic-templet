import axios, { type AxiosError } from 'axios';

import { ApiErrorCode, type ApiErrorPayload } from '@/types/api';

/**
 * The single error type the application deals with.
 *
 * Every failure that leaves the HTTP layer is an `HttpError`, so components,
 * thunks and RTK Query all branch on the same stable shape instead of poking at
 * `error.response?.data?.errors?.[0]`.
 */
export class HttpError extends Error implements ApiErrorPayload {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly traceId?: string;
  readonly details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'HttpError';
    this.code = payload.code;
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
    this.traceId = payload.traceId;
    this.details = payload.details;

    // Restores the prototype chain after transpilation to ES5-era targets.
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /** 4xx — the caller sent something wrong and a retry will not help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** 5xx or a transport failure — retrying may succeed. */
  get isServerError(): boolean {
    return this.status >= 500 || this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.code === ApiErrorCode.VALIDATION;
  }

  toJSON(): ApiErrorPayload {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      fieldErrors: this.fieldErrors,
      traceId: this.traceId,
      details: this.details,
    };
  }
}

/** Default user-facing copy per status. Backend messages take precedence. */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request could not be processed. Please review your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state of the resource.',
  422: 'Some of the submitted values are invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Please try again later.',
  502: 'The service is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

function codeForStatus(status: number): string {
  if (status === 401) return ApiErrorCode.UNAUTHORIZED;
  if (status === 403) return ApiErrorCode.FORBIDDEN;
  if (status === 404) return ApiErrorCode.NOT_FOUND;
  if (status === 409) return ApiErrorCode.CONFLICT;
  if (status === 422) return ApiErrorCode.VALIDATION;
  if (status === 429) return ApiErrorCode.RATE_LIMITED;
  if (status >= 500) return ApiErrorCode.SERVER;
  return ApiErrorCode.UNKNOWN;
}

/** Loose view of the error bodies commonly returned by API gateways. */
interface ServerErrorBody {
  code?: string;
  message?: string;
  error?: string | { message?: string; code?: string };
  detail?: string;
  errors?: Record<string, string[] | string> | { field: string; message: string }[];
  traceId?: string;
  requestId?: string;
}

/** Accepts the several field-error conventions seen in the wild. */
function extractFieldErrors(body: ServerErrorBody | undefined): Record<string, string[]> | undefined {
  if (!body?.errors) return undefined;

  if (Array.isArray(body.errors)) {
    return body.errors.reduce<Record<string, string[]>>((accumulator, item) => {
      (accumulator[item.field] ??= []).push(item.message);
      return accumulator;
    }, {});
  }

  return Object.entries(body.errors).reduce<Record<string, string[]>>((accumulator, [key, value]) => {
    accumulator[key] = Array.isArray(value) ? value : [value];
    return accumulator;
  }, {});
}

function extractMessage(body: ServerErrorBody | undefined, status: number): string {
  if (typeof body?.message === 'string' && body.message) return body.message;
  if (typeof body?.error === 'string' && body.error) return body.error;
  if (typeof body?.error === 'object' && body.error?.message) return body.error.message;
  if (typeof body?.detail === 'string' && body.detail) return body.detail;
  return STATUS_MESSAGES[status] ?? 'Something went wrong. Please try again.';
}

/**
 * Converts anything thrown by Axios — or by application code — into an
 * `HttpError`. This is the only place that knows about Axios error internals.
 */
export function normalizeError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;

  if (axios.isCancel(error)) {
    return new HttpError({
      code: ApiErrorCode.CANCELLED,
      message: 'The request was cancelled.',
      status: 0,
    });
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ServerErrorBody>;

    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new HttpError({
        code: ApiErrorCode.TIMEOUT,
        message: 'The request timed out. Please check your connection and try again.',
        status: 0,
      });
    }

    if (!axiosError.response) {
      return new HttpError({
        code: ApiErrorCode.NETWORK,
        message: 'Unable to reach the server. Please check your network connection.',
        status: 0,
      });
    }

    const { status, data } = axiosError.response;

    return new HttpError({
      code: data?.code ?? codeForStatus(status),
      message: extractMessage(data, status),
      status,
      fieldErrors: extractFieldErrors(data),
      traceId: data?.traceId ?? data?.requestId,
      details: data,
    });
  }

  return new HttpError({
    code: ApiErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    status: 0,
    details: error,
  });
}

/** Narrowing helper for `catch` blocks and RTK Query error selectors. */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Recognises the *serialised* form of an `HttpError`.
 *
 * RTK Query stores errors in Redux, so by the time a component reads one it is
 * a plain `ApiErrorPayload` object and no longer an instance — `isHttpError`
 * correctly returns false for it. Anything reading an error out of the store
 * needs this check instead.
 */
export function isApiErrorPayload(error: unknown): error is ApiErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as ApiErrorPayload).message === 'string' &&
    typeof (error as ApiErrorPayload).code === 'string' &&
    typeof (error as ApiErrorPayload).status === 'number'
  );
}

/** The user-facing message for any caught or cached failure. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isHttpError(error) || isApiErrorPayload(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/** The correlation id, when the backend supplied one. */
export function getErrorTraceId(error: unknown): string | undefined {
  if (isHttpError(error) || isApiErrorPayload(error)) return error.traceId;
  return undefined;
}
