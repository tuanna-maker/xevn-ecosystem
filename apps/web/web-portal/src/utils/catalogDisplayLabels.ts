/** User-facing Vietnamese labels for HRM/XBOS catalog keys — hide raw technical keys in UI. */
const CATALOG_KEY_LABELS: Record<string, string> = {
  positions: 'Chức danh',
  job_levels: 'Cấp bậc',
  departments: 'Phòng ban',
  org_units: 'Đơn vị tổ chức',
  contract_types: 'Loại hợp đồng',
  salary_grades: 'Bậc lương',
  banks: 'Ngân hàng',
  education_levels: 'Trình độ học vấn',
  ethnicities: 'Dân tộc',
  religions: 'Tôn giáo',
  nationalities: 'Quốc tịch',
  document_types: 'Loại giấy tờ',
  leave_types: 'Loại nghỉ phép',
  attendance_types: 'Loại chấm công',
  kpi_metrics: 'Chỉ số KPI',
  vendors: 'Nhà cung cấp',
  expense_categories: 'Hạng mục chi phí',
  branches: 'Chi nhánh',
  work_locations: 'Địa điểm làm việc',
  employee_statuses: 'Trạng thái nhân viên',
  recruitment_sources: 'Nguồn tuyển dụng',
};

const HAT_KEY_LABELS: Record<string, string> = {
  group_ceo: 'Phê duyệt tập đoàn',
  dept_head: 'Trưởng bộ phận',
  member_ceo: 'CEO công ty thành viên',
  subsidiary_submit: 'Gửi yêu cầu công ty',
  group_catalog_approval: 'Tập đoàn phê duyệt danh mục',
};

function normalizeCatalogKey(key: string): string {
  return key.trim().toLowerCase().replace(/-/g, '_');
}

/** Resolve catalog_key to Vietnamese business label; API name takes precedence. */
export function resolveCatalogKeyDisplayLabel(
  catalogKey: string,
  apiName?: string | null,
): string {
  const trimmedName = apiName?.trim();
  if (trimmedName && trimmedName.length > 0 && !trimmedName.includes('_')) {
    return trimmedName;
  }
  const normalized = normalizeCatalogKey(catalogKey);
  const mapped = CATALOG_KEY_LABELS[normalized];
  if (mapped) return mapped;
  if (trimmedName && trimmedName.length > 0) return trimmedName;
  return catalogKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Resolve workflow hat_key to Vietnamese role label. */
export function resolveHatKeyDisplayLabel(hatKey: string): string {
  const normalized = hatKey.trim().toLowerCase();
  return HAT_KEY_LABELS[normalized] ?? hatKey.replace(/_/g, ' ');
}

/** Shorten UUID for secondary/muted display (not a card title). */
export function shortenUuidForDisplay(id: string, visibleChars = 8): string {
  const trimmed = id.trim();
  if (trimmed.length <= visibleChars + 1) return trimmed;
  return `${trimmed.slice(0, visibleChars)}…`;
}
