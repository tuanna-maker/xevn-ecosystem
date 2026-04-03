import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
}) => {
  return (
    <div
      className={cn(
        'bg-xevn-surface rounded-xl shadow-lg p-6 border border-xevn-border transition-all duration-200',
        hoverable && 'hover:-translate-y-1 hover:shadow-xl cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
