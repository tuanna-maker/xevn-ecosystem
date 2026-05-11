type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
  status?: number;
};

const friendlyByCode: Record<string, string> = {
  "HRM-AUTH-001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  "HRM-AUTH-002": "Bạn không có quyền thực hiện thao tác này.",
  "HRM-VAL-001": "Dữ liệu gửi lên chưa hợp lệ.",
  "HRM-DATA-404": "Không tìm thấy dữ liệu yêu cầu.",
  "HRM-USER-001": "Không thể xử lý tài khoản người dùng.",
  "HRM-ATT-001": "Không thể tạo bản ghi chấm công. Vui lòng kiểm tra dữ liệu đầu vào.",
  "HRM-ATT-404": "Không tìm thấy bản ghi chấm công cần cập nhật.",
  "HRM-PAY-001": "Khoảng ngày kỳ lương chưa hợp lệ (ngày bắt đầu phải <= ngày kết thúc).",
  "HRM-PAY-002": "Kỳ lương bị trùng với kỳ đã tồn tại.",
  "HRM-PAY-404": "Không thể xử lý kỳ lương do trạng thái hiện tại không hợp lệ hoặc không tồn tại.",
  "HRM-PAY-405": "Không thể khóa kỳ lương do chưa ở trạng thái đã xử lý.",
  "SHEET-400": "File import không hợp lệ hoặc thiếu tham số kind.",
  "SHEET-408": "Xử lý file vượt quá thời gian cho phép trên máy chủ.",
  "SHEET-413": "File hoặc dữ liệu vượt quá giới hạn kích thước/số dòng.",
  "SHEET-415": "Định dạng file không được hỗ trợ cho import.",
  "SHEET-422": "Dữ liệu import không thỏa điều kiện nghiệp vụ (xem chi tiết từng dòng).",
  "SCOPE_TENANT_REQUIRED": "Thiếu tenant trong phạm vi yêu cầu (x-tenant-id hoặc JWT).",
  "SCOPE_COMPANY_REQUIRED": "Thiếu công ty trong phạm vi yêu cầu (x-company-id hoặc JWT).",
  "SCOPE_TENANT_INVALID": "Tenant không hợp lệ.",
  "SCOPE_COMPANY_INVALID": "Công ty không hợp lệ.",
  "SCOPE_CONTEXT_MISMATCH": "Phạm vi tenant/công ty không khớp với token.",
};

export class ApiClientError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message || "Có lỗi xảy ra khi gọi API.");
    this.name = "ApiClientError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

export function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    if (error.code && friendlyByCode[error.code]) return friendlyByCode[error.code];
    return error.message || fallback;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { message?: string; code?: string };
    if (candidate.code && friendlyByCode[candidate.code]) return friendlyByCode[candidate.code];
    if (candidate.message) return candidate.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
