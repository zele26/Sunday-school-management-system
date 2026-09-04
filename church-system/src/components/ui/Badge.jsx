'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './utils';

export const badgeVariants = cva(
  'inline-flex items-center font-bold uppercase tracking-wider rounded-full transition-colors',
  {
    variants: {
      variant: {
        approved:
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        active:
          'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        pending:
          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        rejected:
          'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        gold:
          'bg-[var(--brand-gold)]/20 text-amber-800 dark:text-amber-300 border border-[var(--brand-gold)]/40',
        neutral:
          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        info:
          'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-1 gap-1.5',
        lg: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export function Badge({ className, variant, size, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {children}
    </span>
  );
}

export default Badge;
