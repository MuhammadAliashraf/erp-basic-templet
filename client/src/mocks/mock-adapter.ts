import type {
  AxiosAdapter,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AxiosHeaders } from 'axios';

import { httpClient } from '@/lib/http';
import { fuzzyIncludes } from '@/lib/utils';
import type { ExampleRecord } from '@/pages/design-system/example-records.api';
import type { ApiErrorPayload, PaginatedResponse } from '@/types/api';

import { MOCK_CREDENTIALS, MOCK_RECORDS, MOCK_USER } from './fixtures';

/**
 * In-browser mock backend.
 *
 * Installed as an Axios *adapter*, so requests are intercepted below the
 * interceptor chain: auth headers, error normalisation and token refresh all
 * still run exactly as they would against a real server. That makes the mock a
 * faithful rehearsal rather than a bypass.
 *
 * Activated by `VITE_ENABLE_MOCK_API=true`, and the module is only imported in
 * that case so it is tree-shaken out of a production build.
 */

interface MockHandler {
  method: string;
  /** Matched against the request path, without query string. */
  path: RegExp;
  handle: (context: {
    body: Record<string, unknown>;
    params: URLSearchParams;
    config: AxiosRequestConfig;
  }) => { status: number; data: unknown };
}

/** Simulated latency, so loading states are actually visible while developing. */
const LATENCY_MS = 350;

const ISSUED_TOKEN = 'mock-access-token';

function error(
  status: number,
  code: string,
  message: string,
): { status: number; data: ApiErrorPayload } {
  return { status, data: { code, message, status } };
}

function paginate<T>(items: T[], params: URLSearchParams): PaginatedResponse<T> {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.max(1, Number(params.get('pageSize')) || 25);
  const start = (page - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  };
}

function sortRecords(records: ExampleRecord[], params: URLSearchParams): ExampleRecord[] {
  const field = (params.get('sortBy') ?? 'name') as keyof ExampleRecord;
  const direction = params.get('sortDirection') === 'desc' ? -1 : 1;

  return [...records].sort((a, b) => {
    const left = String(a[field] ?? '');
    const right = String(b[field] ?? '');
    return left.localeCompare(right) * direction;
  });
}

const HANDLERS: MockHandler[] = [
  {
    method: 'POST',
    path: /\/auth\/login$/,
    handle: ({ body }) => {
      const email = String(body.email ?? '').toLowerCase();
      const password = String(body.password ?? '');

      if (email !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
        return error(401, 'INVALID_CREDENTIALS', 'The email address or password is incorrect.');
      }

      return {
        status: 200,
        data: {
          user: MOCK_USER,
          accessToken: ISSUED_TOKEN,
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        },
      };
    },
  },
  {
    method: 'GET',
    path: /\/auth\/me$/,
    handle: ({ config }) => {
      const authorization = String(
        (config.headers as Record<string, unknown> | undefined)?.Authorization ?? '',
      );

      if (!authorization.includes(ISSUED_TOKEN)) {
        return error(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.');
      }

      return { status: 200, data: MOCK_USER };
    },
  },
  {
    method: 'POST',
    path: /\/auth\/logout$/,
    handle: () => ({ status: 204, data: null }),
  },
  {
    method: 'POST',
    path: /\/auth\/refresh$/,
    handle: () => ({
      status: 200,
      data: { accessToken: ISSUED_TOKEN, refreshToken: 'mock-refresh-token' },
    }),
  },
  {
    method: 'POST',
    path: /\/auth\/forgot-password$/,
    handle: () => ({
      status: 200,
      // Deliberately does not reveal whether the account exists.
      data: { message: 'If an account exists for that address, a reset link has been sent.' },
    }),
  },
  {
    method: 'GET',
    path: /\/example-records$/,
    handle: ({ params }) => {
      const search = params.get('search') ?? '';

      const filtered = search
        ? MOCK_RECORDS.filter(
            (record) =>
              fuzzyIncludes(record.name, search) ||
              fuzzyIncludes(record.email, search) ||
              fuzzyIncludes(record.department, search),
          )
        : MOCK_RECORDS;

      return { status: 200, data: paginate(sortRecords(filtered, params), params) };
    },
  },
];

function buildResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 204 ? 'No Content' : 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

/** Serialises `params` from either an object or a URLSearchParams. */
function toSearchParams(params: unknown): URLSearchParams {
  if (params instanceof URLSearchParams) return params;
  if (!params || typeof params !== 'object') return new URLSearchParams();

  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') result.set(key, String(value));
  }
  return result;
}

/**
 * Replaces the Axios adapter with the mock router.
 * Call once at startup, before the first request is issued.
 */
export function installMockApi(): void {
  const mockAdapter: AxiosAdapter = async (config) => {
    const method = (config.method ?? 'get').toUpperCase();
    const url = config.url ?? '';
    const [path, queryString] = url.split('?');

    const params = toSearchParams(config.params);
    if (queryString) {
      for (const [key, value] of new URLSearchParams(queryString)) params.set(key, value);
    }

    const handler = HANDLERS.find((entry) => entry.method === method && entry.path.test(path));

    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    if (!handler) {
      const notFound = error(404, 'NOT_FOUND', `No mock handler for ${method} ${path}.`);
      return Promise.reject(
        Object.assign(new Error(notFound.data.message), {
          isAxiosError: true,
          config,
          response: buildResponse(config, notFound.status, notFound.data),
        }),
      );
    }

    const body: Record<string, unknown> =
      typeof config.data === 'string'
        ? JSON.parse(config.data)
        : ((config.data as Record<string, unknown>) ?? {});

    const { status, data } = handler.handle({ body, params, config });

    if (status >= 400) {
      // Rejecting with an Axios-shaped error keeps the response interceptor and
      // `normalizeError` on their normal code path.
      return Promise.reject(
        Object.assign(new Error(String((data as ApiErrorPayload).message)), {
          isAxiosError: true,
          config,
          response: buildResponse(config, status, data),
        }),
      );
    }

    return buildResponse(config, status, data);
  };

  httpClient.defaults.adapter = mockAdapter;

  console.warn(
    '[mock-api] Enabled. All HTTP requests are served in-browser. ' +
      'Set VITE_ENABLE_MOCK_API=false to talk to a real backend.',
  );
}
