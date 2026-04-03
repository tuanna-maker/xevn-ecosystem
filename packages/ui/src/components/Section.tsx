import React from 'react';
import { cn } from '../lib/utils';

export interface SectionProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  gap = 'md',
  className,
}) => {
  const gapClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return <div className={cn(gapClasses[gap], className)}>{children}</div>;
};
