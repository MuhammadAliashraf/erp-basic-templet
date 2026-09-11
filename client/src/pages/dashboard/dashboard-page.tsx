import { LuArrowDownRight, LuArrowUpRight, LuDownload, LuPlus } from 'react-icons/lu';

import { PageContainer, PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, CardHeader, Separator } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';
import { cn, formatNumber } from '@/lib/utils';

/**
 * Dashboard.
 *
 * A layout reference, not a business screen: it demonstrates the page header,
 * the metric row and a two-column responsive grid, using placeholder figures.
 * Replace the contents; keep the structure.
 */

interface Metric {
  id: string;
  label: string;
  value: number;
  /** Percentage change against the previous period. */
  delta: number;
  /** Whether an increase is good. Cost going up is not a win. */
  isIncreasePositive: boolean;
}

const METRICS: Metric[] = [
  { id: 'requests', label: 'Open requests', value: 1284, delta: 4.2, isIncreasePositive: false },
  {
    id: 'resolved',
    label: 'Resolved this week',
    value: 3921,
    delta: 12.8,
    isIncreasePositive: true,
  },
  { id: 'sla', label: 'Within SLA', value: 97, delta: 0.6, isIncreasePositive: true },
  { id: 'queue', label: 'Awaiting approval', value: 42, delta: -8.1, isIncreasePositive: false },
];

/**
 * Metric tile.
 *
 * Monochrome by design. Colour is reserved for the delta, where it carries
 * meaning — a wall of coloured cards trains users to ignore colour entirely.
 */
function MetricTile({ metric }: { metric: Metric }) {
  const isImprovement = metric.delta >= 0 === metric.isIncreasePositive;
  const DeltaIcon = metric.delta >= 0 ? LuArrowUpRight : LuArrowDownRight;

  return (
    <Card className="p-4">
      <p className="truncate text-xs text-fg-muted">{metric.label}</p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-fg tabular-nums">
        {formatNumber(metric.value)}
      </p>
      <p
        className={cn(
          'mt-1.5 inline-flex items-center gap-1 text-xs font-medium',
          isImprovement ? 'text-positive-fg' : 'text-critical-fg',
        )}
      >
        <DeltaIcon aria-hidden="true" className="size-3.5" />
        {Math.abs(metric.delta).toFixed(1)}%
        <span className="font-normal text-fg-subtle">vs last week</span>
      </p>
    </Card>
  );
}

const ACTIVITY = [
  {
    id: '1',
    actor: 'System',
    action: 'Nightly reconciliation completed',
    time: '02:15',
    intent: 'positive' as const,
  },
  {
    id: '2',
    actor: 'A. Rahman',
    action: 'Approved request REQ-4821',
    time: '09:41',
    intent: 'neutral' as const,
  },
  {
    id: '3',
    actor: 'System',
    action: 'Integration timeout on connector 3',
    time: '11:07',
    intent: 'caution' as const,
  },
  {
    id: '4',
    actor: 'M. Chen',
    action: 'Updated access policy for Finance',
    time: '13:22',
    intent: 'neutral' as const,
  },
];

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is the current state of your workspace.`}
        breadcrumbs={[{ label: 'Home', to: ROUTES.dashboard }, { label: 'Dashboard' }]}
        actions={
          <>
            <Button leadingIcon={<LuDownload />}>Export</Button>
            <Button variant="primary" leadingIcon={<LuPlus />}>
              New request
            </Button>
          </>
        }
      />

      <PageContainer>
        {/* One column on mobile, two on tablet, four on desktop. */}
        <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric) => (
            <MetricTile key={metric.id} metric={metric} />
          ))}
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent activity"
              description="Events across your workspace in the last 24 hours."
              actions={
                <Button size="sm" variant="ghost">
                  View all
                </Button>
              }
            />
            <ul className="divide-y divide-border">
              {ACTIVITY.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Badge intent={entry.intent} withDot size="sm">
                    {entry.actor}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{entry.action}</span>
                  <time className="shrink-0 font-mono text-2xs text-fg-subtle">{entry.time}</time>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="System status" />
            <CardBody className="space-y-3">
              {[
                { label: 'API gateway', status: 'Operational', intent: 'positive' as const },
                { label: 'Background jobs', status: 'Operational', intent: 'positive' as const },
                { label: 'Reporting service', status: 'Degraded', intent: 'caution' as const },
              ].map((service, index, all) => (
                <div key={service.label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-fg">{service.label}</span>
                    <Badge intent={service.intent} withDot size="sm">
                      {service.status}
                    </Badge>
                  </div>
                  {index < all.length - 1 ? <Separator className="mt-3" /> : null}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
