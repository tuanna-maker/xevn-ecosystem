import React from 'react';
import { cn } from '../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'amber' | 'red' | 'purple' | 'indigo' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color = 'blue',
  trend,
  className,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    gray: 'bg-slate-100 text-slate-700',
  };

  return (
    <div
      className={cn(
        'bg-xevn-surface rounded-xl shadow-lg p-6 border border-xevn-border hover:-translate-y-1 hover:shadow-xl transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        {icon && <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>}
        {trend && (
          <div
            className={cn(
              'flex items-center text-sm font-medium',
              trend.isPositive ? 'text-xevn-success' : 'text-xevn-danger'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-xevn-textSecondary">{title}</p>
        <p className="text-3xl font-bold text-xevn-text">{value}</p>
        {subtitle && <p className="text-xs text-xevn-textSecondary">{subtitle}</p>}
      </div>
    </div>
  );
};
