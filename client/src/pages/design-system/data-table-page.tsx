import { useMemo, useState } from 'react';
import { LuDownload, LuEllipsisVertical, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { DataTable, type DataTableColumn } from '@/components/data';
import { PageContainer, PageHeader } from '@/components/layout';
import {
  Badge,
  Button,
  Card,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  IconButton,
  Input,
  Pagination,
} from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/features/notifications';
import { useDebouncedValue, useDocumentTitle, usePagination } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { SortState } from '@/types/common';

import { type ExampleRecord, useGetExampleRecordsQuery } from './example-records.api';

/**
 * Reference implementation of the standard list screen.
 *
 * This is the pattern every listing in a product should follow:
 *   - filter, sort and pagination state live in the URL, so the view is
 *     shareable and survives a refresh;
 *   - the search term is debounced before it reaches the query;
 *   - RTK Query owns loading, error and cached data — the component owns none
 *     of it;
 *   - `<DataTable>` renders the loading, empty and error states itself.
 *
 * Delete this route when forking the template; keep the shape.
 */

const STATUS_INTENT = {
  active: 'positive',
  pending: 'caution',
  suspended: 'critical',
  archived: 'neutral',
} as const;

export default function DataTablePage() {
  useDocumentTitle('Data table');

  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  const search = searchParams.get('q') ?? '';
  const debouncedSearch = useDebouncedValue(search);

  const sort = useMemo<SortState>(
    () => ({
      field: searchParams.get('sortBy') ?? 'name',
      direction: searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc',
    }),
    [searchParams],
  );

  const { page, pageSize, setPage, setPageSize } = usePagination();

  const { data, isFetching, error, refetch } = useGetExampleRecordsQuery({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sort.field,
    sortDirection: sort.direction,
  });

  const columns = useMemo<DataTableColumn<ExampleRecord>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        isSortable: true,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{row.name}</p>
            <p className="truncate text-xs text-fg-muted">{row.email}</p>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        isSortable: true,
        width: '10rem',
        cell: (row) => (
          <Badge intent={STATUS_INTENT[row.status]} withDot size="sm">
            {row.status}
          </Badge>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        isSortable: true,
        hideOnMobile: true,
        cell: (row) => <span className="text-fg-muted">{row.department}</span>,
      },
      {
        id: 'updatedAt',
        header: 'Last updated',
        isSortable: true,
        hideOnMobile: true,
        width: '13rem',
        cell: (row) => (
          <span className="text-xs whitespace-nowrap text-fg-muted">
            {formatDateTime(row.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        width: '4rem',
        cell: (row) => (
          <DropdownMenu>
            <DropdownTrigger>
              {({ isOpen, toggle }) => (
                <IconButton
                  aria-label={`Actions for ${row.name}`}
                  aria-expanded={isOpen}
                  icon={<LuEllipsisVertical />}
                  size="sm"
                  onClick={(event) => {
                    // The row is not clickable here, but stopping propagation
                    // keeps this correct if a row click is added later.
                    event.stopPropagation();
                    toggle();
                  }}
                />
              )}
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem onSelect={() => toast.info({ title: `Viewing ${row.name}` })}>
                View details
              </DropdownItem>
              <DropdownItem
                intent="critical"
                icon={<LuTrash2 />}
                onSelect={() => toast.warning({ title: `Delete requested for ${row.name}` })}
              >
                Delete
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        ),
      },
    ],
    [toast],
  );

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
        // Any change to filtering or ordering invalidates the current page.
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  return (
    <>
      <PageHeader
        title="Data table"
        description="Reference list screen: URL-driven filters, sorting and pagination backed by RTK Query."
        breadcrumbs={[
          { label: 'Home', to: ROUTES.dashboard },
          { label: 'Design system', to: ROUTES.designSystem },
          { label: 'Data table' },
        ]}
        actions={
          <>
            {selectedIds.length > 0 ? (
              <Button
                variant="danger"
                leadingIcon={<LuTrash2 />}
                onClick={() => {
                  toast.warning({ title: `${selectedIds.length} record(s) queued for deletion` });
                  setSelectedIds([]);
                }}
              >
                Delete ({selectedIds.length})
              </Button>
            ) : null}
            <Button leadingIcon={<LuDownload />}>Export</Button>
          </>
        }
      />

      <PageContainer>
        <Card>
          <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              placeholder="Search by name, email or department…"
              aria-label="Search records"
              size="sm"
              prefix={<LuSearch />}
              value={search}
              onChange={(event) => updateParam('q', event.target.value)}
              className="sm:max-w-96"
            />
            <div className="flex-1" />
            <span className="text-xs text-fg-subtle" aria-live="polite">
              {isFetching ? 'Loading…' : `${data?.meta.totalItems ?? 0} records`}
            </span>
          </div>

          <DataTable
            caption="Example records with sortable columns and row selection"
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(row) => row.id}
            isLoading={isFetching && !data}
            error={error}
            onRetry={() => void refetch()}
            sort={sort}
            onSortChange={(next) => {
              updateParam('sortBy', next.field);
              updateParam('sortDir', next.direction);
            }}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {data && data.meta.totalItems > 0 ? (
            <Pagination
              page={data.meta.page}
              pageSize={data.meta.pageSize}
              totalItems={data.meta.totalItems}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}
        </Card>
      </PageContainer>
    </>
  );
}
