'use client';

import React from 'react';
import { StaggerContainer, StaggerItem, MotionCard } from '../motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../ui/utils';

const renderCardIcon = (icon, className = 'w-5 h-5') => {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    const IconComponent = icon;
    return <IconComponent className={className} />;
  }
  return <span className="text-lg">{icon}</span>;
};

export const SingleStatCard = ({
  icon: Icon,
  label,
  value,
  badge,
  variant = 'default',
  cssClass = '',
  className = '',
  onClick,
}) => {
  return (
    <MotionCard hoverY={-4} className={cn('h-full', className)}>
      <Card
        variant={variant === 'gold' ? 'gold' : 'elevated'}
        padding="sm"
        onClick={onClick}
        className={cn(
          'relative group transition-all duration-200 h-full',
          onClick && 'cursor-pointer hover:border-[var(--brand-primary)]/50',
          cssClass
        )}
      >
        <div className="flex items-center justify-between mb-2">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 dark:bg-blue-500/20 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
              {renderCardIcon(Icon, 'w-5 h-5')}
            </div>
          )}
          {badge && (
            <Badge variant={variant === 'gold' ? 'pending' : 'neutral'} size="sm">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value ?? 0}
        </p>
        {label && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider truncate">
            {label}
          </p>
        )}
      </Card>
    </MotionCard>
  );
};

export const StatCard = ({
  statCards,
  label,
  value,
  icon,
  badge,
  variant,
  className,
  gridClassName,
  ...props
}) => {
  // If passed single stat props
  if (!statCards && (label || value !== undefined)) {
    return (
      <SingleStatCard
        label={label}
        value={value}
        icon={icon}
        badge={badge}
        variant={variant}
        className={className}
        {...props}
      />
    );
  }

  if (!Array.isArray(statCards) || statCards.length === 0) {
    return null;
  }

  return (
    <StaggerContainer
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4',
        gridClassName || className
      )}
    >
      {statCards.map((stat, idx) => (
        <StaggerItem key={stat.label || idx}>
          <SingleStatCard
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            badge={stat.badge}
            variant={stat.variant}
            cssClass={stat.cssClass}
            onClick={stat.onClick}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
};

export default StatCard;
