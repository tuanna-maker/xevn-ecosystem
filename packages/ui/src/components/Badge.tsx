import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variantClasses = {
    default: 'bg-xevn-neutral text-xevn-surface',
    success: `bg-xevn-success text-xevn-surface`,
    warning: `bg-xevn-warning text-xevn-surface`,
    danger: `bg-xevn-danger text-xevn-surface`,
    info: `bg-xevn-info text-xevn-surface`,
    neutral: `bg-xevn-surface text-xevn-neutral border border-xevn-border`,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
