'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './utils';

export const cardVariants = cva(
  'rounded-2xl transition-colors duration-150 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100',
        glass:
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-lg text-slate-900 dark:text-slate-100',
        elevated:
          'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 text-slate-900 dark:text-slate-100 hover:shadow-2xl',
        gold:
          'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 border border-amber-500/30 dark:border-amber-400/30 shadow-md text-slate-900 dark:text-slate-100',
        subtle:
          'bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-slate-100',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export const Card = React.forwardRef(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-xs sm:text-sm text-slate-500 dark:text-slate-400', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-4 border-t border-slate-100 dark:border-slate-800', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

export default Card;
