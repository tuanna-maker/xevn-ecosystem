/**
 * UC-BP-PAY-09 · F-PAY-GROUP-01 — catalog / scope / filter boundary (no FE net SoT).
 * must_keep: PAY01QC1..PAY08QC1 · payroll_e2e_ready=false · ≠ FR-UC-BP-PAY-09 DONE · no hardcode four groups
 * WorkItem: PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01
 */

export const PAY09_GROUP_HONESTY_FOOTER =
  'payroll_e2e_ready=false · C-SLICE · ≠ FR-UC-BP-PAY-09 DONE · CFG/filter/snapshot only — calculator = PAY-06 process';

export const PAY09_PEER_STAMP_PAY08 = 'PAY08QC1-MSMFFXGWC1';

/** Cấm seed UI enum VP/KD/TX/VH — AC-PAY-GROUP-≠-HARDCODE */
export const PAY09_FORBIDDEN_HARDCODE_CODES = ['VP', 'KD', 'TX', 'VH', 'office', 'sales', 'driver', 'ops'] as const;

export type HrmPayrollGroupStatus = 'active' | 'retired';

export type HrmPayrollGroupMatchRule = {
  department_ids?: string[];
  position_keys?: string[];
  employee_ids?: string[];
};

export type HrmPayrollGroupRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  priority: number;
  match_rule_json: HrmPayrollGroupMatchRule;
  formula_definition_id?: string | null;
  status: HrmPayrollGroupStatus;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmPayrollGroupMemberPreviewRow = {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  match_source: string;
  conflict?: boolean;
};

export function formatPayrollGroupStatusLabelVi(status: HrmPayrollGroupStatus | string | null | undefined): string {
  const key = String(status ?? '').trim().toLowerCase();
  if (key === 'active') return 'Đang dùng';
  if (key === 'retired') return 'Ngừng sử dụng';
  return key ? key : '—';
}

export function formatPayrollGroupMatchSourceLabelVi(source: string | null | undefined): string {
  const key = String(source ?? '').trim().toLowerCase();
  switch (key) {
    case 'explicit_list':
      return 'Danh sách đặc thù';
    case 'department':
      return 'Phòng ban';
    case 'position':
      return 'Chức danh';
    default:
      return key ? key : '—';
  }
}

export function parseCommaSeparatedIds(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinCommaSeparatedIds(ids: string[] | undefined): string {
  if (!ids?.length) return '';
  return ids.join(', ');
}

export function buildMatchRuleFromForm(input: {
  departmentIdsText: string;
  positionKeysText: string;
  employeeIdsText: string;
}): HrmPayrollGroupMatchRule {
  const rule: HrmPayrollGroupMatchRule = {};
  const dept = parseCommaSeparatedIds(input.departmentIdsText);
  const pos = parseCommaSeparatedIds(input.positionKeysText);
  const emp = parseCommaSeparatedIds(input.employeeIdsText);
  if (dept.length) rule.department_ids = dept;
  if (pos.length) rule.position_keys = pos;
  if (emp.length) rule.employee_ids = emp;
  return rule;
}

export function resolvePayGroup409UserMessage(code: string | undefined, fallback?: string): string {
  if (code === 'HRM-PAY-GROUP-409') {
    return (
      fallback?.trim() ||
      'Xung đột phân nhóm lương (hai nhóm cùng ưu tiên hoặc nhóm đã ngừng). Kiểm tra priority và trạng thái nhóm.'
    );
  }
  return fallback?.trim() || 'Không thể lưu cấu hình nhóm lương.';
}

export function assertNoHardcodedPayrollGroupSeed(codes: string[]): boolean {
  const lowered = new Set(codes.map((c) => c.trim().toLowerCase()));
  return !PAY09_FORBIDDEN_HARDCODE_CODES.some((b) => lowered.has(b.toLowerCase()));
}
