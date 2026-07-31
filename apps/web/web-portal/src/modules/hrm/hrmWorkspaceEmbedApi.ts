/**
 * @CODE-MEMORY
 * Screen:     /command-center/hrm/:view — HrmWorkspacePanel embed mappers (Group CEO)
 * UC:         UC-HRM-20, UC-HRM-24, UC-HRM-25, UC-HRM-26
 * BR:         BR-MOCK-01, BR-MOCK-02, BR-INS-01, BR-EXEC-01b
 * SRS:        docs/hrm/SRS.md §13 (Portal embed HrmWorkspacePanel)
 * TechSpec:   docs/hrm/TECHSPEC.md §11.2–11.3 (Anti-mock policy)
 * Purpose:    Pure mappers from Nest HRM list/summary payloads to CC cockpit columns.
 *             Never invent demo amounts or mock catalog rows.
 * WorkItem:   PCOMP-W2-FE-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - modules/hrm/HrmWorkspacePanel.tsx → mapHrmDashboardStats / mapHrmDashboardPayrollSummary / mapHrmInsuranceEmbedRows
 *
 * Callees:
 *   - types only from hrmApiClient (HrmPayslipApiRow, HrmInsuranceApiRow, HrmOperationsSummary)
 *
 * FE-Actions:
 *   | User action        | Handler                         | Lib / RPC                                      |
 *   |--------------------|---------------------------------|------------------------------------------------|
 *   | Open dashboard     | HrmWorkspacePanel load effect   | listHrmPayslips → mapHrmDashboardPayrollSummary |
 *   | Open insurance tab | HrmWorkspacePanel load effect   | listHrmInsurance → mapHrmInsuranceEmbedRows     |
 *
 * BE-Chain: N/A (FE mapper)
 * Impact:   Fake payroll KPI on dashboard if mapper returns invented numbers
 * must_keep: empty/null → em-dash or hasData=false; no HRM_MOCK_* / static tỷ ₫
 * SOLID:    SRP — embed mapping only; panel owns fetch/UI
 * LastVerified: hrmWorkspaceEmbedApi.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: PCOMP-W2-FE-01
 * What: Added mapHrmDashboardPayrollSummary from payslip API rows
 * Why: Close residual static «299 tỷ ₫» fiction on dashboard payroll card
 * SRS/BR: UC-HRM-20 · BR-MOCK-01 · BR-EXEC-01b
 */
import type { HrmInsuranceApiRow, HrmOperationsSummary, HrmPayslipApiRow } from './hrmApiClient';

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

export type HrmDashboardPayrollSummary = {
  hasData: boolean;
  periodLabel: string;
  statusLabel: string;
  grossFormatted: string;
  deductionsFormatted: string;
  netFormatted: string;
  payslipCount: number;
};

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

/**
 * UC-HRM-20 / UC-HRM-24 — aggregate payslip list for dashboard payroll card.
 * BR-MOCK-01: null/empty → hasData=false (honest empty); never invent tỷ ₫ fiction.
 * Payslip API has no tax/BHXH split — surface gross / deductions / net only.
 */
export function mapHrmDashboardPayrollSummary(
  payslips: HrmPayslipApiRow[] | null,
): HrmDashboardPayrollSummary {
  if (!payslips?.length) {
    return {
      hasData: false,
      periodLabel: '—',
      statusLabel: 'Chưa có phiếu lương',
      grossFormatted: '—',
      deductionsFormatted: '—',
      netFormatted: '—',
      payslipCount: 0,
    };
  }

  let gross = 0;
  let deductions = 0;
  let net = 0;
  const periodCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();

  for (const row of payslips) {
    gross += row.gross_amount ?? 0;
    deductions += row.deduction_amount ?? 0;
    net += row.net_amount ?? 0;
    const period = row.period_label?.trim() || '—';
    periodCounts.set(period, (periodCounts.get(period) ?? 0) + 1);
    const status = row.status?.trim() || '—';
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const topPeriod =
    [...periodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const topStatus =
    [...statusCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return {
    hasData: true,
    periodLabel: topPeriod,
    statusLabel: topStatus,
    grossFormatted: formatVnd(gross),
    deductionsFormatted: formatVnd(deductions),
    netFormatted: formatVnd(net),
    payslipCount: payslips.length,
  };
}

export function shouldLoadMetadataQueue(view: string): boolean {
  return view === 'dashboard' || view === 'employees' || view === 'decisions';
}

/** Views with no live cockpit list API — show API_NOT_AVAILABLE notice only here. */
export function isHrmCockpitApiDeferredView(view: string): boolean {
  return ['hrm_ai', 'processes', 'tools_equipment', 'guide', 'settings', 'performance'].includes(
    view,
  );
}

/** F6 normative funnel stages (CUSTOMER_DEMO_HRM_DELTA §6.3). */
export const HRM_RECRUIT_FUNNEL_STAGES = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export type HrmRecruitFunnelStage = (typeof HRM_RECRUIT_FUNNEL_STAGES)[number];

export const HRM_RECRUIT_FUNNEL_LABEL_VI: Record<HrmRecruitFunnelStage, string> = {
  new: 'Chờ CV / Mới',
  screening: 'Sàng lọc',
  interview: 'Phỏng vấn',
  offer: 'Đề nghị',
  hired: 'Đã tuyển',
  rejected: 'Từ chối',
};

export type HrmRecruitFunnelCounts = Record<HrmRecruitFunnelStage, number> & { total: number };

export function mapHrmRecruitFunnelStage(raw: string | null | undefined): HrmRecruitFunnelStage {
  const stage = (raw ?? '').trim().toLowerCase();
  if (stage === 'applied' || stage === 'new' || stage === '') return 'new';
  if (stage === 'screening') return 'screening';
  if (stage === 'interview') return 'interview';
  if (stage === 'offer') return 'offer';
  if (stage === 'hired') return 'hired';
  if (stage === 'rejected') return 'rejected';
  return 'new';
}

/** UC-HRM-22 / AC-CD-F6-03 — aggregate live candidates-pool stages (no mock). */
export function mapHrmRecruitmentFunnelCounts(
  rows: Array<{ stage?: string | null }> | null | undefined,
): HrmRecruitFunnelCounts {
  const counts: HrmRecruitFunnelCounts = {
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
    total: 0,
  };
  for (const row of rows ?? []) {
    const key = mapHrmRecruitFunnelStage(row.stage);
    counts[key] += 1;
    counts.total += 1;
  }
  return counts;
}
