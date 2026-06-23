import type { EmployeeRow } from '../integrations/hrmEmployees';
import type { PayslipListRow } from '../integrations/payrollPayslips';
import { statusLabel } from '../integrations/mapApiError';
import { resolveRoleSubtitle } from './dashboardEss';
import { formatHrmCurrency, formatHrmDate, sanitizeSeedDisplay } from './formatHrm';
import { buildProfilePersonalSections } from './profileEssFields';
import { resolvePayslipPeriodLabelVi } from './payslipDisplayVi';

export type ProfileTabKey = 'info' | 'work' | 'documents';

export const PROFILE_TAB_OPTIONS: { key: ProfileTabKey; label: string }[] = [
  { key: 'info', label: 'Thông tin' },
  { key: 'work', label: 'Công việc' },
  { key: 'documents', label: 'Tài liệu' },
];

export type ProfileFieldRow = {
  label: string;
  value: string;
  numeric?: boolean;
};

export type ProfileSection = {
  title: string;
  rows: ProfileFieldRow[];
};

export type ProfileContractDoc = {
  id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  active: 'Đang làm việc',
  inactive: 'Ngưng hoạt động',
  terminated: 'Đã nghỉ việc',
  on_leave: 'Đang nghỉ phép',
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  probation: 'Thử việc',
  indefinite: 'Không thời hạn',
  fixed_term: 'Có thời hạn',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Hide wire UUIDs and seed codes from profile UI — MOB-UX-09. */
export function sanitizeProfileDisplay(text: string | null | undefined): string {
  const sanitized = sanitizeSeedDisplay(text);
  if (sanitized === '—') return sanitized;
  if (UUID_RE.test(sanitized.trim())) return '—';
  if (/^HRM-[A-Z]+-\d+$/i.test(sanitized.trim())) return '—';
  return sanitized;
}

export function resolveEmployeeStatusLabel(status: string | null | undefined): string {
  const key = status?.trim().toLowerCase() ?? '';
  if (!key) return '—';
  return EMPLOYEE_STATUS_LABELS[key] ?? sanitizeProfileDisplay(status);
}

export function resolveContractTypeLabel(contractType: string | null | undefined): string {
  const key = contractType?.trim().toLowerCase() ?? '';
  if (!key) return '—';
  return CONTRACT_TYPE_LABELS[key] ?? sanitizeProfileDisplay(key.replace(/_/g, ' '));
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
