/**
 * @CODE-MEMORY
 * Screen:     /contracts — spine preview field_overrides (Đ.21 blockers)
 * UC:         FR-UC-BP-CORE-09c · AC-CTR-PRINT-02/06 · R-CTR-PRINT-CAN-ISSUE
 * BR:         validatePreview requires work_location; ContractPreviewDto.field_overrides
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §A C2 · §D
 * TechSpec:   PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md · DATA-01 §5.8–5.12
 * Purpose:    Normalize preview missing_fields + build non-empty field_overrides for
 *             preview / print-version POST — không đưa company_id vào body.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * Coded:      2026-08-06
 * Callers:    ContractPrintSpinePanel
 * Callees:    (pure)
 * must_keep:  FE-02 builder company_id query-only; UF-HRM-02 registry path riêng
 * SOLID:      Pure helpers tách panel
 * LastVerified: contractPrintFieldOverrides.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 * change_mode: EXPAND
 * What: DRIVER GPLX override keys (number/issued_on/place) + alias driver_license_class
 * Why: AC-CORE-09B-03/05 · HRM-CTR-DRIVER-REQUIRED · show_driver_license_block
 * must_keep: work_location Đ.21 · company_id query-only · printable=false
 */

export type PreviewMissingFieldItem = {
  field: string;
  message?: string;
};

/** VI labels for Đ.21 / DRIVER override inputs on print spine. */
export const CONTRACT_PRINT_OVERRIDE_LABELS: Record<string, string> = {
  work_location: 'Nơi làm việc',
  work_location_scope: 'Phạm vi nơi làm việc',
  license_class: 'Hạng GPLX',
  driver_license_class: 'Hạng GPLX',
  driver_license_number: 'Số GPLX',
  driver_license_issued_on: 'Ngày cấp GPLX',
  driver_license_issued_place: 'Nơi cấp GPLX',
  vehicle_plate: 'Biển số xe',
  job_title: 'Chức danh',
  employee_full_name: 'Họ tên nhân viên',
  effective_from: 'Ngày hiệu lực',
  job_description_text: 'Mô tả công việc',
};

/** Fields user may fill on spine before preview (Đ.21 + DRIVER blockers). */
export const CONTRACT_PRINT_OVERRIDE_EDITABLE = [
  'work_location',
  'work_location_scope',
  'license_class',
  'driver_license_number',
  'driver_license_issued_on',
  'driver_license_issued_place',
  'vehicle_plate',
  'job_description_text',
] as const;

export type ContractPrintOverrideKey = (typeof CONTRACT_PRINT_OVERRIDE_EDITABLE)[number];

/**
 * BE may return `string[]` or `{ field, message }[]` — normalize for UI + override keys.
 */
export function normalizePreviewMissingFields(raw: unknown): PreviewMissingFieldItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: PreviewMissingFieldItem[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const field = item.trim();
      if (field) out.push({ field });
      continue;
    }
    if (item && typeof item === 'object' && 'field' in item) {
      const field = String((item as { field: unknown }).field ?? '').trim();
      if (!field) continue;
      const messageRaw = (item as { message?: unknown }).message;
      const message =
        typeof messageRaw === 'string' && messageRaw.trim() ? messageRaw.trim() : undefined;
      out.push({ field, message });
    }
  }
  return out;
}

export function labelForPrintOverrideField(field: string): string {
  return CONTRACT_PRINT_OVERRIDE_LABELS[field] ?? field;
}

/**
 * Collect non-empty trimmed overrides for POST body.field_overrides.
 * Omits blank values so BE merge does not wipe with "".
 */
export function buildContractPrintFieldOverrides(
  values: Record<string, string>,
): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(values)) {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) continue;
    out[key] = trimmed;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Map BE alias driver_license_class → physical license_class override key.
 */
export function normalizeOverrideFieldKey(field: string): string {
  const f = field.trim();
  if (f === 'driver_license_class') return 'license_class';
  return f;
}

/**
 * Keys to show as override inputs: always work_location + any missing editable fields.
 * When `forceDriverBlock`, always show DRIVER GPLX/plate inputs (pack=DRIVER).
 */
export function resolvePrintOverrideInputKeys(
  missing: PreviewMissingFieldItem[],
  opts?: { forceDriverBlock?: boolean },
): ContractPrintOverrideKey[] {
  const editable = new Set<string>(CONTRACT_PRINT_OVERRIDE_EDITABLE);
  const keys = new Set<ContractPrintOverrideKey>(['work_location']);
  for (const m of missing) {
    const field = normalizeOverrideFieldKey(m.field);
    if (editable.has(field)) {
      keys.add(field as ContractPrintOverrideKey);
    }
  }
  if (opts?.forceDriverBlock) {
    keys.add('license_class');
    keys.add('driver_license_number');
    keys.add('driver_license_issued_on');
    keys.add('driver_license_issued_place');
    keys.add('vehicle_plate');
  }
  return CONTRACT_PRINT_OVERRIDE_EDITABLE.filter((k) => keys.has(k));
}
