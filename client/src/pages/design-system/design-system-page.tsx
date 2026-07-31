import { type ReactNode,useState } from 'react';
import { LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';

import { ConfirmDialog, EmptyState } from '@/components/feedback';
import { PageContainer, PageHeader } from '@/components/layout';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Drawer,
  Input,
  Label,
  Modal,
  Progress,
  Radio,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
} from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/features/notifications';
import { useDisclosure, useDocumentTitle } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Intent } from '@/types/common';

/**
 * Living reference for the design system.
 *
 * Every primitive is rendered here in its real states. Treat it as the visual
 * regression surface: if a token changes, this page shows what it affected.
 *
 * Delete this route when forking the template for a product.
 */

const INTENTS: Intent[] = ['neutral', 'accent', 'positive', 'caution', 'critical'];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="flex flex-wrap items-start gap-4">{children}</CardBody>
    </Card>
  );
}

export default function DesignSystemPage() {
  useDocumentTitle('Design system');

  const toast = useToast();
  const modal = useDisclosure();
  const drawer = useDisclosure();
  const confirm = useDisclosure();
  const [activeTab, setActiveTab] = useState('components');

  return (
    <>
      <PageHeader
        title="Design system"
        description="Every primitive in its real states. Use this page to verify token changes."
        breadcrumbs={[{ label: 'Home', to: ROUTES.dashboard }, { label: 'Design system' }]}
      >
        <Tabs
          aria-label="Design system sections"
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { value: 'components', label: 'Components' },
            { value: 'foundations', label: 'Foundations' },
          ]}
        />
      </PageHeader>

      <PageContainer>
        {activeTab === 'foundations' ? (
          <div className="grid gap-4">
            <Section
              title="Colour"
              description="Semantic tokens only. Components must never reference the raw palette."
            >
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { token: 'bg-surface', label: 'surface' },
                  { token: 'bg-surface-sunken', label: 'surface-sunken' },
                  { token: 'bg-accent', label: 'accent' },
                  { token: 'bg-positive', label: 'positive' },
                  { token: 'bg-caution', label: 'caution' },
                  { token: 'bg-critical', label: 'critical' },
                  { token: 'bg-canvas', label: 'canvas' },
                  { token: 'bg-inverse', label: 'inverse' },
                ].map((swatch) => (
                  <div key={swatch.label} className="flex items-center gap-2.5">
                    <span
                      className={`size-9 shrink-0 rounded-md border border-border ${swatch.token}`}
                    />
                    <span className="font-mono text-xs text-fg-muted">{swatch.label}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Typography"
              description="A dense scale: 14px body, matching SAP Fiori and Fluent rather than the 16px consumer default."
            >
              <div className="w-full space-y-2">
                <p className="text-3xl font-semibold">Display · 28px</p>
                <p className="text-2xl font-semibold">Page title · 22px</p>
                <p className="text-lg font-semibold">Section title · 16px</p>
                <p className="text-base">Body · 14px — the default for all reading text.</p>
                <p className="text-sm text-fg-muted">Dense · 13px — table cells and controls.</p>
                <p className="text-xs text-fg-muted">Label · 12px — field labels and helper text.</p>
                <p className="text-2xs text-fg-subtle">Meta · 11px — badges and timestamps.</p>
              </div>
            </Section>

            <Section title="Elevation" description="Neutral and tight. No coloured glows.">
              {/* Class names are written out in full: Tailwind scans source text,
                  so an interpolated `shadow-${level}` would never be generated. */}
              {(
                [
                  ['xs', 'shadow-xs'],
                  ['sm', 'shadow-sm'],
                  ['md', 'shadow-md'],
                  ['lg', 'shadow-lg'],
                  ['xl', 'shadow-xl'],
                ] as const
              ).map(([level, shadowClass]) => (
                <div
                  key={level}
                  className={cn(
                    'grid h-20 w-28 place-items-center rounded-lg border border-border bg-surface font-mono text-xs text-fg-muted',
                    shadowClass,
                  )}
                >
                  shadow-{level}
                </div>
              ))}
            </Section>
          </div>
        ) : (
          <div className="grid gap-4">
            <Section title="Buttons" description="One primary action per view.">
              <Button variant="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" leadingIcon={<LuTrash2 />}>
                Delete
              </Button>
              <Button variant="link">Link</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Separator orientation="vertical" className="h-8" />
              <Button size="xs">XS</Button>
              <Button size="sm">SM</Button>
              <Button size="md">MD</Button>
              <Button size="lg" leadingIcon={<LuPlus />}>
                LG
              </Button>
            </Section>

            <Section title="Badges" description="Status carried by intent, never colour alone.">
              {INTENTS.map((intent) => (
                <Badge key={intent} intent={intent} withDot>
                  {intent}
                </Badge>
              ))}
              {INTENTS.map((intent) => (
                <Badge key={`solid-${intent}`} intent={intent} variant="solid">
                  {intent}
                </Badge>
              ))}
            </Section>

            <Section title="Form controls">
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-input" isRequired>
                    Text input
                  </Label>
                  <Input id="ds-input" placeholder="Enter a value" prefix={<LuSearch />} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-invalid">Invalid state</Label>
                  <Input id="ds-invalid" defaultValue="not-an-email" isInvalid />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-select">Select</Label>
                  <Select
                    id="ds-select"
                    placeholder="Choose an option"
                    defaultValue=""
                    options={[
                      { label: 'Option one', value: '1' },
                      { label: 'Option two', value: '2' },
                      { label: 'Disabled option', value: '3', disabled: true },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-textarea" isOptional>
                    Textarea
                  </Label>
                  <Textarea id="ds-textarea" placeholder="Longer free text…" rows={3} />
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked /> Checkbox
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox indeterminate /> Indeterminate
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Radio name="ds-radio" defaultChecked /> Radio
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch defaultChecked /> Switch
                </label>
              </div>
            </Section>

            <Section title="Feedback">
              <div className="grid w-full gap-3">
                {INTENTS.map((intent) => (
                  <Alert key={intent} intent={intent} title={`${intent} alert`}>
                    Contextual message tied to a region of the page.
                  </Alert>
                ))}
              </div>
            </Section>

            <Section title="Overlays and notifications">
              <Button onClick={modal.open}>Open modal</Button>
              <Button onClick={drawer.open}>Open drawer</Button>
              <Button variant="danger" onClick={confirm.open}>
                Confirm dialog
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button onClick={() => toast.success({ title: 'Changes saved' })}>Success toast</Button>
              <Button
                onClick={() =>
                  toast.error({
                    title: 'Request failed',
                    description: 'The reporting service did not respond in time.',
                  })
                }
              >
                Error toast
              </Button>
              <Tooltip content="Tooltips appear on hover and on keyboard focus.">
                <Button variant="ghost">Hover me</Button>
              </Tooltip>
            </Section>

            <Section title="Loading and empty states">
              <div className="grid w-full gap-4 lg:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-full" />
                    <Skeleton variant="text" className="w-1/2" />
                  </div>
                  <Progress className="mt-4" value={64} label="Import progress" showValue />
                </Card>

                <Card>
                  <EmptyState
                    size="sm"
                    title="No records found"
                    description="Adjust your filters, or create the first record."
                    action={
                      <Button size="sm" variant="primary" leadingIcon={<LuPlus />}>
                        Create record
                      </Button>
                    }
                  />
                </Card>
              </div>
            </Section>

            <Section title="Avatars">
              <Avatar name="Ada Lovelace" size="xs" />
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Ada Lovelace" size="md" />
              <Avatar name="Ada Lovelace" size="lg" />
            </Section>
          </div>
        )}
      </PageContainer>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Modal dialog"
        description="Focus is trapped, Escape dismisses, and background scrolling is locked."
        footer={
          <>
            <Button onClick={modal.close}>Cancel</Button>
            <Button variant="primary" onClick={modal.close}>
              Save changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          On mobile this becomes a bottom sheet, because a centred dialog fights the on-screen
          keyboard.
        </p>
      </Modal>

      <Drawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        title="Detail panel"
        footer={
          <>
            <Button onClick={drawer.close}>Close</Button>
            <Button variant="primary" onClick={drawer.close}>
              Apply
            </Button>
          </>
        }
      >
        <div className="p-4">
          <p className="text-sm text-fg-muted">
            Drawers keep the underlying list visible, which is why they suit filters and record
            inspection better than a modal.
          </p>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={() => {
          confirm.close();
          toast.success({ title: 'Record deleted' });
        }}
        title="Delete this record?"
        description="This action cannot be undone. The record and its history will be permanently removed."
        confirmLabel="Delete record"
        intent="danger"
      />
    </>
  );
}
