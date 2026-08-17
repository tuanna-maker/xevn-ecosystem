/**
 * @CODE-MEMORY
 * Screen:     /attendance — Clock-In wizard (IA slice)
 * UC:         UC-HRM-23 · UX-01 / P0-a
 * BR:         BR-UX-IA-01 (task-based clock-in ≤2 clicks)
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §P0-a · screen-matrix UX-01
 * TechSpec:   IA-only — giữ nguyên widget/API CheckInOut/QR/Face/GPS
 * Purpose:    Chuẩn hóa id phương thức chấm công; gộp legacy submenu
 *             checkinout/qrcode/faceid/gps → một task «clock-in».
 * WorkItem:   D-UX-C1-ATTENDANCE-FE-01
 * Coded:      2026-07-28
 * must_keep:  Không đổi contract API; chỉ map IA/navigation
 * SOLID:      Pure helper tách khỏi Attendance god-file để test được
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * change_mode: FIX
 * What: Restore from git 43c479a with ClockInMethodSelector (Attendance mount chain)
 * Why: Vite resolve chain after LeaveOverviewRecentPanel restore
 * must_keep: Pure helpers; LeaveTab path untouched; U65 no seed
 */

export type ClockInMethod = 'manual' | 'qrcode' | 'faceid' | 'gps';

export const CLOCK_IN_ATTENDANCE_TYPE = 'clock-in' as const;

/** Legacy submenu ids collapsed into Clock-In wizard. */
export const LEGACY_CLOCK_IN_TYPES = ['checkinout', 'qrcode', 'faceid', 'gps'] as const;

export type LegacyClockInType = (typeof LEGACY_CLOCK_IN_TYPES)[number];

const LEGACY_TO_METHOD: Record<LegacyClockInType, ClockInMethod> = {
  checkinout: 'manual',
  qrcode: 'qrcode',
  faceid: 'faceid',
  gps: 'gps',
};

export function isLegacyClockInType(type: string): type is LegacyClockInType {
  return (LEGACY_CLOCK_IN_TYPES as readonly string[]).includes(type);
}

export function isClockInAttendanceType(type: string): boolean {
  return type === CLOCK_IN_ATTENDANCE_TYPE || isLegacyClockInType(type);
}

/** Resolve method for wizard; defaults to manual for clock-in hub. */
export function resolveClockInMethod(
  attendanceType: string,
  selectedMethod: ClockInMethod,
): ClockInMethod {
  if (isLegacyClockInType(attendanceType)) {
    return LEGACY_TO_METHOD[attendanceType];
  }
  return selectedMethod;
}

export const CLOCK_IN_METHOD_OPTIONS: ReadonlyArray<{
  id: ClockInMethod;
  icon: 'Clock' | 'QrCode' | 'UserCheck' | 'MapPin';
  labelKey: string;
  labelFallback: string;
}> = [
  {
    id: 'manual',
    icon: 'Clock',
    labelKey: 'attPage.clockInMethodManual',
    labelFallback: 'Thủ công',
  },
  {
    id: 'qrcode',
    icon: 'QrCode',
    labelKey: 'attPage.clockInMethodQr',
    labelFallback: 'Mã QR',
  },
  {
    id: 'faceid',
    icon: 'UserCheck',
    labelKey: 'attPage.clockInMethodFace',
    labelFallback: 'Face ID',
  },
  {
    id: 'gps',
    icon: 'MapPin',
    labelKey: 'attPage.clockInMethodGps',
    labelFallback: 'GPS',
  },
];
