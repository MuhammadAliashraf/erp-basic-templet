import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { env } from '@/config/env';

/**
 * Application entry point.
 *
 * Bootstrap order matters: the environment is validated first (importing `env`
 * parses and throws on a bad configuration), then the mock API is installed if
 * enabled, and only then is React mounted.
 */
async function bootstrap(): Promise<void> {
  // Dynamic import keeps the mock backend and its fixtures out of the
  // production bundle entirely.
  if (env.enableMockApi) {
    const { installMockApi } = await import('./mocks/mock-adapter');
    installMockApi();
  }

  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root element #root was not found in index.html.');
  }

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  // A failure here means the app never mounted, so React cannot render the
  // message. Fall back to plain DOM.
  console.error('[bootstrap] Failed to start the application.', error);

  const container = document.getElementById('root');
  if (container) {
    container.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 2.5rem; max-width: 40rem; margin: 0 auto; color: #1b1e25;">
        <h1 style="font-size: 1.25rem; margin: 0 0 0.5rem;">Application failed to start</h1>
        <p style="font-size: 0.875rem; color: #555b68; margin: 0 0 1rem;">
          The application could not be initialised. This is usually a configuration problem.
        </p>
        <pre style="font-size: 0.75rem; background: #f0f1f4; padding: 0.75rem; border-radius: 4px; overflow: auto; white-space: pre-wrap;">${
          error instanceof Error ? error.message : String(error)
        }</pre>
      </div>
    `;
  }
});
