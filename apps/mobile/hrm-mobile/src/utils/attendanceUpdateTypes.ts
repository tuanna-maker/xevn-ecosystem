/** Vietnamese labels for attendance update / change types — MOB-UX-15d. */
const ATTENDANCE_CHANGE_TYPE_VI: Record<string, string> = {
  check_in: 'Giờ vào',
  check_out: 'Giờ ra',
  check_in_out: 'Giờ vào và ra',
  both: 'Giờ vào và ra',
  break: 'Nghỉ giữa ca',
  forgot_check: 'Quên chấm công',
  forgot_check_in: 'Quên giờ vào',
  forgot_check_out: 'Quên giờ ra',
  in: 'Giờ vào',
  out: 'Giờ ra',
};

function looksLikeWireToken(raw: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(raw) && raw.includes('_');
}

/** Map API `update_type` / seed tokens to user-facing Vietnamese. */
export function resolveAttendanceChangeTypeVi(updateType: string | null | undefined): string {
  const raw = updateType?.trim() ?? '';
  if (!raw) return 'Chỉnh sửa chấm công';

  const key = raw.toLowerCase();
  const mapped = ATTENDANCE_CHANGE_TYPE_VI[key];
  if (mapped) return mapped;

  if (key.includes('seed:') || key.startsWith('hrm-')) return 'Chỉnh sửa chấm công';

  if (!looksLikeWireToken(raw)) return raw;

  return raw.replace(/_/g, ' ');
}

/** Alias used by profile task card and manager attendance cards. */
export function resolveUpdateTypeLabel(updateType: string | null | undefined): string {
  return resolveAttendanceChangeTypeVi(updateType);
}
