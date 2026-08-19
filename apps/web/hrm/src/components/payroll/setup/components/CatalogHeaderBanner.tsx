/**
 * @CODE-MEMORY
 * Component:  CatalogHeaderBanner
 * Purpose:    Open/Closed Principle (O) — Reusable banner component for catalog governance notice
 * WorkItem:   D-PO-HRM-COMP-CATALOG-BANNER-01
 * solid_convention_ack: Presentational component only; accepts message and variant props.
 */
import { Shield, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export interface CatalogHeaderBannerProps {
  message: ReactNode;
  variant?: 'info' | 'warning';
}

export function CatalogHeaderBanner({ message, variant = 'info' }: CatalogHeaderBannerProps) {
  if (variant === 'warning') {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4  hidden  shrink-0" />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-700">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-sky-600 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
