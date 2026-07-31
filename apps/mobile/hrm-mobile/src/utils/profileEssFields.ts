/**
 * @CODE-MEMORY
 * Screen:     TabProfile → Profile ESS helpers
 * UC:         UC-HRM-MOB-12 full (W7-6)
 * BR:         BR-ESS-01 self allowlist · BR-BDAY-01 no DOB year
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.5
 * TechSpec:   docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §7
 * Purpose:    Read custom_fields + gender VI + HR patch gate + personal section fallback.
 * WorkItem:   PCOMP-W7-MOB-PROFILE-FULL
 * Coded:      2026-06-09
 * @CODE-MEMORY-CHANGE 2026-07-19 — always emit phone/gender/address rows (— when empty) for J-MOB-12 shell
 *
 * Callers: dynamicProfileForm · profileTabs · ProfileScreen
 * Callees: sanitizeProfileDisplay
 * must_keep: SELF_EDITABLE = phone_number|work_phone only; never DOB year in sections
 * LastVerified: utils/__tests__/profileEssFields.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: resolveGenderVi unknown exotic code → «—» (cấm sanitize raw key)
 * Why: U72 M-F-09
 * must_keep: Nam/Nữ/Khác known map; U65 · HOLD_DEPLOY
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-MOB-DIR-TOAST-01
 * What: sanitizeProfileDisplay from profileDisplaySanitize leaf (not profileTabs).
 * Why: Break profileTabs ↔ profileEssFields Metro require cycle (LogBox P2).
 * must_keep: SELF_EDITABLE phone only; no DOB year; Plane B profile ESS
 */

import type { EmployeeRow } from '../integrations/hrmEmployees';
import {
  sanitizeProfileDisplay,
  type ProfileFieldRow,
  type ProfileSection,
} from './profileDisplaySanitize';

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
  nam: 'Nam',
  nữ: 'Nữ',
  nu: 'Nữ',
  khác: 'Khác',
  khac: 'Khác',
};

const SELF_EDITABLE_CATALOG_KEYS = new Set(['phone_number', 'work_phone']);

const HR_FULL_PATCH_ROLES = new Set([
  'group_ceo',
  'subsidiary_ceo',
  'company_ceo',
  'chro',
  'hr_admin',
  'hr_manager',
]);

export function readEmployeeCustomFields(row: EmployeeRow): Record<string, string> {
  const cf = (row as { custom_fields?: Record<string, unknown> }).custom_fields;
  if (!cf || typeof cf !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(cf)) {
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim();
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = String(value);
    }
  }
  return out;
}

export function resolveGenderVi(code: string | null | undefined): string {
  const key = code?.trim().toLowerCase() ?? '';
  if (!key) return '—';
  return GENDER_LABELS[key] ?? '—';
}

export function canHrFullEmployeePatch(roles: string[]): boolean {
  return roles.some((r) => HR_FULL_PATCH_ROLES.has(r.trim().toLowerCase()));
}

export function isSelfEditableEssField(catalogKey: string): boolean {
  return SELF_EDITABLE_CATALOG_KEYS.has(catalogKey);
}

/** MOB-12 W7-6 — extended personal sections from `custom_fields` (no raw DOB year on UI). */
export function buildProfilePersonalSections(row: EmployeeRow): ProfileSection[] {
  const cf = readEmployeeCustomFields(row);
  const contactRows: ProfileFieldRow[] = [
    { label: 'Email', value: sanitizeProfileDisplay(row.email) },
    { label: 'Mã nhân viên', value: sanitizeProfileDisplay(row.employee_code) },
  ];

  const phone = cf.phone_number || cf.work_phone;
  contactRows.push({
    label: 'Số điện thoại',
    value: phone ? sanitizeProfileDisplay(phone) : '—',
  });

  const personalRows: ProfileFieldRow[] = [
    { label: 'Giới tính', value: cf.gender ? resolveGenderVi(cf.gender) : '—' },
    {
      label: 'Địa chỉ',
      value: sanitizeProfileDisplay(cf.permanent_address || cf.address || cf.dia_chi) || '—',
    },
  ];
  if (cf.emergency_contact_name) {
    personalRows.push({
      label: 'Liên hệ khẩn cấp',
      value: sanitizeProfileDisplay(cf.emergency_contact_name),
    });
  }
  if (cf.national_id) {
    personalRows.push({
      label: 'CCCD/CMND',
      value: sanitizeProfileDisplay(cf.national_id),
    });
  }

  return [
    { title: 'Liên hệ', rows: contactRows },
    { title: 'Thông tin cá nhân', rows: personalRows },
  ];
}
