import type { EmployeeRow } from '../integrations/hrmEmployees';
import type { ProfileFieldRow, ProfileSection } from './profileTabs';
import { sanitizeProfileDisplay } from './profileTabs';

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
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
  return GENDER_LABELS[key] ?? sanitizeProfileDisplay(key);
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
  if (phone) {
    contactRows.push({ label: 'Số điện thoại', value: sanitizeProfileDisplay(phone) });
  }

  const personalRows: ProfileFieldRow[] = [];
  if (cf.gender) {
    personalRows.push({ label: 'Giới tính', value: resolveGenderVi(cf.gender) });
  }
  if (cf.address || cf.dia_chi) {
    personalRows.push({
      label: 'Địa chỉ',
      value: sanitizeProfileDisplay(cf.address || cf.dia_chi),
    });
  }
  if (cf.emergency_contact_name) {
    personalRows.push({
      label: 'Liên hệ khẩn cấp',
      value: sanitizeProfileDisplay(cf.emergency_contact_name),
    });
  }

  const sections: ProfileSection[] = [{ title: 'Liên hệ', rows: contactRows }];
  if (personalRows.length > 0) {
    sections.push({ title: 'Thông tin cá nhân', rows: personalRows });
  }
  return sections;
}
