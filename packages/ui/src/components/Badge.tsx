import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
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

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};
