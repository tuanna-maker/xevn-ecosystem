/**
 * @CODE-MEMORY
 * Screen:     TabProfile â†’ Profile â†’ ThĂ´ng tin â€” DynamicProfileForm (ESS self)
 * UC:         UC-HRM-MOB-12 full (W7-6)
 * BR:         BR-ESS-01 (self allowlist) Â· BR-ESS-02 (full phone on self) Â· BR-BDAY-01 (no DOB year)
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md Â§4.5 Â· docs/hrm/SRS_MOBILE.md UC-HRM-MOB-12
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md DynamicProfileForm Â· DATA Â§7 custom_fields
 * Purpose:    Map settings-catalog employee fields + EmployeeRow into editable/read-only
 *             profile form rows; build merged custom_fields PATCH for self allowlist.
 * WorkItem:   PCOMP-W7-MOB-PROFILE-FULL-01
 * Coded:      2026-07-19
 * @CODE-MEMORY-CHANGE 2026-07-28 â€” reaffirm AC-ESS; Plane B scope owned by ProfileScreen/hrmEmployees
 *
 * Callers:
 *   - features/profile/ProfileScreen.tsx â†’ buildDynamicProfileFields / buildSelfEssCustomFieldsPatch
 *   - components/profile/DynamicProfileForm.tsx â†’ field list
 *
 * Callees:
 *   - readEmployeeCustomFields / resolveGenderVi (profileEssFields)
 *   - sanitizeProfileDisplay (profileTabs)
 *
 * FE-Actions:
 *   | User action        | Handler                         | Lib / RPC                                      |
 *   |--------------------|---------------------------------|------------------------------------------------|
 *   | Edit SÄT â†’ LÆ°u     | ProfileScreen.saveEssFields     | PATCH /employees/:id { custom_fields }         |
 *   | View read-only     | DynamicProfileForm              | GET employee + GET settings-catalogs           |
 *
 * BE-Chain:
 *   GET settings-catalogs â†’ hrm_employee_personal_fields Â· PATCH employees (self allowlist BE)
 *
 * Impact:     Wrong allowlist â†’ HRM-EMP-403; DOB year leak â†’ BR-BDAY FAIL; empty catalog â†’ no ESS fields
 * must_keep:  Self editor only phone_number/work_phone; never render date_of_birth year; employee_code RO
 * SOLID:      Pure field mapping â€” no network; catalog fetch stays in hrmEmployeeFieldsCatalog
 * LastVerified: utils/__tests__/dynamicProfileForm.test.ts
 */

import type { EmployeeRow } from '../integrations/hrmEmployees';
import {
  isSelfEditableEssField,
  readEmployeeCustomFields,
  resolveGenderVi,
} from './profileEssFields';
import { sanitizeProfileDisplay } from './profileTabs';

export type EmployeeFieldCatalogItem = {
  code: string;
  label: string;
  unit: string | null;
  status?: string;
  catalogKey?: string;
};

export type DynamicProfileEditableBy = 'self' | 'hr' | 'none';

export type DynamicProfileField = {
  code: string;
  label: string;
  /** Raw wire value (edit buffer). */
  value: string;
  /** Localized / masked display for read-only. */
  displayValue: string;
  editableBy: DynamicProfileEditableBy;
  keyboardType: 'default' | 'phone-pad' | 'email-address';
  multiline: boolean;
  selectOptions?: string[];
};

/** W7 DATA Â§7 + seed template â€” used when GET settings-catalogs empty / offline. */
export const DEFAULT_W7_PERSONAL_FIELD_CATALOG: EmployeeFieldCatalogItem[] = [
  { code: 'employee_code', label: 'MĂ£ nhĂ¢n viĂªn', unit: 'text', catalogKey: 'hrm_employee_basic_fields' },
  { code: 'email', label: 'Email', unit: 'email', catalogKey: 'hrm_employee_basic_fields' },
  { code: 'phone_number', label: 'Sá»‘ Ä‘iá»‡n thoáº¡i', unit: 'phone', catalogKey: 'hrm_employee_personal_fields' },
  { code: 'work_phone', label: 'SÄT cĂ´ng viá»‡c', unit: 'phone', catalogKey: 'hrm_employee_personal_fields' },
  { code: 'gender', label: 'Giá»›i tĂ­nh', unit: 'select:Nam|Ná»¯|KhĂ¡c', catalogKey: 'hrm_employee_personal_fields' },
  {
    code: 'permanent_address',
    label: 'Äá»‹a chá»‰ thÆ°á»ng trĂº',
    unit: 'text',
    catalogKey: 'hrm_employee_personal_fields',
  },
  { code: 'national_id', label: 'CCCD/CMND', unit: 'text', catalogKey: 'hrm_employee_personal_fields' },
  { code: 'xbos_personal_hometown', label: 'QuĂª quĂ¡n', unit: 'text', catalogKey: 'hrm_employee_personal_fields' },
];

/** Never expose birth year on mobile self profile (BR-BDAY-01). */
const HIDDEN_ON_MOBILE_CODES = new Set(['date_of_birth', 'birth_year', 'dob']);

/** Column-backed codes (not only custom_fields). */
const ROW_COLUMN_CODES = new Set(['employee_code', 'email', 'full_name', 'job_title_key']);

/** Always read-only for self (AC-ESS-02 + HR policy). */
const ALWAYS_READ_ONLY_CODES = new Set([
  'employee_code',
  'email',
  'full_name',
  'job_title_key',
  'national_id',
  'status',
  'department',
  'position',
]);

const PROFILE_CATALOG_KEYS = new Set([
  'hrm_employee_basic_fields',
  'hrm_employee_personal_fields',
]);

export function parseSelectOptions(unit: string | null | undefined): string[] | undefined {
  if (!unit?.startsWith('select:')) return undefined;
  const raw = unit.slice('select:'.length).trim();
  if (!raw) return undefined;
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}

export function resolveFieldKeyboardType(
  code: string,
  unit: string | null | undefined,
): DynamicProfileField['keyboardType'] {
  if (unit === 'phone' || code.includes('phone')) return 'phone-pad';
  if (unit === 'email' || code === 'email') return 'email-address';
  return 'default';
}

export function resolveEditableBy(
  code: string,
  opts: { isHr: boolean },
): DynamicProfileEditableBy {
  if (HIDDEN_ON_MOBILE_CODES.has(code)) return 'none';
  if (ALWAYS_READ_ONLY_CODES.has(code)) return 'none';
  if (isSelfEditableEssField(code)) return 'self';
  if (opts.isHr) return 'hr';
  return 'none';
}

function readFieldRawValue(row: EmployeeRow, code: string, cf: Record<string, string>): string {
  switch (code) {
    case 'employee_code':
      return row.employee_code?.trim() ?? '';
    case 'email':
      return row.email?.trim() ?? '';
    case 'full_name':
      return row.full_name?.trim() ?? '';
    case 'job_title_key':
      return row.job_title_key?.trim() ?? '';
    case 'phone_number':
      return (cf.phone_number || cf.work_phone || '').trim();
    case 'work_phone':
      return (cf.work_phone || '').trim();
    case 'permanent_address':
      return (cf.permanent_address || cf.address || cf.dia_chi || '').trim();
    case 'gender':
      return (cf.gender || '').trim();
    default:
      return (cf[code] || '').trim();
  }
}

function formatDisplayValue(code: string, raw: string): string {
  if (!raw) return 'â€”';
  if (code === 'gender') return resolveGenderVi(raw);
  return sanitizeProfileDisplay(raw);
}

/**
 * Prefer catalog from API; fall back to W7 default personal set.
 * Dedupes by code (personal wins over basic when both present).
 */
export function resolveProfileFieldCatalog(
  catalogItems: EmployeeFieldCatalogItem[] | null | undefined,
): EmployeeFieldCatalogItem[] {
  const source =
    catalogItems && catalogItems.length > 0 ? catalogItems : DEFAULT_W7_PERSONAL_FIELD_CATALOG;
  const byCode = new Map<string, EmployeeFieldCatalogItem>();
  for (const item of source) {
    const code = item.code?.trim().toLowerCase();
    if (!code || HIDDEN_ON_MOBILE_CODES.has(code)) continue;
    if (item.status && item.status !== 'active' && item.status !== 'draft') continue;
    const key = item.catalogKey?.trim().toLowerCase() ?? '';
    if (key && !PROFILE_CATALOG_KEYS.has(key) && catalogItems && catalogItems.length > 0) {
      // API may return only personal; accept unscoped items from fallback.
      if (!key.startsWith('hrm_employee_')) continue;
    }
    if (!byCode.has(code)) {
      byCode.set(code, { ...item, code });
    }
  }
  // Ensure contact + phone always present for AC-ESS (even if catalog sparse).
  for (const fallback of DEFAULT_W7_PERSONAL_FIELD_CATALOG) {
    const code = fallback.code.toLowerCase();
    if (!byCode.has(code) && !HIDDEN_ON_MOBILE_CODES.has(code)) {
      byCode.set(code, fallback);
    }
  }
  const order = DEFAULT_W7_PERSONAL_FIELD_CATALOG.map((i) => i.code);
  const ordered: EmployeeFieldCatalogItem[] = [];
  for (const code of order) {
    const hit = byCode.get(code);
    if (hit) {
      ordered.push(hit);
      byCode.delete(code);
    }
  }
  for (const rest of byCode.values()) {
    if (ROW_COLUMN_CODES.has(rest.code) || rest.catalogKey === 'hrm_employee_personal_fields') {
      ordered.push(rest);
    }
  }
  return ordered;
}

export function buildDynamicProfileFields(
  row: EmployeeRow,
  catalogItems: EmployeeFieldCatalogItem[] | null | undefined,
  opts: { isHr: boolean },
): DynamicProfileField[] {
  const cf = readEmployeeCustomFields(row);
  const catalog = resolveProfileFieldCatalog(catalogItems);
  return catalog.map((item) => {
    const code = item.code.trim().toLowerCase();
    const raw = readFieldRawValue(row, code, cf);
    const editableBy = resolveEditableBy(code, opts);
    return {
      code,
      label: item.label?.trim() || code,
      value: raw,
      displayValue: formatDisplayValue(code, raw),
      editableBy,
      keyboardType: resolveFieldKeyboardType(code, item.unit),
      multiline: code.includes('address') || code.includes('hometown'),
      selectOptions: parseSelectOptions(item.unit),
    };
  });
}

/** Fields the current user may edit in the form (self allowlist or HR). */
export function filterEditableDynamicFields(
  fields: DynamicProfileField[],
  opts: { isHr: boolean },
): DynamicProfileField[] {
  return fields.filter((f) => {
    if (f.editableBy === 'self') return true;
    if (f.editableBy === 'hr' && opts.isHr) return true;
    return false;
  });
}

/**
 * Merge draft self-editable keys into existing custom_fields for PATCH.
 * Never sends date_of_birth / employee_code / email.
 */
export function buildSelfEssCustomFieldsPatch(
  existing: Record<string, string>,
  draft: Record<string, string>,
): Record<string, string> | null {
  const next: Record<string, string> = { ...existing };
  let changed = false;
  for (const [code, value] of Object.entries(draft)) {
    const key = code.trim().toLowerCase();
    if (!isSelfEditableEssField(key)) continue;
    if (HIDDEN_ON_MOBILE_CODES.has(key)) continue;
    const trimmed = value.trim();
    const prev = (existing[key] ?? '').trim();
    if (trimmed === prev) continue;
    if (trimmed) {
      next[key] = trimmed;
    } else {
      delete next[key];
    }
    changed = true;
  }
  return changed ? next : null;
}

export function draftFromDynamicFields(fields: DynamicProfileField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if (f.editableBy === 'self' || f.editableBy === 'hr') {
      out[f.code] = f.value;
    }
  }
  return out;
}

/** Touch target constant for DynamicProfileForm inputs / save (U49 â‰¥44px). */
export const DYNAMIC_PROFILE_TOUCH_MIN = 44;
