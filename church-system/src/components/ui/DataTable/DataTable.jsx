'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Inbox, Loader2 } from 'lucide-react';
import { DataTablePagination } from './DataTablePagination';
import { Card } from '../Card';

/**
 * Reusable DataTable powered by TanStack Table v8.
 * Supports both client-side mode and server-paginated mode.
 */
export function DataTable({
  columns,
  data = [],
  isLoading = false,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  globalFilter,
  onGlobalFilterChange,
  emptyMessage = 'ምንም መረጃ አልተገኘም (No data found)',
  emptyIcon: EmptyIcon = Inbox,
  showPagination = true,
  pageSizeOptions = [10, 20, 30, 50, 100],
  totalItemsCount,
  getRowId = (row, index) => row._id || row.id || String(index),
  className = '',
  onRowClick = null,
}) {
  // Internal state if uncontrolled
  const [internalSorting, setInternalSorting] = useState([]);
  const [internalPagination, setInternalPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');

  const isManualPagination = typeof pageCount === 'number';

  const table = useReactTable({
    data: data || [],
    columns,
    pageCount: isManualPagination ? pageCount : undefined,
    manualPagination: isManualPagination,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onGlobalFilterChange,
    state: {
      sorting: sorting !== undefined ? sorting : internalSorting,
      pagination: pagination !== undefined ? pagination : internalPagination,
      rowSelection: rowSelection !== undefined ? rowSelection : internalRowSelection,
      globalFilter: globalFilter !== undefined ? globalFilter : internalGlobalFilter,
    },
    onSortingChange: onSortingChange || setInternalSorting,
    onPaginationChange: onPaginationChange || setInternalPagination,
    onRowSelectionChange: onRowSelectionChange || setInternalRowSelection,
    onGlobalFilterChange: onGlobalFilterChange || setInternalGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: !isManualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: !onSortingChange ? getSortedRowModel() : undefined,
    getFilteredRowModel: !onGlobalFilterChange ? getFilteredRowModel() : undefined,
    getRowId,
    enableRowSelection: true,
  });

  return (
    <Card variant="default" padding="none" className={`overflow-hidden border border-slate-200/80 dark:border-slate-800 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`cell-skel-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    row.getIsSelected() ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-slate-800 dark:text-slate-200 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <EmptyIcon className="w-10 h-10 opacity-30 stroke-1" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          totalItemsCount={totalItemsCount}
        />
      )}
    </Card>
  );
}

/**
 * Reusable checkbox helper for TanStack Table header & cell select column
 */
export function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] accent-[var(--brand-primary)] cursor-pointer ${className}`}
      {...rest}
    />
  );
}

export default DataTable;
