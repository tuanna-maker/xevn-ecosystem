import React from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('text-center py-12 bg-xevn-surface rounded-xl border border-xevn-border', className)}>
      <div className="mx-auto w-16 h-16 bg-xevn-neutral/10 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-xevn-text mb-1">{title}</h3>
      {description && <p className="text-sm text-xevn-textSecondary mb-4">{description}</p>}
      {action}
    </div>
  );
};
