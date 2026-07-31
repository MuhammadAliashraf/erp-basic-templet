/**
 * Keyboard shortcut past the navigation.
 *
 * Visually hidden until focused. Without it, a keyboard user must tab through
 * the entire sidebar on every page load before reaching the content — the
 * single highest-impact accessibility affordance in an app with a persistent
 * nav rail.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only-focusable fixed left-3 top-3 z-[100] rounded-md bg-accent px-3 py-2 text-sm font-medium text-fg-on-accent shadow-lg"
    >
      Skip to main content
    </a>
  );
}
