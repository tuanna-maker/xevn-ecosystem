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
