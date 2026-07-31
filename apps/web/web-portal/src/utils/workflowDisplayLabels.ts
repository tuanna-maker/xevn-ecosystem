/** Vietnamese labels for workflow business_type — sponsor-facing Action Cards / alerts. */
const WORKFLOW_BUSINESS_TYPE_LABELS: Record<string, string> = {
  catalog_governance: 'Quản trị danh mục',
  catalog_extension: 'Mở rộng danh mục',
  hrm_catalog_extension: 'Phê duyệt danh mục HRM',
  workflow_definition_review: 'Duyệt định nghĩa quy trình',
  fleet_ops: 'Vận hành đội xe',
  finance_expense: 'Chi phí & thanh toán',
  hrm_recruitment: 'Tuyển dụng',
  hrm_recruitment_plan: 'Kế hoạch tuyển dụng',
  hrm_requisition: 'Yêu cầu tuyển dụng',
  hrm_candidate: 'Roadmap ứng viên',
  hrm_payroll: 'Tiền lương',
  hrm_leave: 'Nghỉ phép',
  hrm_contract: 'Hợp đồng lao động',
  hrm_attendance: 'Chấm công',
  hrm_metadata: 'Thay đổi hồ sơ nhân sự',
  general: 'Nghiệp vụ chung',
  workflow: 'Quy trình phê duyệt',
};

function normalizeBusinessTypeKey(businessType: string): string {
  return businessType.trim().toLowerCase().replace(/-/g, '_');
}

/** Map workflow business_type snake_case to Vietnamese label for inbox Action Cards. */
export function resolveWorkflowBusinessTypeLabel(businessType: string): string {
  const raw = businessType.trim();
  if (!raw) return 'Quy trình phê duyệt';
  const normalized = normalizeBusinessTypeKey(raw);
  const mapped = WORKFLOW_BUSINESS_TYPE_LABELS[normalized];
  if (mapped) return mapped;
  if (!raw.includes('_')) return raw;
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Dev seed controls — hidden on production builds and remote VPS vite dev (:8088). */
export function shouldShowWorkflowDevSeedControls(): boolean {
  if (import.meta.env.PROD) return false;
  const explicit = import.meta.env.VITE_ENABLE_WORKFLOW_DEV_SEED;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}
