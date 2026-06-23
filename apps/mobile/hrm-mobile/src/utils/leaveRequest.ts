import { parseHrmDateOnly } from './formatHrm';

/** Inclusive calendar-day count between API date-only strings. */
export function computeLeaveTotalDays(startIso: string, endIso: string): number {
  const start = parseHrmDateOnly(startIso);
  const end = parseHrmDateOnly(endIso);
  if (!start || !end || end.getTime() < start.getTime()) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

/** YYYY-MM-DD from local Date (no timezone drift). */
export function toIsoDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type LeaveStatusGroup = 'pending' | 'approved' | 'rejected' | 'other';

export function resolveLeaveStatusGroup(status: string): LeaveStatusGroup {
  const s = status.toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'other';
}

export const leaveStatusSectionTitles: Record<LeaveStatusGroup, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  other: 'Khác',
};

export const leaveStatusSectionOrder: LeaveStatusGroup[] = ['pending', 'approved', 'rejected', 'other'];

/** Canonical create-form leave type keys (web LeaveTab Select). */
export const leaveTypeOptions = [
  'annual',
  'sick',
  'unpaid',
  'maternity',
  'paternity',
  'marriage',
  'bereavement',
  'other',
] as const;

export type LeaveTypeOption = (typeof leaveTypeOptions)[number];
