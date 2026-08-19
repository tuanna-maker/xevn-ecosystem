/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → BH tab — timeline actions (CORE-10)
 * UC:         FR-UC-BP-CORE-10 · AC-SI-TL-01..05
 * BR:         Action set close|stop|suspend|change_rate|resume — no FE invent formulas
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.5
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-SI-02/03
 *             DB-01: docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md action→status map
 * Purpose:    Pure UI helpers — allowed actions by status; build POST body pass-through.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    EmployeeInsurance.tsx · InsuranceTimelineActionsPanel · vitest
 * Callees:    none (no payroll/rate formulas)
 * FEActions:  Đóng/Ngừng/Tạm hoãn/Đổi mức/Tiếp tục → POST actions → F5 periods
 * BEChain:    POST /api/hrm/employee-insurances/:id/actions → append rate period
 * Impact:     FE tính %/công thức → vi phạm OS 28; silent overwrite UI → AC-SI-TL FAIL
 * must_keep:  Action vocab 1:1 SA; display-ready periods only; U65 no seed
 * SOLID:      Pure contract helpers; UI mounts separately
 * LastVerified: apps/web/hrm/src/lib/insuranceTimelineActions.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-04
 * change_mode: FIX
 * What: POST body includes company_id; change_rate → employee_amount/employer_amount; notes → change_reason
 * Why: R-EMP-SI-ACTION-COMPANY-ID-BODY — InsuranceActionDto requires body company_id (query-only → 400 HRM-VAL-001)
 * must_keep: Action vocab 1:1; display-ready periods; no FE formulas; FE-03 HDSD testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-EMP-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: formatInsurancePeriodDateVi — periods effective_from/to → dd/MM/yyyy (no ISO leak on SI surface)
 * Why: OBS-SI-DATE-ISO — soft OBS on stop/periods card after F5
 * must_keep: body company_id D5 sealed; action vocab; no FE formulas; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: mapInsurancePeriods → statusLabelVi FE-derive (R-CORE-10-DISP); amountLabelVi; no Nest /core
 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-10 · prefer FE derive · HOLD schema invent
 * must_keep: Action vocab 1:1; body company_id; dd/MM/yyyy; CORE-09/07 seals; U65; honesty false
 */

import { formatDisplayDate } from '@/lib/formatDisplayDate';
import {
  formatInsuranceAmountVi,
  resolveInsurancePeriodStatusLabelVi,
} from '@/lib/empCoreSiRing';

export const INSURANCE_TIMELINE_ACTIONS = [
  'close',
  'stop',
  'suspend',
  'change_rate',
  'resume',
] as const;

export type InsuranceTimelineAction = (typeof INSURANCE_TIMELINE_ACTIONS)[number];

export type InsuranceEnrollmentStatus =
  | 'active'
  | 'pending'
  | 'expired'
  | 'suspended'
  | 'stopped'
  | 'closed';

/** DB-01 / SA locked action → enrollment.status (UI preview only — BE is SoT). */
export const ACTION_TO_ENROLLMENT_STATUS: Record<
  InsuranceTimelineAction,
  InsuranceEnrollmentStatus | 'keep_active'
> = {
  close: 'closed',
  stop: 'stopped',
  suspend: 'suspended',
  change_rate: 'keep_active',
  resume: 'active',
};

export const INSURANCE_ACTION_LABELS_VI: Record<InsuranceTimelineAction, string> = {
  close: 'Đóng',
  stop: 'Ngừng',
  suspend: 'Tạm hoãn',
  change_rate: 'Đổi mức',
  resume: 'Tiếp tục',
};

export function isInsuranceTimelineAction(value: string): value is InsuranceTimelineAction {
  return (INSURANCE_TIMELINE_ACTIONS as readonly string[]).includes(value);
}

/**
 * Allowed actions by current enrollment status — UI enablement only.
 * change_rate while suspended does NOT auto-resume (resume is separate).
 */
export function allowedInsuranceActionsForStatus(
  status: string | null | undefined,
): InsuranceTimelineAction[] {
  const s = (status ?? 'active').trim().toLowerCase();
  switch (s) {
    case 'active':
    case 'pending':
      return ['close', 'stop', 'suspend', 'change_rate'];
    case 'suspended':
      return ['resume', 'change_rate', 'close', 'stop'];
    case 'stopped':
    case 'closed':
    case 'expired':
      return [];
    default:
      return ['close', 'stop', 'suspend', 'change_rate'];
  }
}

/** Aligns InsuranceActionDto — company_id in JSON body (not query-only). */
export type InsuranceActionRequestBody = {
  company_id: string;
  action: InsuranceTimelineAction;
  effective_from: string;
  suspend_reason?: string;
  /** Pass-through amounts — BE owns formulas / period append (DTO field names). */
  employee_amount?: number;
  employer_amount?: number;
  change_reason?: string;
};

export type BuildInsuranceActionBodyResult =
  | { ok: true; body: InsuranceActionRequestBody }
  | { ok: false; message: string };

export function buildInsuranceActionBody(input: {
  company_id: string;
  action: string;
  effective_from: string;
  suspend_reason?: string;
  /** Form aliases — mapped to employee_amount / employer_amount on wire. */
  contribution?: number;
  employer_contribution?: number;
  employee_amount?: number;
  employer_amount?: number;
  notes?: string;
  change_reason?: string;
}): BuildInsuranceActionBodyResult {
  const companyId = (input.company_id ?? '').trim();
  if (!companyId) {
    return { ok: false, message: 'Thiếu phạm vi công ty (company_id) cho thao tác bảo hiểm.' };
  }
  if (!isInsuranceTimelineAction(input.action)) {
    return { ok: false, message: 'Loại thao tác bảo hiểm không hợp lệ.' };
  }
  const effective = (input.effective_from ?? '').trim();
  if (!effective) {
    return { ok: false, message: 'Chọn ngày hiệu lực thao tác.' };
  }
  if (input.action === 'suspend' && !(input.suspend_reason ?? '').trim()) {
    return { ok: false, message: 'Tạm hoãn cần nhập lý do.' };
  }
  const employeeAmount = input.employee_amount ?? input.contribution;
  const employerAmount = input.employer_amount ?? input.employer_contribution;
  if (input.action === 'change_rate') {
    if (
      employeeAmount == null ||
      Number.isNaN(Number(employeeAmount)) ||
      employerAmount == null ||
      Number.isNaN(Number(employerAmount))
    ) {
      return { ok: false, message: 'Đổi mức cần nhập mức đóng NV và DN (BE ghi period mới).' };
    }
  }

  const body: InsuranceActionRequestBody = {
    company_id: companyId,
    action: input.action,
    effective_from: effective,
  };
  if (input.action === 'suspend') {
    body.suspend_reason = (input.suspend_reason ?? '').trim();
  }
  if (input.action === 'change_rate') {
    body.employee_amount = Number(employeeAmount);
    body.employer_amount = Number(employerAmount);
  }
  const reason = (input.change_reason ?? input.notes ?? '').trim();
  if (reason) {
    body.change_reason = reason;
  }
  return { ok: true, body };
}

export type InsuranceRatePeriodDisplay = {
  id: string;
  effective_from: string;
  effective_to: string | null;
  period_status: string;
  /** R-CORE-10-DISP — FE-derive when BE omits statusLabelVi. */
  statusLabelVi: string;
  contribution?: number | null;
  employer_contribution?: number | null;
  /** vi-VN display amounts — no PAY formula invent. */
  contributionLabelVi?: string;
  employerContributionLabelVi?: string;
  suspend_reason?: string | null;
};

/** Map display-ready periods[] from BE — never invent rates / PAY engine. */
export function mapInsurancePeriods(
  raw: unknown,
): InsuranceRatePeriodDisplay[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row): InsuranceRatePeriodDisplay | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = String(r.id ?? '').trim();
      const effective_from = String(r.effective_from ?? r.start_date ?? '').trim();
      if (!id || !effective_from) return null;
      const contributionRaw = r.contribution ?? r.employee_amount;
      const employerRaw = r.employer_contribution ?? r.employer_amount;
      const period_status = String(r.period_status ?? r.status ?? 'applying');
      const beLabel =
        (r.statusLabelVi as string | null | undefined) ??
        (r.status_label_vi as string | null | undefined) ??
        null;
      const contribution =
        contributionRaw == null ? null : Number(contributionRaw);
      const employer_contribution =
        employerRaw == null ? null : Number(employerRaw);
      const suspendRaw = r.suspend_reason ?? r.suspendReason;
      return {
        id,
        effective_from,
        effective_to:
          r.effective_to == null && r.end_date == null
            ? null
            : String(r.effective_to ?? r.end_date ?? '').trim() || null,
        period_status,
        statusLabelVi: resolveInsurancePeriodStatusLabelVi(period_status, beLabel),
        contribution,
        employer_contribution,
        contributionLabelVi: formatInsuranceAmountVi(contribution),
        employerContributionLabelVi: formatInsuranceAmountVi(employer_contribution),
        suspend_reason:
          suspendRaw == null ? null : String(suspendRaw).trim() || null,
      };
    })
    .filter((p): p is InsuranceRatePeriodDisplay => p != null);
}

/**
 * SI period / card date display — vi-VN dd/MM/yyyy; never leak raw ISO on surface.
 * Wire payload keeps yyyy-MM-dd; only presentation uses this helper.
 */
export function formatInsurancePeriodDateVi(
  value: string | null | undefined,
): string {
  if (value == null || !String(value).trim()) return '—';
  return formatDisplayDate(String(value).trim());
}
