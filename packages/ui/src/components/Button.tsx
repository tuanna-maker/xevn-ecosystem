import React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: `bg-xevn-primary text-white hover:bg-xevn-accent hover:-translate-y-0.5 shadow-lg hover:shadow-xl focus:ring-xevn-primary focus:ring-offset-2`,
    outline: `border-2 border-xevn-primary text-xevn-primary hover:bg-xevn-primary/5 focus:ring-xevn-primary focus:ring-offset-2`,
    danger: `bg-xevn-danger text-white hover:bg-xevn-danger/90 shadow-lg hover:shadow-xl focus:ring-xevn-danger focus:ring-offset-2`,
    ghost: `text-xevn-text hover:bg-xevn-surface/50 focus:ring-xevn-text focus:ring-offset-2`,
  };

  const sizeStyles = {
    sm: `px-2 py-1.5 text-sm`,
    md: `px-4 py-2 text-base`,
    lg: `px-6 py-3 text-lg`,
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
        isLoading && 'opacity-70 cursor-not-allowed'
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
