'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../Button';
import { Select } from '../Select';

export function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showRowsSelected = true,
  totalItemsCount = null,
}) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = totalItemsCount ?? table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400">
      {/* Left: Row Selection Counter */}
      <div className="flex items-center gap-2">
        {showRowsSelected ? (
          <span>
            {selectedCount > 0 ? (
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedCount}
              </span>
            ) : (
              0
            )}{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalRows}
            </span>{' '}
            row(s) selected
          </span>
        ) : (
          <span>
            Total:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalRows}
            </span>{' '}
            record(s)
          </span>
        )}
      </div>

      {/* Right: Page Size Selector & Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Page size dropdown */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page indicator */}
        <div className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
          Page <span className="font-bold text-slate-900 dark:text-white">{pageIndex + 1}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{Math.max(pageCount, 1)}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTablePagination;
