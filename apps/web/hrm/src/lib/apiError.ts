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
  "RATE-429": "Hệ thống đang giới hạn tần suất truy cập (429). Vui lòng đợi vài giây rồi Thử lại.",
  "SHEET-400": "File import không hợp lệ hoặc thiếu tham số kind.",
  "SHEET-408": "Xử lý file vượt quá thời gian cho phép trên máy chủ.",
  "SHEET-413": "File hoặc dữ liệu vượt quá giới hạn kích thước/số dòng.",
  "SHEET-415": "Định dạng file không được hỗ trợ cho import.",
  "SHEET-422": "Dữ liệu import không thỏa điều kiện nghiệp vụ (xem chi tiết từng dòng).",
  "SCOPE_TENANT_REQUIRED": "Thiếu tenant trong phạm vi yêu cầu.",
  "SCOPE_COMPANY_REQUIRED": "Thiếu công ty trong phạm vi yêu cầu.",
  "SCOPE_TENANT_INVALID": "Tenant không hợp lệ.",
  "SCOPE_COMPANY_INVALID": "Công ty không hợp lệ.",
  "SCOPE_CONTEXT_MISMATCH": "Phạm vi tenant/công ty không khớp phiên đăng nhập.",
  "HRM-REC-WF-LOCKED":
    "Đang chạy quy trình phê duyệt — duyệt trên Inbox; không đổi giai đoạn/trạng thái trực tiếp.",
  "HRM-REC-WF-SPAWN-MISSING":
    "Không tạo được quy trình phê duyệt. Kiểm tra mẫu QT trên XBOS rồi gửi lại.",
  "HRM-REC-WF-STAGE-UNMAPPED": "Bước quy trình chưa gắn với giai đoạn tuyển dụng.",
  /** FR-HRM-INT-01 Diễn biến #5 — chốt hired thiếu mã hồ sơ. */
  "HRM-REC-HIRE-400":
    "Chốt tuyển cần gắn hồ sơ nhân viên. Chọn hoặc tạo hồ sơ cùng đơn vị rồi thử lại.",
  /** FR-HRM-INT-01 Diễn biến #4 — hồ sơ khác đơn vị. */
  "HRM-REC-HIRE-409":
    "Hồ sơ nhân viên và ứng viên không cùng đơn vị — không thể chốt tuyển.",
  /** FR-HRM-AT-10 Diễn biến #5 — chồng lịch nghỉ (409). */
  "HRM-LEAVE-VAL-OVERLAP":
    "Khoảng ngày trùng với đơn nghỉ đang chờ duyệt hoặc đã duyệt. Chọn ngày khác rồi gửi lại.",
  /** FR-HRM-AT-10 Diễn biến #6 — hết phép khi theo dõi số dư (400). */
  "HRM-LEAVE-VAL-BALANCE":
    "Không đủ số dư phép cho loại nghỉ này. Giảm số ngày hoặc chọn loại khác.",
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

/** True for fetch abort / navigation cancel — not user-facing failures. */
export function isAbortLikeError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error) {
    const name = error.name?.toLowerCase() ?? "";
    const message = error.message?.toLowerCase() ?? "";
    if (name === "aborterror") return true;
    if (message.includes("aborted") || message.includes("abort")) return true;
  }
  return false;
}

/** Enrich BALANCE toast with available/requested days when BE returns details. */
function leaveBalanceMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as { available_days?: unknown; requested_days?: unknown };
  const available = Number(d.available_days);
  const requested = Number(d.requested_days);
  if (!Number.isFinite(available) || !Number.isFinite(requested)) return null;
  return `Không đủ số dư phép. Còn ${available} ngày, yêu cầu ${requested} ngày.`;
}

export function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    if (error.code === "HRM-LEAVE-VAL-BALANCE") {
      const enriched = leaveBalanceMessage(error.details);
      if (enriched) return enriched;
    }
    if (error.code && friendlyByCode[error.code]) return friendlyByCode[error.code];
    if (error.status === 429) return friendlyByCode["RATE-429"];
    return error.message || fallback;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: string;
      code?: string;
      status?: number;
      details?: unknown;
    };
    if (candidate.code === "HRM-LEAVE-VAL-BALANCE") {
      const enriched = leaveBalanceMessage(candidate.details);
      if (enriched) return enriched;
    }
    if (candidate.code && friendlyByCode[candidate.code]) return friendlyByCode[candidate.code];
    if (candidate.status === 429) return friendlyByCode["RATE-429"];
    if (candidate.message) return candidate.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
