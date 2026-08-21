/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ vòng công khai (public EMP ring helpers)
 * UC:         UC-BP-CORE-01 · FR-UC-BP-CORE-01 · BR-BP-SEC-01
 * BR:         O2 CORE-PUB-STRIP · O3 CORE-PUB-REJECT · O5 CORE-DEP-ONE · VAL-CORE-PUB-D-06
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-01
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md §4–§7
 *             docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md §4–§5
 * Purpose:    Public allow/deny strip map + CB-403 reject (no silent strip) + dep relation_label.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    employees.service mapPublicEmployee · create/update CB assert · dependents.service
 * Callees:    none (pure)
 * Impact:     Silent strip-and-200 = O3 FAIL; raw CF dump with salary = O2 FAIL
 * must_keep:  HRM-CORE-CB-403 · no Nest /core dual · CORE-02 write OUT · hire ≠ CORE DONE
 * SOLID:      Pure helpers — no Nest / SQL
 * LastVerified: po-hrm-mvp-gd1-core-01-cluster-be-01.spec.ts
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

/** Mint — public PATCH/POST body contains DATA §4.3 deny keys (O3). */
export const HRM_CORE_CB_403 = 'HRM-CORE-CB-403';

/** Mint — dependent missing required name/relation/DOB (welfare create). */
export const HRM_CORE_DEP_VAL_400 = 'HRM-CORE-DEP-VAL-400';

/** Mint — dependent not found / wrong emp / soft-archived. */
export const HRM_CORE_DEP_404 = 'HRM-CORE-DEP-404';

const CB_403_MESSAGE_VI =
  'Không được gửi hoặc sửa trường mật (lương / tài khoản ngân hàng / MST / BHXH) trên hồ sơ vòng công khai.';

/**
 * DATA §4.2 — known public admin / welfare CF keys (+ system / display denorm).
 * EFF non-C&B consumer keys that are not deny-listed may also pass filterPublicCustomFields.
 */
export const CORE_PUBLIC_CF_ALLOW_KEYS: ReadonlySet<string> = new Set([
  'phone_number',
  'work_phone',
  'personal_phone',
  'department_key',
  'department',
  'job_title_label',
  'position',
  'emergency_contact',
  'emergency_contact_name',
  'emergency_phone',
  'emergency_contact_phone',
  'address',
  'address_line',
  'address_city',
  'address_district',
  'address_ward',
  'cccd',
  'national_id',
  'tenant_id',
  'status_reason_key',
  'gender',
  'mobile_persona',
  'is_manager',
  'leave_balance',
  'annual_leave_balance',
  'remaining_leave_days',
  'grade',
  'branch',
  'management_unit',
]);

/** Open relation_code → VI display-ready label (FORBIDDEN closed product ceiling). */
const RELATION_LABELS_VI: Record<string, string> = {
  child: 'Con',
  spouse: 'Vợ/Chồng',
  parent: 'Cha/Mẹ',
  sibling: 'Anh/Chị/Em',
  other: 'Khác',
};

/**
 * DATA §4.3 — C&B deny key families (top-level body, DTO projection, or custom_fields).
 */
export function isCorePublicCbDenyKey(rawKey: string): boolean {
  const key = String(rawKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (!key) return false;

  if (
    key === 'salary' ||
    key === 'base_salary' ||
    key === 'allowances' ||
    key === 'tax_code' ||
    key === 'tax_id' ||
    key === 'mst' ||
    key === 'bank_account' ||
    key === 'bank_name'
  ) {
    return true;
  }

  if (key.endsWith('_salary') || key.startsWith('allowance_')) {
    return true;
  }
  if (key.startsWith('bank_')) {
    return true;
  }
  if (
    key.startsWith('social_insurance_') ||
    key.startsWith('bhxh_') ||
    key.startsWith('si_rate')
  ) {
    return true;
  }

  return false;
}

/** Filter custom_fields for public GET/list — omit §4.3 deny; keep allow + non-deny EFF keys. */
export function filterPublicCustomFields(
  customFields: Record<string, unknown> | null | undefined,
): Record<string, string> {
  if (!customFields || typeof customFields !== 'object') {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [rawKey, rawVal] of Object.entries(customFields)) {
    if (isCorePublicCbDenyKey(rawKey)) {
      continue;
    }
    const norm = rawKey.trim();
    if (!norm) continue;
    // Prefer known allow-list; also retain non-deny keys (EFF consumer / history non-C&B).
    if (
      CORE_PUBLIC_CF_ALLOW_KEYS.has(norm.toLowerCase().replace(/-/g, '_')) ||
      !isCorePublicCbDenyKey(norm)
    ) {
      if (rawVal === null || rawVal === undefined) continue;
      out[norm] = typeof rawVal === 'string' ? rawVal : String(rawVal);
    }
  }
  return out;
}

/**
 * Collect deny keys from body (top-level + nested custom_fields).
 * Empty → OK; non-empty → caller must throw HRM-CORE-CB-403 (no silent strip).
 */
export function collectCorePublicCbDenyKeys(
  body: Record<string, unknown> | null | undefined,
): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }
  const found: string[] = [];
  for (const key of Object.keys(body)) {
    if (key === 'custom_fields') continue;
    if (isCorePublicCbDenyKey(key)) {
      found.push(key);
    }
  }
  const cf = body.custom_fields;
  if (cf && typeof cf === 'object' && !Array.isArray(cf)) {
    for (const key of Object.keys(cf)) {
      if (isCorePublicCbDenyKey(key)) {
        found.push(`custom_fields.${key}`);
      }
    }
  }
  return found;
}

/** Fail-closed CB reject — O3 · silent strip-and-200 = FAIL. */
export function assertNoCorePublicCbDenyKeys(
  body: Record<string, unknown> | null | undefined,
): void {
  const denied = collectCorePublicCbDenyKeys(body);
  if (denied.length === 0) return;
  throw new ApiException(
    HRM_CORE_CB_403,
    CB_403_MESSAGE_VI,
    HttpStatus.FORBIDDEN,
    {
      denied_keys: denied,
    },
  );
}

export function resolveDependentRelationLabel(
  relationCode: string | null | undefined,
): string {
  const raw = String(relationCode ?? '').trim();
  if (!raw) return '—';
  const key = raw.toLowerCase().replace(/-/g, '_');
  return RELATION_LABELS_VI[key] ?? raw;
}

/** Summary gate VAL-D-06 — option (c): explicit include=compensation_summary. */
export function wantsCompensationSummary(include: string | undefined): boolean {
  if (!include?.trim()) return false;
  return include
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .includes('compensation_summary');
}
