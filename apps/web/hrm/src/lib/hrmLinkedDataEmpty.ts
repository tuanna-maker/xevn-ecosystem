/**
 * P-CC-05..08: list API empty while workforce exists → actionable gap (not silent empty).
 * Aligns with HRM_MENU_DATA_LINKAGE_MATRIX / fidelity seed (ADR scope ladder pending).
 */
export type LinkedDataMenuKey =
  | 'insurance'
  | 'contracts'
  | 'recruitment'
  | 'attendance'
  | 'payroll';

export type LinkedDataEmptyCopy = {
  title: string;
  body: string;
  seedHint: string;
  syncHint: string;
};

const COPY: Record<LinkedDataMenuKey, LinkedDataEmptyCopy> = {
  insurance: {
    title: 'Chưa có hồ sơ BHXH liên kết nhân sự',
    body: 'Đã có nhân sự trong phạm vi công ty nhưng chưa có bản ghi bảo hiểm gắn employee_id.',
    seedHint: 'Chạy seed dữ liệu vệ tinh HRM (pnpm seed:hrm:fidelity) hoặc nhập hồ sơ từ màn Bảo hiểm.',
    syncHint: 'Đồng bộ danh mục đối tác BHXH từ XBOS (Command Center → Cấu hình → Duyệt danh mục HRM).',
  },
  contracts: {
    title: 'Chưa có hợp đồng lao động liên kết',
    body: 'Đã có nhân sự nhưng chưa có hợp đồng (employee_contracts) trong phạm vi công ty.',
    seedHint: 'Chạy seed:hrm:fidelity (contracts) hoặc tạo hợp đồng mới từ tab Hợp đồng.',
    syncHint: 'Đồng bộ loại hợp đồng / trạng thái từ XBOS (catalog-sync) trước khi nhập hàng loạt.',
  },
  recruitment: {
    title: 'Chưa có yêu cầu tuyển dụng liên kết',
    body: 'Đã có nhân sự nhưng chưa có job requisition / pipeline tuyển dụng trong phạm vi công ty.',
    seedHint: 'Chạy seed:hrm:fidelity (requisitions, candidates) hoặc tạo yêu cầu tuyển dụng mới.',
    syncHint: 'Đồng bộ danh mục chức danh / kênh tuyển dụng từ XBOS trước khi mở requisition.',
  },
  attendance: {
    title: 'Chưa có dữ liệu chấm công liên kết',
    body: 'Đã có nhân sự nhưng chưa có bản ghi chấm công (attendance_records) cho bộ lọc ngày/kỳ hiện tại.',
    seedHint: 'Chạy seed:hrm:fidelity (attendance) hoặc ghi nhận công qua mobile / tab Dữ liệu chấm công.',
    syncHint: 'Đồng bộ ca làm / loại nghỉ từ XBOS (catalog-sync) nếu thiếu danh mục tham chiếu.',
  },
  payroll: {
    title: 'Chưa có kỳ lương / phiếu lương liên kết',
    body: 'Đã có nhân sự nhưng chưa có kỳ lương hoặc phiếu lương trong phạm vi công ty.',
    seedHint: 'Chạy seed:hrm:fidelity (payroll periods, payslips) hoặc tạo đợt tính lương mới.',
    syncHint: 'Đồng bộ thành phần lương / mẫu bảng lương từ XBOS trước khi chốt kỳ.',
  },
};

export function getLinkedDataEmptyCopy(menu: LinkedDataMenuKey): LinkedDataEmptyCopy {
  return COPY[menu];
}

/** True when Nest list is empty but workforce count > 0 (portal/API mode). */
export function isLinkedDataGap(
  listCount: number,
  workforceTotal: number | null | undefined,
  apiMode: boolean,
): boolean {
  if (!apiMode) return false;
  if (listCount > 0) return false;
  if (workforceTotal == null) return false;
  return workforceTotal > 0;
}

/** Portal parent: Command Center HRM catalog governance (settings sync). */
export const PORTAL_HRM_CATALOG_SYNC_PATH = '/command-center/settings/hrm_catalog_governance';

export function navigatePortalCatalogSync(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.parent && window.parent !== window) {
      window.parent.location.assign(PORTAL_HRM_CATALOG_SYNC_PATH);
      return;
    }
  } catch {
    // cross-origin iframe — fall through
  }
  window.location.assign(PORTAL_HRM_CATALOG_SYNC_PATH);
}
