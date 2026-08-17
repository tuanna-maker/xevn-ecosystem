/**
 * @CODE-MEMORY
 * Screen: Shared status chip (employees, leave, payroll payslips)
 * UC: HRM-PR payslip list status · employee directory status
 * BR: Payslip status IN (draft|processed|paid); period may use locked|closed
 * SRS: docs/hrm/SRS.md § Payroll / payslip list
 * TechSpec: docs/hrm/TECHSPEC.md · payroll payslip status enum
 * Purpose: Render status chip with color + localized label. Payroll codes
 *   resolve via common.status.* i18n leaves; employee active/inactive keep
 *   hardcoded VN so company "Đang hiệu lực" leaf is not reused.
 * WorkItem: D-P1-HRM-PAY-STATUS-BADGE-01
 * Coded: 2026-07-17
 * Callers: PayrollPayslipsApiTab, Employees, LeaveTab, Payroll.tsx
 * Callees: react-i18next t('common.status.*')
 * FEActions: display-only
 * Impact: Unknown status falls back to raw code (muted chip)
 * must_keep: common.status.processed → «Đã xử lý»; no raw English for known payroll codes
 * SOLID: SRP — presentation only; no status mutation
 * LastVerified: status-badge.test.ts
 */
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type StatusType =
  | 'active'
  | 'inactive'
  | 'probation'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'draft'
  | 'processed'
  | 'locked'
  | 'present'
  | 'late'
  | 'early'
  | 'absent'
  | 'leave'
  | 'open'
  | 'closed'
  | 'completed'
  | 'cancelled';

interface StatusBadgeProps {
  /** API / domain status code; unknown codes render muted + raw text. */
  status: StatusType | string;
  /** Optional display-ready label (prefer BE status_label / Nest catalog nameVi). */
  label?: string | null;
  className?: string;
}

/** Statuses that use string leaves under `common.status.*`. */
const I18N_STATUS_CODES = new Set<string>([
  'pending',
  'approved',
  'rejected',
  'completed',
  'draft',
  'processed',
  'paid',
  'locked',
  'closed',
  'cancelled',
]);

const statusClassName: Record<string, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  probation: 'bg-warning/10 text-warning',
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  paid: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
  processed: 'bg-primary/10 text-primary',
  locked: 'bg-muted text-muted-foreground',
  present: 'bg-success/10 text-success',
  late: 'bg-warning/10 text-warning',
  early: 'bg-warning/10 text-warning',
  absent: 'bg-destructive/10 text-destructive',
  leave: 'bg-primary/10 text-primary',
  open: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
  completed: 'bg-success/10 text-success',
};

/** Fallback when i18n leaf missing (employee employment status stays VN here). */
const statusFallbackLabel: Record<string, string> = {
  active: 'Đang làm việc',
  inactive: 'Đã nghỉ việc',
  probation: 'Thử việc',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
  paid: 'Đã thanh toán',
  draft: 'Nháp',
  processed: 'Đã xử lý',
  locked: 'Đã khóa',
  present: 'Có mặt',
  late: 'Đi muộn',
  early: 'Về sớm',
  absent: 'Vắng mặt',
  leave: 'Nghỉ phép',
  open: 'Đang tuyển',
  closed: 'Đã đóng',
  completed: 'Hoàn thành',
};

/**
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * change_mode: ADD
 * What: Optional `label` prop — prefer BE status_label / Nest catalog nameVi when caller supplies
 * Why: SA Option A · OS 28 display-ready · cấm invent join Settings when EFF>0
 * must_keep: payroll i18n leaves; unknown → raw code; no mutation
 */
export function StatusBadge({ status, label: labelProp, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  const style = statusClassName[normalized] ?? 'bg-muted text-muted-foreground';
  const fallback = statusFallbackLabel[normalized] ?? String(status ?? '');
  const i18nLabel = I18N_STATUS_CODES.has(normalized)
    ? t(`common.status.${normalized}`, { defaultValue: fallback })
    : fallback;
  const label = (labelProp ?? '').trim() || i18nLabel;

  return (
    <span className={cn('status-badge', style, className)}>
      {label}
    </span>
  );
}
