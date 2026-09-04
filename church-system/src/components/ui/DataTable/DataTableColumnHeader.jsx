'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export function DataTableColumnHeader({ column, title, className = '' }) {
  if (!column || !column.getCanSort || !column.getCanSort()) {
    return (
      <div className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${className}`}>
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={`group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors select-none -ml-1.5 px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 ${className}`}
    >
      <span>{title}</span>
      {sorted === 'desc' ? (
        <ArrowDown className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
      ) : sorted === 'asc' ? (
        <ArrowUp className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}

export default DataTableColumnHeader;
