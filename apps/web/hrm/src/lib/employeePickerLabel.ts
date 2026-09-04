/**
 * @CODE-MEMORY
 * Screen:     HRM employee Select pickers (hire bind · satellite) + profile Chức vụ
 * UC:         UC-HRM-INT-01 · BM-AC-07 · UC/FR-HRM-U72-LABEL-01 · AC-FD-U02
 * BR:         G-DB-01 hire bind · FR-HRM-EM-01 chức vụ · BR-CO-LABEL-01 · BR-U72-NULL-01
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 · FR-HRM-INT-01
 *             docs/hrm/SRS_FIELD_DISPLAY.md §3 U-02 / AC-FD-U02
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01 · CreateEmployee job_title_key
 * Purpose:    Label Select «mã — tên · chức vụ» từ job_title_label / custom_fields;
 *             không phụ thuộc department luôn-null từ mapper cũ; cấm lộ raw job_title_key.
 * WorkItem:   BM-FE-HIRE-TITLE-01
 * Coded:      2026-07-21
 * Callers:    HireEmployeeLinkDialog · mapHrmEmployeeRecord (resolve helpers) · labelMaps
 * Callees:    catalogSearchPicker (optional catalog resolve)
 * must_keep:  G-DB-01 hire bind dialog · U65 · leave CREATE untouched · never || raw key
 * SOLID:      Thuần hàm — UI không nhúng format rải rác
 * LastVerified: docs/qa/evidence/d-hrm-u72-label-fe-02-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-02
 * change_mode: FIX
 * What: Prefer job_title_label / VI position; catalog label when code known; never raw job_title_key
 * Why: QA AC-FD-U02 FAIL — profile HLD-0996 showed LEGAL_SPECIALIST
 * SRS/BR: SRS_FIELD_DISPLAY.md §3 U-02 · AC-FD-U02 · display-label-no-raw-key.mdc
 * must_keep: hire picker format; F-01..F-13 maps; resolveIndustryDisplay; U65 no seed
 */

import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { resolveCatalogPickerSelection } from '@/lib/catalogSearchPicker';

export type EmployeePickerLabelSource = {
  employee_code?: string | null;
  full_name?: string | null;
  department?: string | null;
  position?: string | null;
  /** Companion VI label when BE/settings denormalize (AC-FD-U02). */
  job_title_label?: string | null;
  job_title_key?: string | null;
  custom_fields?: Record<string, string> | null;
};

function trimOrNull(value: string | null | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

/**
 * True when value looks like a catalog/tech code (snake / SCREAMING_SNAKE / kebab),
 * not a human VI label. Short tokens without separator (e.g. «CEO», «HCNS») stay
 * displayable when they come from an explicit label/position field.
 */
export function looksLikeJobTitleCatalogCode(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/\s/.test(s)) return false;
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(s)) {
    return false;
  }
  // snake_case / SCREAMING_SNAKE / kebab-case only (LEGAL_SPECIALIST, legal-specialist).
  return /[_-]/.test(s);
}

/** Mã phòng ban (catalog key) — SoT custom_fields.department; không dùng nhãn hiển thị. */
export function resolveEmployeeDepartmentKey(source: EmployeePickerLabelSource): string | null {
  const fromCustom = trimOrNull(source.custom_fields?.department);
  if (fromCustom) return fromCustom;
  const top = trimOrNull(source.department);
  if (!top) return null;
  if (looksLikeJobTitleCatalogCode(top)) return top;
  return top;
}

/** Phòng ban hiển thị: nhãn denorm hoặc fallback mã (picker resolve label sau). */
export function resolveEmployeeDepartmentLabel(source: EmployeePickerLabelSource): string | null {
  return (
    trimOrNull(source.department) ??
    trimOrNull(source.custom_fields?.department) ??
    null
  );
}

/**
 * Chức vụ / chức danh (AC-FD-U02):
 * Prefer job_title_label → VI position fields → settings catalog label for job_title_key.
 * Never return raw job_title_key / snake code (unknown → null; UI shows «—»).
 */
export function resolveEmployeePositionLabel(
  source: EmployeePickerLabelSource,
  catalogOptions?: readonly CatalogPickerOption[],
): string | null {
  const key = trimOrNull(source.job_title_key);

  if (key && catalogOptions && catalogOptions.length > 0) {
    const fromCatalog = resolveCatalogPickerSelection(catalogOptions, key);
    if (fromCatalog?.label?.trim()) {
      return fromCatalog.label.trim();
    }
  }

  const preferredCandidates = [
    trimOrNull(source.job_title_label),
    trimOrNull(source.custom_fields?.job_title_label),
    trimOrNull(source.custom_fields?.position),
    trimOrNull(source.position),
  ];

  for (const candidate of preferredCandidates) {
    if (!candidate) continue;
    if (!looksLikeJobTitleCatalogCode(candidate)) {
      return candidate;
    }
    const fromCatalog = resolveCatalogPickerSelection(catalogOptions ?? [], candidate);
    if (fromCatalog?.label?.trim()) {
      return fromCatalog.label.trim();
    }
  }

  if (key) {
    const fromCatalog = resolveCatalogPickerSelection(catalogOptions ?? [], key);
    if (fromCatalog?.label?.trim()) {
      return fromCatalog.label.trim();
    }
  }

  // Never fall back to raw job_title_key (AC-FD-U02 / BR-U72-NULL-01).
  return null;
}

/**
 * Hire / employee Select: «CODE — Name · Chức danh» (+ dept nếu khác title).
 */
export function formatEmployeePickerLabel(
  source: EmployeePickerLabelSource,
  catalogOptions?: readonly CatalogPickerOption[],
): string {
  const code = trimOrNull(source.employee_code) ?? '—';
  const name = trimOrNull(source.full_name) ?? '—';
  const title = resolveEmployeePositionLabel(source, catalogOptions);
  const dept = resolveEmployeeDepartmentLabel(source);

  let label = `${code} — ${name}`;
  if (title) {
    label += ` · ${title}`;
  }
  if (dept && dept !== title) {
    label += ` (${dept})`;
  }
  return label;
}
