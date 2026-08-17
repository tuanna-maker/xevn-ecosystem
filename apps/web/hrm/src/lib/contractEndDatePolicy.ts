import { addMonths, addYears } from 'date-fns';

/**
 * @CODE-MEMORY
 * Screen:     HRM → Hợp đồng (create/update) — expiry theo loại HĐ
 * UC:         FR-HRM-CI-01 / G-CI-01 · UC-HRM-25
 * BR:         SRS §3.2 — Ngày kết thúc «Theo loại»; open-ended được bỏ trống
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.2 FR-HRM-CI-01
 * TechSpec:   docs/hrm/TECHSPEC.md §14.2 · §16.9 **G-CI-01**
 * Purpose:    Mirror BE `contract-end-date-policy` — FE chỉ bắt expiry khi loại có hạn.
 * WorkItem:   FE-HRM-G-CI-01
 * Coded:      2026-07-22
 * Callers:    EmployeeContracts.tsx · useContracts.ts · useEmployeeContracts.ts
 * Callees:    (pure)
 * Impact:     Sai policy → toast chặn POST HĐ không thời hạn hoặc bỏ bắt buộc HĐ có hạn
 * must_keep:  Codes indefinite/permanent/HDLD_KTH + nhãn «không thời hạn»; khớp BE normalize đ→d
 * SOLID:      Pure policy — hooks/UI chỉ gọi helper
 * LastVerified: contractEndDatePolicy.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục contractEndDatePolicy từ stash 43c479a — EmployeeContracts resolve
 * must_keep: indefinite codes khớp BE · Employees list · FE-LIBS-01 · Fleet
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 */

/** Strip diacritics for VN label match (không thời hạn / không xác định…). */
function normalizeContractTypeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

/**
 * Open-ended / indefinite labor contracts — end_date optional (SRS «Theo loại»).
 * Codes: indefinite, permanent, HDLD_KTH; labels containing không thời hạn / indefinite.
 */
export function isOpenEndedContractType(contractType: string): boolean {
  const key = normalizeContractTypeKey(contractType);
  if (!key) return false;
  if (key === 'indefinite' || key === 'permanent' || key === 'hdld_kth') {
    return true;
  }
  return (
    key.includes('indefinite') ||
    key.includes('khong thoi han') ||
    key.includes('khong xac dinh thoi han') ||
    key.includes('vo thoi han')
  );
}

export function contractTypeRequiresEndDate(contractType: string): boolean {
  return !isOpenEndedContractType(contractType);
}

export function hasContractExpiryValue(
  expiry: string | Date | null | undefined,
): boolean {
  if (expiry == null) return false;
  if (expiry instanceof Date) return !Number.isNaN(expiry.getTime());
  return expiry.trim().length > 0;
}

/** Toast copy kept for fixed-term UX (QA residual FE-HRM-G-CI-01). */
export const CONTRACT_DATES_REQUIRED_TOAST =
  'Vui lòng nhập ngày hiệu lực và ngày hết hạn';

export const CONTRACT_EFFECTIVE_REQUIRED_TOAST = 'Vui lòng nhập ngày hiệu lực';

/**
 * Client-side create/update gate before POST.
 * Open-ended may omit expiry; fixed-term still requires both.
 */
/**
 * Default expiry when create dialog opens — mirrors EmployeeContracts renewal helper.
 * Open-ended → far future; fixed-term → by type label/code (1y default).
 */
export function defaultContractExpiryDate(
  effectiveDate: Date,
  contractType: string,
): Date {
  if (isOpenEndedContractType(contractType)) {
    return addYears(effectiveDate, 100);
  }
  const key = contractType.trim().toLowerCase();
  if (key.includes('thử việc') || key.includes('probation') || key === 'probation') {
    return addMonths(effectiveDate, 2);
  }
  if (key.includes('3 năm') || key.includes('3y') || key.includes('3_year')) {
    return addYears(effectiveDate, 3);
  }
  if (key.includes('2 năm') || key.includes('2y') || key.includes('2_year')) {
    return addYears(effectiveDate, 2);
  }
  return addYears(effectiveDate, 1);
}

/** Fallback loại HĐ khi catalog/field ẩn — tránh gate coi chuỗi rỗng là fixed-term. */
export const CONTRACT_DATE_POLICY_FALLBACK_TYPE = 'fixed_term';

/**
 * Resolve contract type for date policy when UI omits type or catalog loads late.
 * D-HDSD-MUTATE-FE-07 — hidden date fields + empty type must still prefill/gate consistently.
 */
export function resolveContractTypeForDatePolicy(
  contractType: string,
  pickerOptionValues: readonly string[] = [],
): string {
  const trimmed = contractType.trim();
  if (trimmed.length > 0) return trimmed;
  const firstPicker = pickerOptionValues.find((v) => v.trim().length > 0)?.trim();
  return firstPicker ?? CONTRACT_DATE_POLICY_FALLBACK_TYPE;
}

export function ensureContractCreateDates(input: {
  effectiveDate: Date | undefined;
  expiryDate: Date | undefined;
  contractType: string;
  pickerOptionValues?: readonly string[];
}): { effective_date: Date; expiry_date: Date | undefined } {
  const typeForDates = resolveContractTypeForDatePolicy(
    input.contractType,
    input.pickerOptionValues,
  );
  const effective = input.effectiveDate ?? new Date();
  const needsExpiry = contractTypeRequiresEndDate(typeForDates);
  const expiry =
    needsExpiry && !hasContractExpiryValue(input.expiryDate)
      ? defaultContractExpiryDate(effective, typeForDates)
      : input.expiryDate;
  return { effective_date: effective, expiry_date: expiry };
}

export function validateContractDatesForSubmit(input: {
  contractType: string;
  effectiveDate: string | Date | null | undefined;
  expiryDate: string | Date | null | undefined;
}): { ok: true } | { ok: false; message: string } {
  const hasEffective = hasContractExpiryValue(input.effectiveDate);
  const hasExpiry = hasContractExpiryValue(input.expiryDate);
  if (!hasEffective) {
    return {
      ok: false,
      message: contractTypeRequiresEndDate(input.contractType)
        ? CONTRACT_DATES_REQUIRED_TOAST
        : CONTRACT_EFFECTIVE_REQUIRED_TOAST,
    };
  }
  if (!hasExpiry && contractTypeRequiresEndDate(input.contractType)) {
    return { ok: false, message: CONTRACT_DATES_REQUIRED_TOAST };
  }
  return { ok: true };
}
