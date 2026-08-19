/**
 * @CODE-MEMORY
 * Screen:     HRM — EmptyState SoT (Wave B)
 * UC:         UX-10 · UX-04/05 empty/error pattern
 * BR:         Mỗi vùng nội dung: EmptyState có CTA — cấm vùng trắng / bland text
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §3 Loading/Empty/Error · § Wave B EmptyState
 * TechSpec:   docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md Wave B ACTIVE
 * Purpose:    SoT empty UI với 3 mood none/error/permission + CTA tiếng Việt.
 * WorkItem:   D-UX-EMPTY-STATE-FE-01
 * Coded:      2026-07-28
 * Callers:    pages/Dashboard.tsx · pages/Contracts.tsx
 * Callees:    emptyStateSot · lucide · Button · react-router Link
 * must_keep:  data-testid hrm-empty-state; mood attribute; VI default copy từ SoT
 * LastVerified: docs/qa/evidence/d-ux-empty-state-fe-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore EmptyState (+ emptyStateSot) từ stash 43c479a — Vite miss chặn Contracts.tsx
 * Why: QA W5 — /hr/contracts whitescreen · Failed to resolve @/components/hrm/EmptyState
 * must_keep: Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 · HP-05 emp deep-link soft-link
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md
 */
import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  EMPTY_STATE_VI,
  type EmptyStateMood,
} from '@/components/hrm/emptyStateSot';

export type { EmptyStateMood };
export type EmptyStateProps = {
  mood?: EmptyStateMood;
  title?: string;
  description?: string;
  /** CTA label (VI). Omit to hide action when no onAction/actionHref/actionTo. */
  actionLabel?: string;
  onAction?: () => void;
  /** External / mailto href */
  actionHref?: string;
  /** In-app react-router path */
  actionTo?: string;
  icon?: ReactNode;
  className?: string;
  compact?: boolean;
  'data-testid'?: string;
};

const MOOD_ICONS: Record<EmptyStateMood, ReactNode> = {
  none: <Inbox className="h-6 w-6" aria-hidden />,
  error: <AlertTriangle className="h-6 w-6" aria-hidden />,
  permission: <ShieldAlert className="h-6 w-6" aria-hidden />,
};

const MOOD_ICON_WRAP: Record<EmptyStateMood, string> = {
  none: 'bg-primary/10 text-primary',
  error: 'bg-destructive/10 text-destructive',
  permission: 'bg-amber-500/10 text-amber-700',
};

export function EmptyState({
  mood = 'none',
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionTo,
  icon,
  className,
  compact = false,
  'data-testid': testId = 'hrm-empty-state',
}: EmptyStateProps) {
  const defaults = EMPTY_STATE_VI[mood];
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedActionLabel = actionLabel ?? defaults.actionLabel;
  const showAction = Boolean(onAction || actionHref || actionTo);

  return (
    <div
      data-testid={testId}
      data-mood={mood}
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          compact ? 'h-10 w-10' : 'h-12 w-12',
          MOOD_ICON_WRAP[mood],
        )}
      >
        {icon ?? MOOD_ICONS[mood]}
      </div>
      <div className={cn('space-y-1', compact ? 'max-w-xs' : 'max-w-md')}>
        <p className="text-sm font-semibold text-foreground">{resolvedTitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{resolvedDescription}</p>
      </div>
      {showAction ? (
        actionTo ? (
          <Button variant={mood === 'error' ? 'outline' : 'default'} size="sm" asChild>
            <Link to={actionTo} data-testid={`${testId}-cta`}>
              {resolvedActionLabel}
            </Link>
          </Button>
        ) : actionHref ? (
          <Button variant={mood === 'error' ? 'outline' : 'default'} size="sm" asChild>
            <a href={actionHref} data-testid={`${testId}-cta`}>
              {resolvedActionLabel}
            </a>
          </Button>
        ) : (
          <Button
            type="button"
            variant={mood === 'error' ? 'outline' : 'default'}
            size="sm"
            data-testid={`${testId}-cta`}
            onClick={onAction}
          >
            {resolvedActionLabel}
          </Button>
        )
      ) : null}
    </div>
  );
}
