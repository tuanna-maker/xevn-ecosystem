/**
 * @CODE-MEMORY
 * Screen:     HRM — PermissionFallback (UX-07)
 * UC:         UX-07 · P2-b screen matrix · Wave B Lane B
 * BR:         Không ẩn nội dung lương bằng null im lặng
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §9 PermissionFallback · UX-UI-ERP-ANALYSIS P0-3
 * Purpose:    Hiển thị thông báo VI + CTA Liên hệ HR khi thiếu quyền (salary / PII).
 * WorkItem:   D-UX-PROFILE-TABS-01
 * Coded:      2026-07-28
 * Callers:    pages/EmployeeProfile.tsx (salary / insurance / general PII)
 * must_keep:  data-testid permission-fallback; message VI mặc định; portal bypass ở PermissionGate
 * LastVerified: docs/qa/evidence/d-ux-profile-tabs-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-PERMISSION-FALLBACK-FE-01
 * change_mode: UPGRADE
 * What: SoT VI/EN + default mailto CTA luôn có testid; variant compact cho card PII; đóng silent-null CMND
 * Why: Wave B PermissionFallback · residual R-C2-01 UX-07 consistency
 * SRS/BR: UX-UI-ERP-ANALYSIS.md §9 · UX-07 · must_keep portal bypass PermissionGate
 * must_keep: PermissionGate shouldBypassHrmPermissionGate; Profile C2 groups; Payroll D5/P0-c; Clock-In
 * LastVerified: docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
 */
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF,
  PERMISSION_FALLBACK_I18N,
  PERMISSION_FALLBACK_TEST_IDS,
  PERMISSION_FALLBACK_VI,
  type PermissionFallbackVariant,
} from './permissionFallbackSot';

type PermissionFallbackProps = {
  className?: string;
  title?: string;
  message?: string;
  /** Optional mailto / help link for CTA — defaults to SoT mailto */
  contactHref?: string;
  /** compact = smaller padding for inline card slots (e.g. CMND fields) */
  variant?: PermissionFallbackVariant;
};

export function PermissionFallback({
  className,
  title,
  message,
  contactHref = PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF,
  variant = 'default',
}: PermissionFallbackProps) {
  const { t } = useTranslation();
  const resolvedTitle =
    title ??
    t(PERMISSION_FALLBACK_I18N.title, {
      defaultValue: PERMISSION_FALLBACK_VI.title,
    });
  const resolvedMessage =
    message ??
    t(PERMISSION_FALLBACK_I18N.message, {
      defaultValue: PERMISSION_FALLBACK_VI.message,
    });
  const ctaLabel = t(PERMISSION_FALLBACK_I18N.contactHr, {
    defaultValue: PERMISSION_FALLBACK_VI.contactHr,
  });
  const isCompact = variant === 'compact';

  return (
    <div
      data-testid={PERMISSION_FALLBACK_TEST_IDS.root}
      data-variant={variant}
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 text-center',
        isCompact ? 'px-4 py-6 gap-2' : 'px-6 py-12',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-amber-500/10 text-amber-700',
          isCompact ? 'h-9 w-9' : 'h-12 w-12',
        )}
      >
        <ShieldAlert className={cn(isCompact ? 'h-4 w-4' : 'h-6 w-6')} aria-hidden />
      </div>
      <div className="space-y-1 max-w-md">
        <p className={cn('font-semibold text-foreground', isCompact ? 'text-xs' : 'text-sm')}>
          {resolvedTitle}
        </p>
        <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-sm')}>
          {resolvedMessage}
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <a
          href={contactHref}
          data-testid={PERMISSION_FALLBACK_TEST_IDS.contactHr}
          title={resolvedMessage}
        >
          {ctaLabel}
        </a>
      </Button>
    </div>
  );
}
