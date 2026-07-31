/**
 * @CODE-MEMORY
 * Screen:     TabProfile — tabs / employment / contract_type labels
 * UC:         UC-HRM-MOB-12 · M-F-05 · M-F-09 · AC-U72-MOB-GLOBAL
 * BR:         U72 · BR-CO-LABEL-01
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-05/M-F-09 · SRS_FIELD_DISPLAY
 * TechSpec:   display-label-no-raw-key.mdc · web labelMaps parity
 * Purpose:    Profile tab builders + employee/contract status/type → VI; unknown → «—».
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    ProfileScreen · ContractsScreen
 * Callees:    statusLabel · resolvePayslipPeriodLabelVi · sanitizeSeedDisplay
 * must_keep:  PROFILE_TAB_OPTIONS VI; known gender via profileEssFields; U65
 * LastVerified: utils/__tests__/profileTabs.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Contract type dictionary (full-time, HDLD_KTH/HDLD_01, permanent); employment unknown→—; probation→Thử việc
 * Why: U72 M-F-05 · M-F-09
 * must_keep: resolvePayslipPeriodLabelVi slug rewrite; U65 · HOLD_DEPLOY
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-MOB-DIR-TOAST-01
 * What: Re-export sanitizeProfileDisplay from profileDisplaySanitize leaf.
 * Why: Break profileTabs ↔ profileEssFields Metro require cycle (LogBox P2).
 * must_keep: PROFILE_TAB_OPTIONS VI; ESS personal sections; U65 · HOLD_DEPLOY
 */

import type { EmployeeRow } from '../integrations/hrmEmployees';
import type { PayslipListRow } from '../integrations/payrollPayslips';
import { statusLabel } from '../integrations/mapApiError';
import { resolveRoleSubtitle } from './dashboardEss';
import { formatHrmCurrency, formatHrmDate } from './formatHrm';
import {
  sanitizeProfileDisplay,
  type ProfileFieldRow,
  type ProfileSection,
} from './profileDisplaySanitize';
import { buildProfilePersonalSections } from './profileEssFields';
import { resolvePayslipPeriodLabelVi } from './payslipDisplayVi';

export { sanitizeProfileDisplay };
export type { ProfileFieldRow, ProfileSection };

export type ProfileTabKey = 'info' | 'work' | 'documents';

export const PROFILE_TAB_OPTIONS: { key: ProfileTabKey; label: string }[] = [
  { key: 'info', label: 'Thông tin' },
  { key: 'work', label: 'Công việc' },
  { key: 'documents', label: 'Tài liệu' },
];

export type ProfileContractDoc = {
  id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

const EM_DASH = '—';

const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  active: 'Đang làm việc',
  inactive: 'Ngưng hoạt động',
  terminated: 'Đã nghỉ việc',
  on_leave: 'Đang nghỉ phép',
  probation: 'Thử việc',
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Toàn thời gian',
  fulltime: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  parttime: 'Bán thời gian',
  probation: 'Thử việc',
  indefinite: 'Không thời hạn',
  permanent: 'Không thời hạn',
  fixed_term: 'Có thời hạn',
  fixedterm: 'Có thời hạn',
  apprentice: 'Hợp đồng học việc',
  apprenticeship: 'Hợp đồng học việc',
  internship: 'Hợp đồng học việc',
  hdld_kth: 'Không thời hạn',
};

function looksLikeTechEnumKey(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/\s/.test(s)) return false;
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(s)) {
    return false;
  }
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/i.test(s);
}

function foldAscii(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

export function resolveEmployeeStatusLabel(status: string | null | undefined): string {
  const key = status?.trim().toLowerCase() ?? '';
  if (!key) return EM_DASH;
  return EMPLOYEE_STATUS_LABELS[key] ?? EM_DASH;
}

/**
 * Contract term type — align web resolveContractTypeDisplayLabel.
 * Tech codes → VI; human VI labels kept; unknown tech → «—».
 */
export function resolveContractTypeLabel(contractType: string | null | undefined): string {
  const trimmed = contractType?.trim() ?? '';
  if (!trimmed) return EM_DASH;

  const key = trimmed.toLowerCase().replace(/-/g, '_');
  if (CONTRACT_TYPE_LABELS[key]) return CONTRACT_TYPE_LABELS[key];
  if (key.startsWith('hdld_')) return 'Có thời hạn';

  const ascii = foldAscii(trimmed);
  if (
    ascii.includes('khong thoi han') ||
    ascii.includes('khong xac dinh thoi han') ||
    ascii.includes('vo thoi han') ||
    ascii.includes('thu viec') ||
    ascii.includes('hoc viec') ||
    ascii.includes('hop dong')
  ) {
    return trimmed;
  }

  if (!looksLikeTechEnumKey(trimmed)) return trimmed;
  return EM_DASH;
}

export function resolveProfileDepartment(row: EmployeeRow): string {
  const cf = (row as { custom_fields?: Record<string, string> }).custom_fields ?? {};
  const dept = cf.department?.trim() || cf.phong_ban?.trim() || '';
  if (dept) return sanitizeProfileDisplay(dept);
  return resolveRoleSubtitle(row.job_title_key);
}

export function buildProfileInfoSections(row: EmployeeRow): ProfileSection[] {
  return buildProfilePersonalSections(row);
}

export function buildProfileWorkSections(row: EmployeeRow): ProfileSection[] {
  return [
    {
      title: 'Thông tin công việc',
      rows: [
        { label: 'Chức danh', value: resolveRoleSubtitle(row.job_title_key) },
        { label: 'Phòng ban', value: resolveProfileDepartment(row) },
        { label: 'Trạng thái', value: resolveEmployeeStatusLabel(row.status) },
        { label: 'Ngày vào làm', value: formatHrmDate(row.hired_at) },
      ],
    },
  ];
}

export function buildProfileDocumentSections(
  payslips: PayslipListRow[],
  contracts: ProfileContractDoc[],
): ProfileSection[] {
  const payslipRows: ProfileFieldRow[] = payslips.slice(0, 5).map((p) => ({
    label: resolvePayslipPeriodLabelVi(p.period_label) || 'Kỳ lương',
    value: formatHrmCurrency(p.net_amount, p.currency),
    numeric: true,
  }));

  const contractRows: ProfileFieldRow[] = contracts.slice(0, 5).map((c) => ({
    label: resolveContractTypeLabel(c.contract_type),
    value: `${formatHrmDate(c.start_date)} – ${formatHrmDate(c.end_date)} · ${statusLabel(c.status)}`,
  }));

  const sections: ProfileSection[] = [];
  if (payslipRows.length > 0) {
    sections.push({ title: 'Phiếu lương gần đây', rows: payslipRows });
  }
  if (contractRows.length > 0) {
    sections.push({ title: 'Hợp đồng lao động', rows: contractRows });
  }
  return sections;
}

export function buildProfileSubtitle(row: EmployeeRow): string {
  const code = row.employee_code?.trim();
  const role = resolveRoleSubtitle(row.job_title_key);
  if (code) return `${code} · ${role}`;
  return role;
}
