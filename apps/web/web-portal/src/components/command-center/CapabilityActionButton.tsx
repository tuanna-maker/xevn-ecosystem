/**
 * @CODE-MEMORY-CHANGE
 * WorkItem: R-SPINE-WEB-APPROVE-UX-01 · 2026-08-03
 * change_mode: ADD
 * What: accessibleName + data-testid props — leave Duyệt overrides registry aria «Xử lý nhanh»
 * Why: getByRole/HDSD harness missed Duyệt when aria-label locked to capability labelVi
 * must_keep: resolveCapabilityActionState enable/block; wireMode api
 */
import React from 'react';
import {
  resolveCapabilityActionState,
  type CapabilityRuntimeContext,
} from '../../integrations/capabilityActionRegistry';

export type CapabilityActionButtonProps = {
  capabilityCode: string;
  runtime?: CapabilityRuntimeContext;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  /**
   * Overrides registry `labelVi` for accessible name (getByRole / HDSD «Duyệt»).
   * Visible children stay authoritative for what the user sees.
   */
  accessibleName?: string;
  /** Optional stable harness hook (leave Duyệt · R-SPINE-WEB-APPROVE-UX-01). */
  'data-testid'?: string;
};

const VARIANT_CLASS: Record<NonNullable<CapabilityActionButtonProps['variant']>, string> = {
  primary:
    'inline-flex items-center justify-center gap-1 rounded-lg bg-xevn-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-1 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-medium text-xevn-text transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50',
};

export function CapabilityActionButton({
  capabilityCode,
  runtime,
  children,
  onClick,
  className,
  type = 'button',
  variant = 'primary',
  accessibleName,
  'data-testid': dataTestId,
}: CapabilityActionButtonProps) {
  const state = resolveCapabilityActionState(capabilityCode, runtime);
  const enabled = state?.enabled ?? false;
  const title = state?.titleAttr ?? capabilityCode;
  const mergedClass = className ?? VARIANT_CLASS[variant];
  const ariaLabel =
    accessibleName?.trim() || state?.definition.labelVi || capabilityCode;

  return (
    <button
      type={type}
      disabled={!enabled}
      title={accessibleName?.trim() ? accessibleName : title}
      aria-label={ariaLabel}
      aria-disabled={!enabled}
      data-testid={dataTestId}
      onClick={enabled ? onClick : undefined}
      className={mergedClass}
    >
      {children}
    </button>
  );
}
