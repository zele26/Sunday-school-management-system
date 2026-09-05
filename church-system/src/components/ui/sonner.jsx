'use client';

import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-900 group-[.toaster]:text-slate-900 group-[.toaster]:dark:text-slate-100 group-[.toaster]:border-slate-200 group-[.toaster]:dark:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:font-sans',
          description: 'group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-[#1657b8] group-[.toast]:text-white group-[.toast]:font-bold group-[.toast]:rounded-xl group-[.toast]:text-xs',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:dark:bg-slate-800 group-[.toast]:text-slate-600 group-[.toast]:rounded-xl',
          success:
            'group-[.toaster]:border-emerald-200 group-[.toaster]:dark:border-emerald-900/50 group-[.toaster]:bg-emerald-50/90 group-[.toaster]:dark:bg-emerald-950/40',
          error:
            'group-[.toaster]:border-rose-200 group-[.toaster]:dark:border-rose-900/50 group-[.toaster]:bg-rose-50/90 group-[.toaster]:dark:bg-rose-950/40',
          info:
            'group-[.toaster]:border-blue-200 group-[.toaster]:dark:border-blue-900/50 group-[.toaster]:bg-blue-50/90 group-[.toaster]:dark:bg-blue-950/40',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
