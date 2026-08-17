/**
 * @CODE-MEMORY
 * Screen:     /attendance — chọn phương thức Clock-In
 * UC:         UC-HRM-23 · UX-01 / P0-a
 * BR:         BR-UX-IA-01
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md P0-a
 * TechSpec:   IA-only selector; không gọi API
 * Purpose:    Hàng nút chọn phương thức (Thủ công / QR / Face / GPS)
 *             trong wizard Chấm công — proxy click depth ≤2.
 * WorkItem:   D-UX-C1-ATTENDANCE-FE-01
 * Coded:      2026-07-28
 * must_keep:  data-testid clock-in-method-* cho QA proxy; không đổi API
 * SOLID:      UI selector tách khỏi nội dung widget từng method
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-C1-ATTENDANCE-FE-01
 * change_mode: UPGRADE
 * What: ADD selector task-based thay 4 submenu kỹ thuật
 * Why: Sponsor C1 — collapse checkinout/qr/face/gps
 * must_keep: Giữ 4 method id khớp widget hiện có
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * change_mode: FIX
 * What: Restore from git 43c479a — transitive eager import of Attendance.tsx
 * Why: After LeaveOverviewRecentPanel, Vite next Failed to resolve ClockInMethodSelector
 * must_keep: LeaveTab create/list; IA method ids; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-A
 * change_mode: UPGRADE
 * What: Selector chrome → Precision Motion primary (replace orange accent)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory S10
 * must_keep: method ids + testids; Face/QR honesty elsewhere; no API
 */
import { Clock, MapPin, QrCode, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  CLOCK_IN_METHOD_OPTIONS,
  type ClockInMethod,
} from '@/lib/clockInMethods';

const ICONS = {
  Clock,
  QrCode,
  UserCheck,
  MapPin,
} as const;

type Props = {
  value: ClockInMethod;
  onChange: (method: ClockInMethod) => void;
};

export function ClockInMethodSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
      role="tablist"
      aria-label={t('attPage.clockInMethodList', 'Phương thức chấm công')}
      data-testid="clock-in-method-selector"
    >
      {CLOCK_IN_METHOD_OPTIONS.map((option) => {
        const Icon = ICONS[option.icon];
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            data-testid={`clock-in-method-${option.id}`}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-card border p-4 text-left transition-colors touch-target',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xevn-primary focus-visible:ring-offset-2',
              selected
                ? 'border-xevn-primary bg-xevn-primary/5 text-xevn-text shadow-sm'
                : 'border-xevn-border bg-xevn-surface text-xevn-text hover:border-xevn-primary/40 hover:bg-xevn-background',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                selected ? 'bg-xevn-primary text-white' : 'bg-xevn-background text-xevn-textSecondary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[15px] font-semibold text-xevn-text">
              {t(option.labelKey, option.labelFallback)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
