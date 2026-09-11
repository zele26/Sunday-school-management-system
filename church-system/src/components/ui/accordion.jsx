'use client';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'border-b border-slate-200/90 dark:border-slate-800/90 last:border-b-0 transition-colors',
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-slate-900 dark:text-white transition-all hover:text-[#1e3a8a] dark:hover:text-amber-300 [&[data-state=open]>div>svg]:rotate-180 [&[data-state=open]>div]:bg-[#1e3a8a] [&[data-state=open]>div]:text-white dark:[&[data-state=open]>div]:bg-amber-400 dark:[&[data-state=open]>div]:text-slate-950 cursor-pointer min-h-[52px] select-none gap-3',
        className
      )}
      {...props}
    >
      <span className="leading-snug">{children}</span>
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
        <ChevronDown className="h-4.5 w-4.5 shrink-0 transition-transform duration-300 ease-out" />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-xs sm:text-sm text-slate-600 dark:text-slate-300 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down leading-relaxed"
    {...props}
  >
    <div className={cn('pb-5 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed font-normal', className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
