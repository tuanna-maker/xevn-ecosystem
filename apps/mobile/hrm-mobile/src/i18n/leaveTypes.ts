/**
 * Leave type labels + colors — parity with apps/web/hrm LeaveTab.tsx leaveTypeLabels / leaveTypeColors.
 * Also maps synced catalog codes LVT_01..LVT_04 (AC-FID-16 lineage).
 */

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

/** Hex equivalents of LeaveTab tailwind badge colors. */
export const leaveTypeColors: Record<string, string> = {
  annual: '#3B82F6',
  sick: '#EF4444',
  unpaid: '#6B7280',
  maternity: '#EC4899',
  paternity: '#6366F1',
  marriage: '#A855F7',
  bereavement: '#475569',
  other: '#14B8A6',
  personal: '#14B8A6',
  LVT_01: '#3B82F6',
  LVT_02: '#EF4444',
  LVT_03: '#14B8A6',
  LVT_04: '#6B7280',
};

export function resolveLeaveTypeLabel(code: string | null | undefined): string {
  if (!code?.trim()) return '—';
  const key = code.trim();
  return leaveTypeLabels[key] ?? leaveTypeLabels[key.toLowerCase()] ?? key;
}

export function resolveLeaveTypeColor(code: string | null | undefined): string {
  if (!code?.trim()) return '#6B7280';
  const key = code.trim();
  return leaveTypeColors[key] ?? leaveTypeColors[key.toLowerCase()] ?? '#6B7280';
}
