import React from 'react';
import { cn } from '../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
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
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-xevn-surface rounded-xl shadow-lg p-6 border border-xevn-border hover:-translate-y-1 hover:shadow-xl transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-xevn-primary/10 rounded-lg">{icon}</div>
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
      </div>
    </div>
  );
};
