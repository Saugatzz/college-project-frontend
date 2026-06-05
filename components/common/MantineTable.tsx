"use client";

import React from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
  MRT_Row,
} from "mantine-react-table";

type CommonMantineTableProps<T extends Record<string, any>> = {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  renderRowActions?: (row: T) => React.ReactNode;
  enablePagination?: boolean;
  renderBottomToolbar?: boolean;
  renderDetailPanel?: (props: { row: MRT_Row<T> }) => React.ReactNode; // 👈 add this
};

function MantineTable<T extends Record<string, any>>({
  data,
  columns,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  enablePagination = false,
  renderBottomToolbar = false,
  renderDetailPanel, // 👈 destructure
}: CommonMantineTableProps<T>) {
  const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilters,
    enableGlobalFilter,
    renderEmptyRowsFallback: () => (
      <div className="mrt-empty-center">No records to display</div>
    ),
    enablePagination,
    renderBottomToolbar,
    renderDetailPanel, // 👈 pass through
  });

  return <MantineReactTable table={table} />;
}

export default MantineTable;