'use client';

import React from 'react';
import { cn } from './utils';

export const Input = React.forwardRef(
  ({ className, type = 'text', icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-150',
            'border-slate-200 dark:border-slate-800 focus:border-[var(--brand-primary)] dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 dark:focus:ring-blue-500/20',
            Icon && 'pl-10',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
