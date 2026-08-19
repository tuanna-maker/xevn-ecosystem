/**
 * @CODE-MEMORY
 * Screen:     Hồ sơ vòng công khai (EmployeeForm / Profile / Gia đình)
 * UC:         UC-BP-CORE-01 · FR-UC-BP-CORE-01
 * BR:         BR-BP-SEC-01 · BR-CORE-CB-MAP · BR-CORE-PUB-STRIP · BR-CORE-FAMILY-≠-SALARY
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md F-CORE-EMP-01 · F-CORE-DEP-01
 * Purpose:    Helpers FE public ring — strip C&B deny keys khỏi body/custom_fields; quan hệ NPT
 *             open codes; redirect copy AC-CORE-CB-MAP-01; cấm FE invent salary aggregate.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeFormDialog · useEmployeeMutations · EmployeeFamilyInfo · mapHrmEmployeeRecord
 * Callees:    (pure) — Network SoT vẫn /api/hrm/employees*
 * must_keep:  DENY Nest /core SoT · same-form salary · hire=CORE DONE · seed · honesty flip
 * LastVerified: empCorePublicRing.test.ts
 */

/** Mint codes — toast via apiError (space before slash so CODE-MEMORY never closes early). */
export const HRM_CORE_CB_403_CODE = 'HRM-CORE-CB-403';
export const HRM_CORE_DEP_VAL_400_CODE = 'HRM-CORE-DEP-VAL-400';
export const HRM_CORE_DEP_404_CODE = 'HRM-CORE-DEP-404';
export const HRM_CORE_PUB_VAL_400_CODE = 'HRM-CORE-PUB-VAL-400';

/** DATA §4.3 deny families — top-level or nested under custom_fields. */
const CB_DENY_EXACT = new Set([
  'salary',
  'base_salary',
  'allowances',
  'tax_code',
  'tax_id',
  'mst',
  'bank_account',
  'bank_name',
  'social_insurance_number',
  'social_insurance_code',
  'social_insurance_no',
  'social_insurance_rate',
  'health_insurance_number',
  'si_rate',
]);

const CB_DENY_PREFIX = ['bank_', 'allowance_', 'bhxh_', 'si_rate'] as const;

export function isCoreCbDenyKey(rawKey: string): boolean {
  const key = rawKey.trim().toLowerCase();
  if (!key) return false;
  if (CB_DENY_EXACT.has(key)) return true;
  if (key.endsWith('_salary')) return true;
  return CB_DENY_PREFIX.some((p) => key.startsWith(p));
}

/** Strip deny keys from custom_fields map (public PATCH/POST). */
export function stripCoreCbKeysFromRecord(
  fields: Record<string, string> | null | undefined,
): Record<string, string> | undefined {
  if (!fields) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (isCoreCbDenyKey(k)) continue;
    out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** True if object (shallow) contains any §4.3 deny key — FE should not send. */
export function publicPayloadHasCbDenyKeys(body: Record<string, unknown> | null | undefined): boolean {
  if (!body) return false;
  for (const key of Object.keys(body)) {
    if (isCoreCbDenyKey(key)) return true;
  }
  const cf = body.custom_fields;
  if (cf && typeof cf === 'object' && !Array.isArray(cf)) {
    for (const key of Object.keys(cf as Record<string, unknown>)) {
      if (isCoreCbDenyKey(key)) return true;
    }
  }
  return false;
}

/** AC-CORE-CB-MAP-01 — copy redirect (VI). */
export const CORE_CB_MAP_REDIRECT_TITLE_VI =
  'Lương / tài khoản / MST / BHXH không chỉnh trên hồ sơ công khai';

export const CORE_CB_MAP_REDIRECT_BODY_VI =
  'Thông tin thu nhập và bảo mật thuộc vòng C&B (Hợp đồng – Bảo hiểm). Dùng tab Lương & thu nhập hoặc màn HĐ–BH — không gửi field mật qua PATCH hồ sơ hành chính.';

/** Open relation codes (DATA format-only — not closed product ceiling). */
export const CORE_DEP_RELATION_OPTIONS: ReadonlyArray<{ code: string; labelVi: string }> = [
  { code: 'spouse', labelVi: 'Vợ / Chồng' },
  { code: 'child', labelVi: 'Con' },
  { code: 'parent', labelVi: 'Cha / Mẹ' },
  { code: 'sibling', labelVi: 'Anh / Chị / Em' },
  { code: 'other', labelVi: 'Khác' },
] as const;

/** Prefer BE relation_label; fallback open picker label. */
export function resolveDependentRelationLabel(
  relationCode: string | null | undefined,
  relationLabel: string | null | undefined,
): string {
  const label = relationLabel?.trim();
  if (label) return label;
  const code = (relationCode ?? '').trim().toLowerCase();
  const hit = CORE_DEP_RELATION_OPTIONS.find((o) => o.code === code);
  return hit?.labelVi ?? (code || '—');
}

/** Physical path assert helper — QA / source tests. */
export const CORE_EMP_PHYSICAL_PATH_PREFIX = '/api/hrm/employees';
export const CORE_DEP_PHYSICAL_PATH_SUFFIX = '/dependents';

export function isCoreEmployeesPhysicalPath(path: string): boolean {
  return path.includes('/api/hrm/employees') && !path.includes('/api/hrm/core/employees');
}
