import type { HrmRequestResult } from './hrmApiClient';

const SUCCESS_VI: Record<string, string> = {
  'HRM-ATT-REQ-203': 'Đã duyệt đơn chỉnh sửa chấm công',
  'HRM-LEAVE-203': 'Đã duyệt đơn nghỉ phép',
  'HRM-ATT-REQ-204': 'Đã từ chối đơn chỉnh sửa chấm công',
  'HRM-LEAVE-204': 'Đã từ chối đơn nghỉ phép',
};

const CODE_VI: Record<string, string> = {
  all: 'Tất cả',
  'HRM-AUTH-001': 'Không có quyền truy cập',
  'HRM-AUTH-401': 'Email hoặc mật khẩu không đúng',
  'HRM-ATT-GEO-001': 'Chấm công ngoài vùng cho phép',
  'HRM-ATT-VAL-TIME': 'Giờ ra phải sau giờ vào',
  'HRM-LEAVE-VAL-DATES': 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc',
  'HRM-LEAVE-404': 'Đơn nghỉ không tồn tại hoặc đã xử lý',
  'HRM-MOB-ERR-NETWORK': 'Lỗi mạng — kiểm tra kết nối',
  'HRM-MOB-ERR-TIMEOUT': 'Hết thời gian chờ máy chủ',
  'HRM-MOB-ERR-OFFLINE': 'Đang ngoại tuyến',
  SCOPE_TENANT_REQUIRED: 'Thiếu tenantId',
  SCOPE_COMPANY_REQUIRED: 'Thiếu mã công ty',
};

export function formatHrmSuccess(code: string): string {
  return SUCCESS_VI[code] ?? 'Thành công';
}

export function formatHrmError(result: HrmRequestResult<unknown>): string {
  if (result.ok) return '';
  const vi = CODE_VI[result.code];
  return vi ? `${result.code}: ${vi}` : `${result.code}: ${result.message}`;
}

export function isAuthError(result: HrmRequestResult<unknown>): boolean {
  if (result.ok) return false;
  return (
    result.code === 'HRM-AUTH-001' ||
    result.code === 'HRM-AUTH-401' ||
    result.code === 'HRM-ERR-AUTH-INVALID' ||
    result.httpStatus === 401
  );
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    present: 'Có mặt',
    draft: 'Nháp',
  };
  return map[status] ?? status;
}
