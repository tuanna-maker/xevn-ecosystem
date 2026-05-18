/**
 * Nhãn hiển thị cho ánh xạ RACI → phân hệ XEVN (người dùng nghiệp vụ, không phải mã kỹ thuật).
 * Mã hệ thống vẫn giữ trong DB/API; UI dùng file này để dịch sang tiếng Việt.
 */

export const ECOSYSTEM_MODULE_LABELS: Record<string, string> = {
  xbos: 'X-BOS — Điều hành tập đoàn',
  hrm: 'HRM — Nhân sự & lương',
  crm: 'CRM — Khách hàng & hợp đồng',
  fleet: 'Fleet — Vận tải & điều phối',
  finance: 'Tài chính kế toán',
  wms: 'Kho & phân phối',
  logistics: 'Logistics',
};

export const ECOSYSTEM_FEATURE_LABELS: Record<string, string> = {
  'command_center.plan': 'Lập kế hoạch điều hành (Command Center)',
  'governance.budget': 'Phê duyệt ngân sách tập đoàn',
  'workflow.audit': 'Kiểm tra & giám sát quy trình',
  'recruitment.pipeline': 'Tuyển dụng & pipeline ứng viên',
  'contracts.manage': 'Quản lý hợp đồng lao động',
  'payroll.run': 'Chạy bảng lương kỳ',
  'quote.negotiate': 'Báo giá & đàm phán',
  'contract.lifecycle': 'Vòng đời hợp đồng kinh doanh',
  'dispatch.trips': 'Điều phối chuyến / hành trình',
  'dispatch.orders': 'Điều phối đơn vận tải',
  'gl.close': 'Khóa sổ kế toán',
  'ar.invoice': 'Hóa đơn công nợ phải thu',
};

export const ECOSYSTEM_PERMISSION_LABELS: Record<string, string> = {
  'xbos.command.plan': 'Lập và điều chỉnh kế hoạch điều hành',
  'xbos.budget.approve': 'Phê duyệt ngân sách',
  'xbos.audit.read': 'Xem nhật ký kiểm tra quy trình',
  'hrm.recruitment.manage': 'Quản lý tuyển dụng',
  'hrm.contracts.write': 'Tạo/sửa hợp đồng lao động',
  'hrm.payroll.run': 'Chạy và chốt bảng lương',
  'crm.quote.approve': 'Phê duyệt báo giá',
  'crm.contract.sign': 'Ký / duyệt hợp đồng kinh doanh',
  'fleet.dispatch.write': 'Điều phối chuyến trên hệ thống',
  'fleet.orders.manage': 'Quản lý đơn vận tải',
  'finance.gl.close': 'Khóa sổ kế toán',
  'finance.ar.invoice': 'Lập hóa đơn công nợ',
};

const RACI_LETTER_VI: Record<string, string> = {
  R: 'Thực hiện (R)',
  A: 'Chịu trách nhiệm (A)',
  C: 'Tham vấn (C)',
  I: 'Nhận thông tin (I)',
};

function titleCaseFromSlug(slug: string): string {
  return slug
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveModuleLabel(moduleCode: string): string {
  const key = moduleCode.trim().toLowerCase();
  return ECOSYSTEM_MODULE_LABELS[key] ?? titleCaseFromSlug(key);
}

export function resolveFeatureLabel(featureCode: string): string {
  const key = featureCode.trim();
  return ECOSYSTEM_FEATURE_LABELS[key] ?? titleCaseFromSlug(key);
}

export function resolvePermissionLabel(permissionCode: string | undefined | null): string {
  if (!permissionCode?.trim()) return '—';
  const key = permissionCode.trim();
  return ECOSYSTEM_PERMISSION_LABELS[key] ?? titleCaseFromSlug(key.replace(/\./g, ' '));
}

export function resolveRaciLetterDisplay(letter: string | undefined | null): string {
  if (!letter?.trim()) return '—';
  const l = letter.trim().toUpperCase();
  if (l === '*') return 'Theo ma trận mặc định';
  return RACI_LETTER_VI[l] ?? l;
}

/** Tooltip cho admin: vẫn thấy mã kỹ thuật khi hover. */
export function formatTechnicalHint(parts: Record<string, string | undefined>): string {
  return Object.entries(parts)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}
