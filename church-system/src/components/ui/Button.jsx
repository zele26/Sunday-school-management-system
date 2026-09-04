'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:opacity-85',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white shadow-sm focus-visible:ring-[var(--brand-primary)]',
        gold:
          'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black shadow-sm focus-visible:ring-amber-400',
        secondary:
          'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus-visible:ring-slate-400',
        success:
          'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm focus-visible:ring-emerald-500',
        danger:
          'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus-visible:ring-rose-500',
        outline:
          'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-slate-400',
        ghost:
          'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus-visible:ring-slate-400',
        glass:
          'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md shadow-sm',
      },
      size: {
        xs: 'text-[11px] px-2.5 py-1 rounded-lg gap-1',
        sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
        md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2',
        lg: 'text-sm sm:text-base px-6 py-3.5 rounded-2xl gap-2.5',
        icon: 'p-2 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, fullWidth, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
