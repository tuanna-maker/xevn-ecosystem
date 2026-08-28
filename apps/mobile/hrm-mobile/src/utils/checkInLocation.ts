/** Vietnamese copy for device location on check-in — MOB-UX-13a / Apple HIG §2. */

export const CHECK_IN_LOCATION_SECTION_TITLE = 'Vị trí thiết bị';

export const CHECK_IN_LOCATION_LOADING = 'Đang lấy vị trí…';

export const CHECK_IN_LOCATION_READY = 'Đã xác định vị trí thiết bị';

export const CHECK_IN_LOCATION_DENIED =
  'Chưa có quyền truy cập vị trí. Bạn vẫn có thể chấm công nhưng không gửi kèm tọa độ.';

export const CHECK_IN_LOCATION_ERROR = 'Không xác định được vị trí thiết bị';

export const CHECK_IN_LOCATION_PERMISSION_RATIONALE =
  'Ứng dụng cần quyền truy cập vị trí để ghi nhận vị trí thiết bị khi chấm công.';

export type DeviceLocationUiState = 'idle' | 'loading' | 'ready' | 'denied' | 'error';

export type DeviceLocationSnapshot = {
  granted: boolean;
  latitude?: number;
  longitude?: number;
};

/** Maps capture state to sponsor-facing label (never «GPS» / «geofence»). */
export function resolveDeviceLocationLabel(state: DeviceLocationUiState): string {
  switch (state) {
    case 'loading':
    case 'idle':
      return CHECK_IN_LOCATION_LOADING;
    case 'ready':
      return CHECK_IN_LOCATION_READY;
    case 'denied':
      return CHECK_IN_LOCATION_DENIED;
    case 'error':
    default:
      return CHECK_IN_LOCATION_ERROR;
  }
}

/** Ensures UI copy bundle excludes forbidden English geofence terms. */
export function assertCheckInLocationCopySafe(copy: string): boolean {
  const lower = copy.toLowerCase();
  return !lower.includes('gps') && !lower.includes('geofence');
}

export type CheckInSubmitInput = {
  companyId: string;
  employeeId: string;
  location: DeviceLocationSnapshot;
  now?: Date;
  note?: string;
};

/** Builds POST /attendance/records body; coords only when permission granted with finite values. */
export function buildCheckInSubmitBody(input: CheckInSubmitInput): Record<string, unknown> {
  const now = input.now ?? new Date();
  const today = now.toISOString().slice(0, 10);
  const body: Record<string, unknown> = {
    company_id: input.companyId.trim(),
    employee_id: input.employeeId.trim(),
    attendance_date: today,
    check_in_at: now.toISOString(),
    status: 'present',
    note: input.note?.trim() || 'XeVN HRM Mobile UC-HRM-MOB-04',
  };

  if (input.location.granted) {
    const lat = input.location.latitude;
    const lng = input.location.longitude;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      body.latitude = lat;
      body.longitude = lng;
      body.check_in_method = 'gps';
    }
  }

  return body;
}
