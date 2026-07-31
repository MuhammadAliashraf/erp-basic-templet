import { RouterProvider } from 'react-router';

import { AppProviders } from './providers';
import { router } from './router';

/**
 * Application root.
 *
 * Intentionally trivial: providers wrap the router, and nothing else lives
 * here. Every decision about what renders is a routing decision.
 */
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
