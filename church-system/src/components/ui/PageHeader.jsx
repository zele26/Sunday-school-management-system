'use client';

import React from 'react';
import { cn } from './utils';

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80 dark:border-slate-800 transition-colors',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        {Icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 dark:bg-blue-500/20 text-[var(--brand-primary)] dark:text-blue-400 shrink-0 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
