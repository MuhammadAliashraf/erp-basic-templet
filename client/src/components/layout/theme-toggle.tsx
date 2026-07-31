import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';

import { useTheme } from '@/features/ui';

import { IconButton } from '../ui/icon-button';
import { Tooltip } from '../ui/tooltip';

const ICONS = {
  light: <LuSun />,
  dark: <LuMoon />,
  system: <LuMonitor />,
} as const;

const LABELS = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
} as const;

/**
 * Cycles light -> dark -> system.
 *
 * A three-state cycle rather than a binary switch, because "follow the OS" is a
 * genuinely different preference from either fixed theme — and the one most
 * users expect after setting it once at the OS level.
 */
export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Tooltip content={`${LABELS[theme]} — click to change`}>
      <IconButton
        aria-label={`Change theme. Current: ${LABELS[theme]}`}
        icon={ICONS[theme]}
        size="md"
        onClick={cycleTheme}
      />
    </Tooltip>
  );
}
