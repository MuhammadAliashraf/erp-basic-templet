/// <reference types="vite/client" />

/**
 * Typed contract for the client-side environment.
 *
 * Keep this in sync with `.env.example` and the runtime schema in
 * `src/config/env.ts`. This interface gives editors autocomplete; the Zod
 * schema is what actually guarantees the values are present and well-formed.
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_AUTH_STRATEGY: 'cookie' | 'bearer';
  readonly VITE_ENABLE_MOCK_API: string;
  readonly VITE_DEV_SERVER_PORT: string;
  readonly VITE_DEV_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
