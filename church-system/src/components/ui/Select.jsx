'use client';

import React from 'react';
import { cn } from './utils';

export const Select = React.forwardRef(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-150',
            'border-slate-200 dark:border-slate-800 focus:border-[var(--brand-primary)] dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:focus:ring-blue-500/20',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export default Select;
