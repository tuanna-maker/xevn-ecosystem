/** User-facing Vietnamese scope/session errors — no wire UUID/slug jargon (MOB-UX-15b). */

export type ScopeErrorKind =
  | 'company'
  | 'employee'
  | 'companyAndEmployee'
  | 'payrollCompany'
  | 'leaveId'
  | 'inboxEmployee'
  | 'inboxCompanySkip';

export function userFacingScopeError(kind: ScopeErrorKind): string {
  switch (kind) {
    case 'company':
      return 'Thiếu phạm vi công ty. Vui lòng đăng nhập lại hoặc chọn công ty trong Cài đặt.';
    case 'employee':
      return 'Thiếu mã nhân viên trong phiên.';
    case 'companyAndEmployee':
      return 'Thiếu phạm vi công ty hoặc mã nhân viên. Vui lòng đăng nhập lại.';
    case 'payrollCompany':
      return 'Cần phạm vi công ty để xem kỳ lương.';
    case 'leaveId':
      return 'Thiếu mã đơn nghỉ.';
    case 'inboxEmployee':
      return 'Hộp thư: cần mã nhân viên trong phiên để lọc tin.';
    case 'inboxCompanySkip':
      return 'Thiếu phạm vi công ty — bỏ qua đếm đơn, lương và dịch vụ.';
    default:
      return 'Thiếu thông tin phiên đăng nhập.';
  }
}

/** Offline check-in queued — no internal work-item codes in alerts. */
export const OFFLINE_CHECKIN_QUEUED_MESSAGE =
  'Chấm công sẽ được gửi tự động khi có kết nối mạng.';

/** Employee profile meta missing on submit forms. */
export const MISSING_EMPLOYEE_META_MESSAGE =
  'Thiếu mã hoặc tên nhân viên. Vui lòng đăng nhập lại hoặc liên hệ quản trị.';
