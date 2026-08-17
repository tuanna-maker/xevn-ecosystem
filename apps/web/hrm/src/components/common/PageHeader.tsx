/**
 * @CODE-MEMORY
 * Screen:     Shared page title + subtitle axis (HRM ops pages)
 * UC:         Layout Header Axis · E01 Employees list chrome
 * Purpose:    Symmetric title/actions row; subtitle secondary floor (not pale body).
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-A
 * Coded:      2026-08-05
 * must_keep:  flex items-center header axis; no stats strip invent
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: title → text-xevn-text; subtitle → text-xevn-textSecondary (ban muted-as-body)
 * Why: ADR §8 pale ban on E01 list shell and shared consumers
 */
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Dùng trên Cài đặt — giảm margin/padding tiêu đề trang */
  density?: 'default' | 'compact';
}

export function PageHeader({ title, subtitle, actions, density = 'default' }: PageHeaderProps) {
  const compact = density === 'compact';

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between',
        compact ? 'mb-2 gap-1.5 sm:mb-2 sm:gap-2' : 'mb-4 gap-3 sm:mb-6 sm:gap-4',
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            'truncate font-bold text-xevn-text',
            compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'truncate text-xevn-textSecondary',
              compact ? 'text-xs md:text-sm' : 'mt-0.5 text-sm md:mt-1',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
