/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ nhân viên (display-ready mapper)
 * UC:         FR-UC-H01 · FR-UC-HRM-21
 * BR:         BR-SCOPE-01 · OS 28 FE–BE display-ready · display-label-no-raw-key
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md · FR-UC-H01 · FR-UC-HRM-21
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §3
 * Purpose:    Flatten nhãn VI (status / phòng ban / chức danh / tên) lên response list/get/patch
 *             để FE không join custom_fields hoặc catalog để hiện tên/dept.
 * WorkItem:   W1-B-02-EMP
 * Coded:      2026-08-03
 * Callers:    employees.service mapEmployee · employee-directory mapDirectory*
 * Callees:    none (pure)
 * Impact:     Thiếu field → FE lộ raw key / join lại custom_fields (vi phạm OS 28)
 * must_keep:  không trả job_title_key thô làm label; scope_parity thuộc service
 * SOLID:      Thuần hàm — tách khỏi Nest service / SQL
 * LastVerified: employees.service.spec.ts · employee-directory.spec.ts · employee-display.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * change_mode: ADD
 * What: status_label prefers Nest emp_employment_status name_vi when known (L-EMP-ST-13);
 *       hardcode VI map remains EFF=0 bootstrap only — FORBIDDEN sole SoT when EFF>0
 * must_keep: OS 28 display-ready · no FE join invent for label when BE provides
 */
import type { EmployeeRow } from './employee-directory.types';
import { readDepartment, readPhoneNumber } from './employee-directory';

const EMPLOYEE_STATUS_LABELS_VI: Record<string, string> = {
  active: 'Đang làm việc',
  inactive: 'Ngừng hoạt động',
  probation: 'Thử việc',
  resigned: 'Đã nghỉ việc',
  terminated: 'Chấm dứt HĐ',
};

/** OS 28 — FE bind without catalog/custom_fields join. */
export type EmployeeDisplayReadyFields = {
  status_label: string;
  department: string | null;
  job_title_label: string | null;
  display_name: string;
  phone_number: string | null;
};

/**
 * Prefer Nest catalog name_vi when known (L-EMP-ST-13); hardcode map = EFF=0 bootstrap only.
 */
export function employeeStatusLabelVi(
  status: string | null | undefined,
  catalogLabel?: string | null,
): string {
  const fromCatalog = String(catalogLabel ?? '').trim();
  if (fromCatalog) {
    return fromCatalog;
  }
  const raw = String(status ?? '').trim();
  const key = raw.toLowerCase();
  return EMPLOYEE_STATUS_LABELS_VI[key] ?? (raw || '—');
}

/**
 * True when value looks like a catalog/tech code (snake / SCREAMING_SNAKE / kebab),
 * not a human VI label. Short tokens without separator (e.g. «CEO») stay displayable.
 */
export function looksLikeJobTitleCatalogCode(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/\s/.test(s)) return false;
  if (
    /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(
      s,
    )
  ) {
    return false;
  }
  return /[_-]/.test(s);
}

/**
 * Chức danh VI (AC-FD-U02 / OS 28): prefer denormalized label; never leak raw catalog key.
 */
export function resolveEmployeeJobTitleLabel(
  jobTitleKey: string | null | undefined,
  customFields: Record<string, string> | null | undefined,
): string | null {
  const candidates = [
    customFields?.job_title_label?.trim(),
    customFields?.position?.trim(),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (!looksLikeJobTitleCatalogCode(candidate)) {
      return candidate;
    }
  }
  const key = jobTitleKey?.trim();
  if (key && !looksLikeJobTitleCatalogCode(key)) {
    return key;
  }
  return null;
}

export function buildEmployeeDisplayReadyFields(
  row: Pick<
    EmployeeRow,
    'full_name' | 'status' | 'job_title_key' | 'custom_fields'
  >,
  options?: { statusCatalogLabel?: string | null },
): EmployeeDisplayReadyFields {
  const name = (row.full_name ?? '').trim();
  return {
    status_label: employeeStatusLabelVi(
      row.status,
      options?.statusCatalogLabel,
    ),
    department: readDepartment(row.custom_fields),
    job_title_label: resolveEmployeeJobTitleLabel(
      row.job_title_key,
      row.custom_fields,
    ),
    display_name: name || '—',
    phone_number: readPhoneNumber(row.custom_fields),
  };
}
