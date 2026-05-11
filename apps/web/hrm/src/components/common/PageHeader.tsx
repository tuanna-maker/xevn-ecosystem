import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5 md:mt-1 truncate">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
