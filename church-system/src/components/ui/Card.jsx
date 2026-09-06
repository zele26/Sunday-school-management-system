'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from './utils';
import { Badge } from './Badge';

const cardVariants = cva(
  'rounded-2xl sm:rounded-3xl transition-all duration-200 overflow-hidden',
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
        interactive:
          'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/50 dark:hover:border-blue-500/50 transition-all duration-200 text-slate-900 dark:text-slate-100 cursor-pointer',
        gradient:
          'bg-gradient-to-br from-[#1657b8] via-[#124796] to-[#0d3269] text-white border border-blue-400/20 shadow-lg',
      },
      padding: {
        none: 'p-0',
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-8 sm:p-12',
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

const renderCardIcon = (icon, className = 'w-5 h-5') => {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  return <span>{icon}</span>;
};

/**
 * Reusable ActionCard for Dashboard / Navigation Grids
 */
export const ActionCard = React.forwardRef(
  (
    {
      icon: Icon,
      title,
      description,
      badge,
      count,
      onClick,
      href,
      className,
      iconClassName,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'group flex items-center gap-4 p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/50 dark:hover:border-blue-500/50 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 cursor-pointer',
          className
        )}
        {...props}
      >
        {Icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-[var(--brand-primary)] group-hover:text-white dark:group-hover:bg-blue-600 transition-colors duration-200 shadow-xs',
              iconClassName
            )}
          >
            {renderCardIcon(Icon, 'w-5 h-5')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[var(--brand-primary)] dark:group-hover:text-blue-400 transition-colors truncate">
              {title}
            </span>
            {badge && (
              <Badge variant="gold" size="sm">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <span className="block text-xs text-slate-400 mt-0.5 truncate">
              {description}
            </span>
          )}
          {children}
        </div>
        {count && (
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {count}
          </span>
        )}
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--brand-primary)] dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all shrink-0" />
      </button>
    );
  }
);
ActionCard.displayName = 'ActionCard';

/**
 * Reusable FeatureCard for Vision, Mission, Values, Steps, Classes, Announcements, Highlights
 */
export const FeatureCard = React.forwardRef(
  (
    {
      icon: Icon,
      iconBg = 'bg-blue-50 text-[#1657b8]',
      title,
      subtitle,
      description,
      badge,
      step,
      footer,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="default"
        padding="md"
        className={cn(
          'group relative flex flex-col justify-between hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 h-full',
          className
        )}
        {...props}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            {Icon && (
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-300',
                  iconBg
                )}
              >
                {renderCardIcon(Icon, 'w-6 h-6')}
              </div>
            )}
            {step && (
              <span className="text-3xl sm:text-4xl font-black text-slate-200 dark:text-slate-800 select-none group-hover:text-amber-200 dark:group-hover:text-amber-950 transition-colors">
                {step}
              </span>
            )}
            {badge && (
              <Badge variant="neutral" size="sm">
                {badge}
              </Badge>
            )}
          </div>

          {subtitle && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              {subtitle}
            </span>
          )}

          {title && (
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[#1657b8] dark:group-hover:text-blue-400 transition-colors tracking-tight">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {description}
            </p>
          )}

          {children}
        </div>

        {footer && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </Card>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

/**
 * Reusable CourseCard for LMS and distance course listings
 */
export const CourseCard = React.forwardRef(
  (
    {
      code,
      title,
      theme,
      modulesCount,
      progressPct = 0,
      badge,
      actionLabel = 'ትምህርቱን ጀምር',
      onAction,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="default"
        padding="md"
        className={cn(
          'group flex flex-col justify-between hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 h-full',
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {code && (
              <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {code}
              </span>
            )}
            {modulesCount !== undefined && (
              <span className="text-xs font-bold text-slate-400">
                {modulesCount} ሞጁሎች
              </span>
            )}
            {badge && (
              <Badge variant="neutral" size="sm">
                {badge}
              </Badge>
            )}
          </div>

          <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#1657b8] dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>

          {theme && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              ✝️ ጭብጥ: {theme}
            </p>
          )}

          {children}
        </div>

        <div className="space-y-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>የትምህርት ሂደት</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-[#1657b8] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPct, 4)}%` }}
              />
            </div>
          </div>

          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#1657b8] dark:hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </Card>
    );
  }
);
CourseCard.displayName = 'CourseCard';

export default Card;
