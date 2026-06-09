'use client';
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  Row,
} from '@tanstack/react-table';
import {
  Table, TextInput, Group, Text, Box, ActionIcon,
  Pagination, Select, rem,
} from '@mantine/core';
import {
  IconSearch, IconChevronUp, IconChevronDown, IconSelector,
} from '@tabler/icons-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type CommonMantineTableProps<T extends Record<string, any>> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  renderRowActions?: (row: T) => React.ReactNode;
  enablePagination?: boolean;
  renderBottomToolbar?: boolean;
  renderDetailPanel?: (props: { row: Row<T> }) => React.ReactNode;
  onRowClick?: (row: T) => void;         // ← new
};

// ── Component ─────────────────────────────────────────────────────────────────
function MantineTable<T extends Record<string, any>>({
  data,
  columns,
  enableColumnFilters = true,
  enableGlobalFilter  = true,
  enablePagination    = false,
  renderBottomToolbar = false,
  renderRowActions,
  renderDetailPanel,
  onRowClick,                            // ← new
}: CommonMantineTableProps<T>) {
  const [sorting, setSorting]           = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange:      setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel:      getCoreRowModel(),
    getSortedRowModel:    getSortedRowModel(),
    getFilteredRowModel:  getFilteredRowModel(),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    initialState: { pagination: { pageSize: 10 } },
  });

  const toggleRow = (id: string) =>
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const hasActions = Boolean(renderRowActions);
  const hasDetail  = Boolean(renderDetailPanel);

  return (
    <Box>
      {/* ── Top toolbar ── */}
      {(enableGlobalFilter || (enablePagination && renderBottomToolbar)) && (
        <Group
          justify="space-between"
          px={16} py={12}
          style={{ borderBottom: '1px solid #f0f4f8' }}
          wrap="wrap"
          gap="sm"
        >
          {enableGlobalFilter && (
            <TextInput
              value={globalFilter}
              onChange={e => setGlobalFilter(e.currentTarget.value)}
              placeholder="Search…"
              leftSection={<IconSearch size={14} color="#94a3b8" />}
              size="xs"
              radius="md"
              style={{ width: rem(220) }}
              styles={{ input: { border: '1px solid #e2e8f0', fontSize: rem(13) } }}
            />
          )}

          {enablePagination && (
            <Group gap={8}>
              <Text fz={12} c="dimmed">Rows per page:</Text>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onChange={val => table.setPageSize(Number(val ?? 10))}
                data={['5', '10', '20', '50']}
                size="xs"
                radius="md"
                style={{ width: rem(70) }}
                styles={{ input: { border: '1px solid #e2e8f0', fontSize: rem(12) } }}
              />
            </Group>
          )}
        </Group>
      )}

      {/* ── Table ── */}
      <Table highlightOnHover style={{ tableLayout: 'fixed', width: '100%' }}>
        {/* Head */}
        <Table.Thead style={{ background: '#fafbfc', borderBottom: '1px solid #f0f4f8' }}>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Tr key={headerGroup.id}>
              {hasDetail && <Table.Th style={{ width: rem(40), padding: `${rem(10)} ${rem(8)}` }} />}

              {headerGroup.headers.map(header => (
                <Table.Th
                  key={header.id}
                  style={{
                    width: header.getSize() !== 150 ? rem(header.getSize()) : undefined,
                    padding: `${rem(10)} ${rem(16)}`,
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <Group gap={4} wrap="nowrap">
                    <Text
                      fz={11} fw={600} c="gray.5"
                      style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                    {header.column.getCanSort() && (
                      <>
                        {header.column.getIsSorted() === 'asc'  && <IconChevronUp   size={13} color="#1A5276" />}
                        {header.column.getIsSorted() === 'desc' && <IconChevronDown size={13} color="#1A5276" />}
                        {!header.column.getIsSorted()           && <IconSelector    size={13} color="#cbd5e1" />}
                      </>
                    )}
                  </Group>
                </Table.Th>
              ))}

              {hasActions && (
                <Table.Th style={{ width: rem(80), padding: `${rem(10)} ${rem(16)}` }}>
                  <Text fz={11} fw={600} c="gray.5" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Actions
                  </Text>
                </Table.Th>
              )}
            </Table.Tr>
          ))}
        </Table.Thead>

        {/* Body */}
        <Table.Tbody>
          {table.getRowModel().rows.length === 0 ? (
            <Table.Tr>
              <Table.Td
                colSpan={columns.length + (hasDetail ? 1 : 0) + (hasActions ? 1 : 0)}
                style={{ textAlign: 'center', padding: rem(40) }}
              >
                <Text fz={13} c="dimmed">No records to display</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <Table.Tr
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background 0.15s',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {/* Expand toggle */}
                  {hasDetail && (
                    <Table.Td style={{ padding: `${rem(12)} ${rem(8)}`, width: rem(40) }}>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation(); // don't trigger row click
                          toggleRow(row.id);
                        }}
                      >
                        {expandedRows[row.id]
                          ? <IconChevronUp size={13} />
                          : <IconChevronDown size={13} />}
                      </ActionIcon>
                    </Table.Td>
                  )}

                  {/* Data cells */}
                  {row.getVisibleCells().map(cell => (
                    <Table.Td key={cell.id} style={{ padding: `${rem(12)} ${rem(16)}` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}

                  {/* Row actions */}
                  {hasActions && (
                    <Table.Td
                      style={{ padding: `${rem(12)} ${rem(16)}` }}
                      onClick={(e) => e.stopPropagation()} // don't trigger row click
                    >
                      {renderRowActions!(row.original)}
                    </Table.Td>
                  )}
                </Table.Tr>

                {/* Detail panel row */}
                {hasDetail && expandedRows[row.id] && (
                  <Table.Tr style={{ background: '#f8fafc' }}>
                    <Table.Td
                      colSpan={columns.length + (hasDetail ? 1 : 0) + (hasActions ? 1 : 0)}
                      style={{ padding: `${rem(12)} ${rem(24)}` }}
                    >
                      {renderDetailPanel!({ row })}
                    </Table.Td>
                  </Table.Tr>
                )}
              </React.Fragment>
            ))
          )}
        </Table.Tbody>
      </Table>

      {/* ── Bottom toolbar ── */}
      {renderBottomToolbar && enablePagination && (
        <Group
          justify="space-between"
          px={20} py={12}
          style={{ borderTop: '1px solid #f0f4f8' }}
          wrap="wrap"
        >
          <Text fz={12} c="dimmed">
            Showing{' '}
            <Text span fw={600} c="dark.6">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </Text>
            {' – '}
            <Text span fw={600} c="dark.6">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}
            </Text>
            {' of '}
            <Text span fw={600} c="dark.6">{table.getFilteredRowModel().rows.length}</Text>
            {' results'}
          </Text>

          <Pagination
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={page => table.setPageIndex(page - 1)}
            size="sm"
            radius="md"
            styles={{ control: { fontSize: rem(12) } }}
          />
        </Group>
      )}
    </Box>
  );
}

export default MantineTable;
export type { CommonMantineTableProps };
export type { Row as MRT_Row, ColumnDef as MRT_ColumnDef } from '@tanstack/react-table';