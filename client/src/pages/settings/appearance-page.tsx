import { LuCheck, LuMonitor, LuMoon, LuSun } from 'react-icons/lu';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { Card, CardBody, CardHeader } from '@/components/ui';
import {
  selectTableDensity,
  type TableDensity,
  tableDensityChanged,
  type ThemePreference,
  useTheme,
} from '@/features/ui';
import { useDocumentTitle } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Appearance preferences.
 *
 * Both settings apply instantly rather than on save — a preview the user has to
 * commit to is worse than one they can simply see.
 */

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { value: 'light', label: 'Light', description: 'Always use the light theme', icon: <LuSun /> },
  { value: 'dark', label: 'Dark', description: 'Always use the dark theme', icon: <LuMoon /> },
  {
    value: 'system',
    label: 'System',
    description: 'Match your operating system',
    icon: <LuMonitor />,
  },
];

const DENSITY_OPTIONS: { value: TableDensity; label: string; description: string }[] = [
  { value: 'comfortable', label: 'Comfortable', description: 'More breathing room between rows' },
  { value: 'compact', label: 'Compact', description: 'Fit more rows on screen' },
];

function OptionCard({
  isSelected,
  onSelect,
  icon,
  label,
  description,
}: {
  isSelected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
        isSelected
          ? 'border-accent bg-surface-selected'
          : 'border-border bg-surface hover:bg-surface-hover',
      )}
    >
      {icon ? (
        <span className="mt-0.5 shrink-0 text-fg-muted [&_svg]:size-4" aria-hidden="true">
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-xs text-fg-muted">{description}</span>
      </span>

      {/* A checkmark, not just a border colour — selection must not rely on hue. */}
      {isSelected ? (
        <LuCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
      ) : null}
    </button>
  );
}

export default function AppearancePage() {
  useDocumentTitle('Appearance settings');

  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const density = useAppSelector(selectTableDensity);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Theme"
          description="Applies immediately and is remembered on this device."
        />
        <CardBody className="grid gap-2 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              isSelected={theme === option.value}
              onSelect={() => setTheme(option.value)}
              icon={option.icon}
              label={option.label}
              description={option.description}
            />
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Table density" description="Controls row height in data tables." />
        <CardBody className="grid gap-2 sm:grid-cols-2">
          {DENSITY_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              isSelected={density === option.value}
              onSelect={() => dispatch(tableDensityChanged(option.value))}
              label={option.label}
              description={option.description}
            />
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
