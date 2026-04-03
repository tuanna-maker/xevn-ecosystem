import React from 'react';
import { cn } from '../lib/utils';

export interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  className,
  footer,
}) => {
  return (
    <div className={cn('bg-xevn-surface rounded-xl shadow-lg border border-xevn-border overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-xevn-border">
        <h3 className="text-lg font-semibold text-xevn-text">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-xevn-background border-t border-xevn-border">
          {footer}
        </div>
      )}
    </div>
  );
};
