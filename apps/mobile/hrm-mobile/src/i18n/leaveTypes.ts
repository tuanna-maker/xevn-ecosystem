/**
 * @CODE-MEMORY
 * Screen:     Leave list / create / manager — leave_type chip
 * UC:         UC-HRM-MOB leave · AC-U72-MOB-GLOBAL · M-F-04
 * BR:         BR-CO-LABEL-01 · U72
 * SRS:        docs/hrm/SRS_FIELD_DISPLAY.md · d-mob-u72-label-scan-01 §3 M-F-04
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Map leave_type code (annual / LVT_*) → nhãn VI; unknown → «—» (cấm ?? key).
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    Leave list/detail · CreateLeave · ManagerApprovals
 * Callees:    theme/tokens colors
 * must_keep:  annual/sick/LVT_01..04 known maps; DNA badge colors
 * LastVerified: i18n/__tests__/leaveTypes.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: resolveLeaveTypeLabel unknown → «—» (was raw CUSTOM_X)
 * Why: U72 M-F-04
 * must_keep: known leaveTypeLabels annual/LVT_*; U65 no seed · HOLD_DEPLOY
 */

/**
 * Leave type labels + colors — parity with apps/web/hrm LeaveTab.tsx leaveTypeLabels / leaveTypeColors.
 * Also maps synced catalog codes LVT_01..LVT_04 (AC-FID-16 lineage).
 * DNA status hex via tokens (XEVN-THM-MOB-W2) — unpaid/default = textMuted, not pale body copy.
 */

import { colors } from '../theme/tokens';

const EM_DASH = '—';

export const leaveTypeLabels: Record<string, string> = {
  annual: 'Nghỉ phép năm',
  sick: 'Nghỉ ốm',
  unpaid: 'Nghỉ không lương',
  maternity: 'Nghỉ thai sản',
  paternity: 'Nghỉ cha',
  marriage: 'Nghỉ cưới',
  bereavement: 'Nghỉ tang',
  other: 'Khác',
  personal: 'Nghỉ cá nhân',
  LVT_01: 'Nghỉ phép năm',
  LVT_02: 'Nghỉ ốm',
  LVT_03: 'Nghỉ cá nhân',
  LVT_04: 'Nghỉ không lương',
};

/** Hex equivalents of LeaveTab tailwind badge colors — token-backed neutrals. */
export const leaveTypeColors: Record<string, string> = {
  annual: colors.info,
  sick: colors.danger,
  unpaid: colors.textMuted,
  maternity: '#EC4899',
  paternity: '#6366F1',
  marriage: '#A855F7',
  bereavement: '#475569',
  other: '#14B8A6',
  personal: '#14B8A6',
  LVT_01: colors.info,
  LVT_02: colors.danger,
  LVT_03: '#14B8A6',
  LVT_04: colors.textMuted,
};

export function resolveLeaveTypeLabel(code: string | null | undefined): string {
  if (!code?.trim()) return EM_DASH;
  const key = code.trim();
  return leaveTypeLabels[key] ?? leaveTypeLabels[key.toLowerCase()] ?? EM_DASH;
}

export function resolveLeaveTypeColor(code: string | null | undefined): string {
  if (!code?.trim()) return colors.textMuted;
  const key = code.trim();
  return leaveTypeColors[key] ?? leaveTypeColors[key.toLowerCase()] ?? colors.textMuted;
}
