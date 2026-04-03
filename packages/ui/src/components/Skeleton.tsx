import React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
}) => {
  const baseStyles = 'animate-pulse bg-xevn-neutral/20 rounded';

  const variantStyles = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded',
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
    />
  );
};
