'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from './utils';

export function ThemeToggle({ className, variant = 'icon' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800', className)} />
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700', className)}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer active:opacity-85',
            theme === 'light'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
          title="ደማቅ እይታ"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>ደማቅ</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer active:opacity-85',
            theme === 'dark'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
          title="ጨለማ እይታ"
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>ጨለማ</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer active:opacity-85',
            theme === 'system'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
          title="የመሣሪያው ቅንብር"
        >
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span>የመሣሪያው</span>
        </button>
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] active:scale-95 cursor-pointer',
        className
      )}
      aria-label="የገጽታ እይታ መቀየሪያ"
      title={isDark ? 'ወደ ደማቅ እይታ ቀይር' : 'ወደ ጨለማ እይታ ቀይር'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-[#1657b8] transition-transform duration-200" />
      )}
    </button>
  );
}

export default ThemeToggle;
