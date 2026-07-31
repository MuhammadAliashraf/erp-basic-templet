import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const pkg: { version: string } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
);

/**
 * Vite configuration.
 *
 * Env contract: only variables prefixed with `VITE_` are exposed to the client
 * bundle. See `.env.example` and `src/config/env.ts` for the validated schema.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],

    // Compile-time constants. Declared for TypeScript in `src/global.d.ts`.
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: Number(env.VITE_DEV_SERVER_PORT ?? 5173),
      strictPort: false,
      open: false,
      // Proxy keeps the browser same-origin in development so cookie-based
      // auth behaves identically to production behind a reverse proxy.
      proxy: env.VITE_DEV_PROXY_TARGET
        ? {
            '/api': {
              target: env.VITE_DEV_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },

    preview: {
      port: 4173,
    },

    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: mode !== 'production',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          /**
           * Stable vendor chunks keep long-term caching effective: shipping an
           * application change should not invalidate the React bundle a user
           * already has. Grouped by release cadence, not by size.
           */
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;

            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            if (/[\\/]node_modules[\\/](@reduxjs|react-redux|redux|immer|reselect)[\\/]/.test(id)) {
              return 'vendor-state';
            }
            if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) {
              return 'vendor-forms';
            }
            return undefined;
          },
        },
      },
    },
  };
});
