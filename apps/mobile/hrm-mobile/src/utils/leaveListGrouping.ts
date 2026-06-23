import { formatHrmDate } from './formatHrm';

export type LeaveSubmissionRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  employee_name: string | null;
  requested_at?: string | null;
  created_at?: string | null;
};

export function resolveLeaveSubmissionDateKey(row: LeaveSubmissionRow): string {
  const raw = row.requested_at?.trim() || row.created_at?.trim() || '';
  if (!raw) return 'unknown';
  return raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10);
}

export function formatLeaveSubmissionSectionTitle(dateKey: string): string {
  if (dateKey === 'unknown') return 'Không rõ ngày gửi';
  return formatHrmDate(dateKey);
}

export type LeaveSubmissionSection<T extends LeaveSubmissionRow> = {
  key: string;
  title: string;
  data: T[];
};

/** Group leave rows by submission date (newest first). */
export function groupLeaveRowsBySubmissionDate<T extends LeaveSubmissionRow>(rows: T[]): LeaveSubmissionSection<T>[] {
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    const key = resolveLeaveSubmissionDateKey(row);
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return b.localeCompare(a);
  });
  return keys.map((key) => ({
    key,
    title: formatLeaveSubmissionSectionTitle(key),
    data: buckets.get(key)!,
  }));
}
