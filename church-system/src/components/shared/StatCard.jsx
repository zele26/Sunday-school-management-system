import React from 'react';
import { StaggerContainer, StaggerItem, MotionCard } from '../motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const StatCard = ({ statCards }) => {
    return (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <StaggerItem key={idx}>
                        <MotionCard
                            hoverY={-5}
                            className="h-full"
                        >
                            <Card
                                variant={stat.variant === 'gold' ? 'gold' : 'elevated'}
                                padding="sm"
                                className={`relative group transition-all duration-200 h-full ${stat.cssClass ? stat.cssClass : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 dark:bg-blue-500/20 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <Badge variant={stat.variant === 'gold' ? 'pending' : 'neutral'} size="sm">
                                        {stat.badge}
                                    </Badge>
                                </div>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider truncate">
                                    {stat.label}
                                </p>
                            </Card>
                        </MotionCard>
                    </StaggerItem>
                );
            })}
        </StaggerContainer>
    );
}

export default StatCard;
