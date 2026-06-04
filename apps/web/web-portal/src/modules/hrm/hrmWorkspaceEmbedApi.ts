import type { HrmInsuranceApiRow, HrmOperationsSummary } from './hrmApiClient';

export type HrmInsuranceEmbedRow = {
  id: string;
  ref: string;
  employee: string;
  regime: string;
  period: string;
  sync: string;
};

/** BR-INS-01 — map Nest insurance list to embed cockpit columns (social_insurance_number from BE-02). */
export function mapHrmInsuranceEmbedRows(rows: HrmInsuranceApiRow[]): HrmInsuranceEmbedRow[] {
  return rows.map((r) => {
    const bhxh =
      r.social_insurance_number?.trim() ||
      r.policy_number?.trim() ||
      '';
    const employeeLabel =
      [r.employee_code?.trim(), r.employee_name?.trim()].filter(Boolean).join(' · ') ||
      r.employee_id ||
      '—';
    return {
      id: r.id,
      ref: bhxh || r.id.slice(0, 8),
      employee: employeeLabel,
      regime: r.provider?.trim() || 'BHXH',
      period: r.effective_date?.trim() || r.expiry_date || '—',
      sync: r.status ?? '—',
    };
  });
}

export type HrmDashboardStatRow = { label: string; value: string };

/** UC-HRM-20 — map Nest operations summary + employee list to cockpit stats. */
export function mapHrmDashboardStats(
  employeeCount: number | null,
  activeCount: number | null,
  summary: HrmOperationsSummary | null,
): HrmDashboardStatRow[] {
  return [
    { label: 'Tổng nhân sự', value: employeeCount != null ? String(employeeCount) : '—' },
    { label: 'Đang làm việc', value: activeCount != null ? String(activeCount) : '—' },
    { label: 'Bản ghi chấm công', value: summary ? String(summary.attendance_records) : '—' },
    { label: 'TT tuyển dụng', value: summary ? String(summary.job_requisitions) : '—' },
  ];
}

export function shouldLoadMetadataQueue(view: string): boolean {
  return view === 'dashboard' || view === 'employees' || view === 'decisions';
}
