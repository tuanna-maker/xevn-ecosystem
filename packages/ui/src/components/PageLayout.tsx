import React from 'react';
import { cn } from '../lib/utils';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Base page wrapper (required by UI-STYLE-GUIDE).
 * Keeps background + consistent vertical rhythm.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  return <div className={cn('min-h-0 w-full bg-xevn-background', className)}>{children}</div>;
};

