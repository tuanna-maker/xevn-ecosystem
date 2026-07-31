/** User-facing Vietnamese labels for HRM/XBOS catalog keys — hide raw technical keys in UI (U72). */
const CATALOG_KEY_LABELS: Record<string, string> = {
  positions: 'Chức danh',
  job_titles: 'Chức danh',
  employee_positions: 'Chức danh',
  job_levels: 'Cấp bậc',
  departments: 'Phòng ban',
  department_catalog: 'Phòng ban',
  org_departments: 'Phòng ban',
  org_units: 'Đơn vị tổ chức',
  contract_types: 'Loại hợp đồng',
  employment_types: 'Loại hình lao động',
  employment_type: 'Loại hình lao động',
  shifts: 'Ca làm việc',
  job_grades: 'Ngạch bậc',
  grades: 'Ngạch bậc',
  recruitment_channels: 'Kênh tuyển dụng',
  candidate_sources: 'Kênh tuyển dụng',
  channels: 'Kênh tuyển dụng',
  pay_types: 'Bản chất / loại TP lương',
  component_types: 'Bản chất / loại TP lương',
  pay_natures: 'Bản chất / loại TP lương',
  salary_component_types: 'Bản chất / loại TP lương',
  salary_components: 'Thành phần lương (danh mục)',
  payroll_components: 'Thành phần lương (danh mục)',
  decision_types: 'Loại quyết định',
  hr_decision_types: 'Loại quyết định',
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
};

function normalizeCatalogKey(key: string): string {
  return key.trim().toLowerCase().replace(/-/g, '_');
}

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
  return catalogKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
