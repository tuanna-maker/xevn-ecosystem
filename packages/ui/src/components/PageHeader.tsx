import React from 'react';
import { cn } from '../lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  showCompanyFilter?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  showCompanyFilter,
  className,
}) => {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-xevn-primary/10 rounded-lg">{icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-xevn-text">{title}</h1>
            {subtitle && <p className="text-xevn-textSecondary mt-1">{subtitle}</p>}
          </div>
        </div>
        {(showCompanyFilter || actions) && (
          <div className="flex items-center gap-3">
            {showCompanyFilter && (
              <div className="h-10 rounded-lg border border-xevn-border bg-xevn-surface px-3 text-sm text-xevn-textSecondary inline-flex items-center">
                Toàn Tập đoàn
              </div>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
