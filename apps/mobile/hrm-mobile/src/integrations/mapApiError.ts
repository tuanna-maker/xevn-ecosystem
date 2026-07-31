/**
 * @CODE-MEMORY
 * Screen:     HRM Mobile — API error + shared status badge labels
 * UC:         UC/FR-HRM-U72-LABEL-01 · AC-U72-MOB-GLOBAL · M-F-01..M-F-03
 * BR:         BR-CO-LABEL-01 · U72 display-label lock
 * SRS:        docs/hrm/SRS_FIELD_DISPLAY.md · docs/qa/evidence/d-mob-u72-label-scan-01-20260727.md §3–§4
 * TechSpec:   .cursor/rules/display-label-no-raw-key.mdc · OS 22-DISPLAY-LABEL-RULE
 * Purpose:    Map HRM API error/success codes và lifecycle status → nhãn VI cho badge/list.
 *             statusLabel: dictionary đầy đủ; unknown/null → «—»; cấm fallback raw English.
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    StatusBadge · ListRow · EssRichListRow · LeaveHero · Payslip · Contracts · Profile docs
 * Callees:    (none)
 * Impact:     Sai map → lộ raw enum trên badge hoặc nhãn VI sai theo ngữ cảnh
 * must_keep:  formatHrmError code prefix; SUCCESS_VI duyệt/từ chối; U65 no seed
 * SOLID:      Pure map — UI chỉ gọi statusLabel, không nhúng dictionary rải rác
 * LastVerified: integrations/__tests__/mapApiError.u72.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Expand statusLabel HRM dictionary; unknown → «—» (never return raw status)
 * Why: U72 M-F-01..M-F-03 contracts/payroll/leave StatusBadge raw English
 * SRS/BR: AC-U72-MOB-GLOBAL · M-F-01..03 · display-label-no-raw-key
 * must_keep: resolveWorkflowStatusVi Home (dashboardEss); U65 no seed · HOLD_DEPLOY
 */

import type { HrmRequestResult } from './hrmApiClient';

const EM_DASH = '—';

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

/** Shared HRM status → VI (contracts, payroll, leave, ops). Unknown → «—». */
const STATUS_LABEL_VI: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
  present: 'Có mặt',
  absent: 'Vắng mặt',
  late: 'Đi muộn',
  leave: 'Nghỉ phép',
  on_leave: 'Đang nghỉ phép',
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  terminated: 'Chấm dứt',
  draft: 'Nháp',
  processed: 'Đã xử lý',
  paid: 'Đã trả',
  closed: 'Đã đóng',
  open: 'Đang mở',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
  inactive: 'Ngưng hoạt động',
  processing: 'Đang xử lý',
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

/** U72: never return raw English status / snake_case to UI. */
export function statusLabel(status: string): string {
  const key = status?.trim().toLowerCase() ?? '';
  if (!key) return EM_DASH;
  return STATUS_LABEL_VI[key] ?? EM_DASH;
}
