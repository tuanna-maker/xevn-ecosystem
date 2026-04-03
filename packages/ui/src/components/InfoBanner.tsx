import React from 'react';
import { cn } from '../lib/utils';

export interface InfoBannerProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
  className?: string;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  message,
  icon,
  variant = 'info',
  className,
}) => {
  const variantClasses = {
    info: 'bg-xevn-info/10 border border-xevn-info/20 text-xevn-info',
    warning: 'bg-xevn-warning/10 border border-xevn-warning/20 text-xevn-warning',
    success: 'bg-xevn-success/10 border border-xevn-success/20 text-xevn-success',
  };

  return (
    <div className={cn('rounded-xl border p-4 mb-6', variantClasses[variant], className)}>
      <div className="flex items-start">
        {icon ? (
          <div className="mt-0.5 mr-3">{icon}</div>
        ) : (
          <div className="mt-0.5 mr-3 flex-shrink-0">
            {variant === 'info' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            {variant === 'warning' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            )}
            {variant === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        )}
        <div>
          <h3 className="font-medium text-xevn-text">{title}</h3>
          <p className="mt-1 text-sm text-xevn-textSecondary">{message}</p>
        </div>
      </div>
    </div>
  );
};
