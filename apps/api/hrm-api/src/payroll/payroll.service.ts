/**
 * @CODE-MEMORY
 * Screen:     HRM → Phiếu lương / kỳ lương (service)
 * UC:         UC-HRM-24 · UC-HRM-28 · HRM-PR-05
 * BR:         workforce scope filter khi group CEO main
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.6 · FR-HRM-PR-05
 * SRS bước:   Diễn biến #4 Tải phiếu · #5 Empty · #6 Vượt phạm vi
 * TechSpec:   docs/hrm/TECHSPEC.md §14.6 (ref_srs: FR-HRM-PR-05)
 * Purpose:    List phiếu theo scope (+ periods process upstream); W1 FR là đọc.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    payroll.controller.ts → listPayslips
 * Callees:    resolveHrmListScope · pushWorkforceEmployeeScopeFilter → payroll_payslips
 * must_keep:  empty list OK; J-MOB-04 company_uuid↔holding slug
 * SOLID:      Service owns SQL scope
 * LastVerified: payroll.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01
 * change_mode: FIX
 * What: hasClosedAttendanceSheet — same calendar month as payroll period start_date; company probe scoped to period OU (main↔holding), not group rollup slugs
 * must_keep: soft-delete · JWT scope · HRM_PAY_REQUIRE_CLOSED_TIMESHEET env gate
 * SRS: FR-UC-BP-ATT-11 · BR-BP-TS-02 · FR-HRM-PR-05
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-E2E-LINK-PAY-HIRE-BE-03
 * change_mode: FIX
 * What: create maps main→holding via resolveHrmPersistCompanyIdText; list/get use expandPayrollPeriodCompanyIds (legacy main rows)
 * must_keep: soft-delete · JWT scope · FE enroll body without company_id
 * SRS: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.6 · FR-HRM-PR-05
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến PR-05 trên listPayslips
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
 * change_mode: ADD
 * What: Period create may bind paySheetTemplateId via PaySheetTemplateService (snapshot cols) — pack salary-templates unchanged
 * must_keep: enroll pack ≠ mẫu · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * change_mode: ADD
 * What: PROCESS binds published formula → evaluate gd1_eval_v1 → payroll_payslip_lines; FORMULA-412 if missing/opaque; cấm silent zero UAT
 * must_keep: ATT-412 closed sheet · payroll_e2e_ready=false · cấm catalog formula TEXT engine · cấm invent template HTTP merge
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01
 * change_mode: ADD
 * What: PROCESS success path depends on CORE C&B bag (base_salary) via evaluateBoundFormula — no silent 0₫
 * must_keep: VARS-412 honest when C&B absent · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01
 * change_mode: ADD
 * What: F-PAY-PAYSLIP-01 GET payslip by id + lines — same resolveHrmListScope as listPayslips (U19)
 * must_keep: 404 scope miss · soft-delete parent CASCADE · payroll_e2e_ready=false · cấm invent LIVE
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-ESS-BE-01
 * change_mode: ADD
 * What: F-PAY-PAYSLIP-01 ESS /me/payslips read + employee confirm workflow (AMIS step6 GĐ1)
 * must_keep: token employee_id only · 403 cross-employee · payroll_e2e_ready=false · cấm flip LIVE
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01
 * change_mode: ADD
 * What: closePayrollPeriod requires all payslips paid (HRM-PAY-005) after wire+process spine
 * must_keep: processed gate HRM-PAY-004 · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-SRC-BE-01
 * change_mode: ADD
 * What: PROCESS per-component SRC resolver (Emp→Period→Template→Catalog) via processEmployeePayslipViaSrc
 * must_keep: ATT-412 · payroll_e2e_ready=false · cấm Nest % fallback · source_tier on payslip lines
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02
 * change_mode: FIX / ADD
 * What: eligibility employee filter main↔holding (expandPayrollAttendanceSheetCompanyIds) — cấm silent items=[]; ADD POST advance-request employees
 * Why: R-PAY-SRC-03-PROCESS · R-PAY-ADV-EMP-API-ABSENT
 * must_keep: ATT-412 closed sheet · payroll_e2e_ready=false · U65 zero-seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02
 * change_mode: FIX
 * What: listPayrollPeriods SELECT + mapPeriod expose pay_sheet_template_id + sheet_template_snapshot_json (R-PAY-PERIOD-LIST-TPL)
 * must_keep: POST create bind fields survive list refetch · get-by-id same mapPeriod · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02
 * change_mode: FIX
 * What: GET payslip lines SELECT+map expose source_tier (AC-PAY-SRC-GET-TIER) after SRC process write
 * must_keep: ATT-412 default · payroll_e2e_ready=false · emp_cb short-circuit
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01
 * change_mode: FIX
 * What: mapPayslipLine always emits source_tier (resolvePayslipLineSourceTier) — never omit when ref known
 * Why:  R-PAY-SRC-TIER-FIELD QA residual — GET had source_ref emp_cb:* without source_tier key
 * must_keep: SELECT source_tier · derive from source_ref when column NULL · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-BE-01
 * change_mode: ADD
 * What: GET list/get periods expose display-ready total_gross/total_net (+ payslip_summary) from SUM(payroll_payslips) — same rollup as PROCESS
 * Why:  R-PAY-PERIOD-LIST-TOTALS — list columns must not FE-aggregate
 * must_keep: process-post GWC · period-bind GWC · summary-cards FE · soft-delete · scope_parity · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01
 * change_mode: FIX
 * What: assertPayrollAttHourBoundaryLocked trước process — HRM-PAY-BOUNDARY-403 (R-PAY-01-BOUNDARY)
 * Why:  API-01 §4.11 GAP — cấm leave/OT HTTP cho biến giờ; RETAIN ATT-412 + NO_CLOSED_SHEET
 * SRS:  FR-UC-BP-PAY-01 Diễn biến FAIL cross-read · BR-BP-TS-03 · AC-PAY-01-BOUNDARY
 * must_keep: ATT12QC1+ATT11QC1 · payroll_e2e_ready=false · C-SLICE · ≠ PAY-01 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-02-CLUSTER-BE-01
 * change_mode: FIX (RETAIN cite + jest regression)
 * What: processPayrollPeriod — HRM-PAY-ATT-412 trước resolvePublishedFormulaForProcess (AC-PAY-02-PROCESS-ORDER)
 * SRS:  FR-UC-BP-PAY-02 Diễn biến #3 · peer PAY-01 must_keep PAY01QC1
 * must_keep: gd1_eval_v1 · FORMULA-412 family · payroll_e2e_ready=false · C-SLICE · ≠ PAY-02 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-PAY-SPLIT-01 inside processPayrollPeriod · payroll_payslip_split_segments · GET segments[] · HRM-PAY-SPLIT-409
 * SRS:  FR-UC-BP-PAY-04 · API-01 §4.1 S1–S5
 * must_keep: PAY01QC1 · PAY02QC1 process order · payroll_e2e_ready=false · C-SLICE · ≠ PAY-04 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-PAY-TNCN-01 after F-PAY-SI-CEILING-01 · tax_amount header · HRM-PAY-TAX-403 · progressive_vn_v1
 * SRS:  FR-UC-BP-PAY-06 · API-01 §4.4–4.5 step 9
 * must_keep: PAY01..05 order · payroll_e2e_ready=false · C-SLICE · ≠ PAY-06 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02
 * change_mode: FIX
 * What: period list/get queryPeriodInScope — qualify payroll_periods.id/company_id/status when JOIN pay_payroll_group (fix HRM-SYS-001 ambiguous column)
 * must_keep: PAY01..08 QC seals · periodGroupJoinSql · payroll_e2e_ready=false · C-SLICE · ≠ PAY-09 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: HRM-MVP-GD1-PAY-09-CLUSTER-01
 * change_mode: FIX (consolidate)
 * What: display-ready payroll_group_* on period/payslip mappers · scope parity list↔get · eligibility/payslip filters — no FE aggregate
 * solid_convention_ack: Logic nhóm lương + snapshot ở PayrollService/PayPayrollGroupService; scope resolver chung U19; FE chỉ bind DTO
 * must_keep: BE-02 qualified SQL · members event_date · PAY01..08QC · payroll_e2e_ready=false
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import {
  assertResourceInHrmScope,
  expandPayrollAttendanceSheetCompanyIds,
  expandPayrollPeriodCompanyIds,
  HrmListScope,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushEmployeeListScopeFilters,
  pushHrmTableScopeFilters,
  pushPayrollPeriodScopeFilters,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
} from '../common/hrm-list-scope';
import { ensureHrmTenantIdColumns } from '../common/hrm-tenant-scope-schema';
import { HrmDbService } from '../db/hrm-db.service';
import { ensureAttendanceSheetSchema } from '../attendance/attendance-sheet-schema.bootstrap';
import { assertPayrollAttHourBoundaryLocked } from './pay-att-hour-boundary';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import {
  CreatePayrollEnrollDto,
  PayrollEnrollMode,
} from './dto/create-payroll-enroll.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';
import { HRM_PAY_FORMULA_412 } from './pay-formula.constants';
import { PayFormulaService } from './pay-formula.service';
import { PayPeriodInputPackService } from './pay-period-input-pack.service';
import { hasActiveTimesheetBindForPeriod } from './pay-period-bind-resolver';
import { resolvePayslipLineSourceTier } from './pay-src-resolver';
import { HRM_PAY_SPLIT_409 } from './pay-payslip-split.constants';
import {
  ensurePayPayslipSplitSegmentsSchema,
  PayPayslipSplitService,
} from './pay-payslip-split.service';
import { assertNoPayGtgcOverrideInBody } from './pay-gtgc-guard';
import { HRM_PAY_GTCG_412 } from './pay-gtgc.constants';
import { ensurePayGtgcStatutoryCfgSchema } from './pay-gtgc-statutory-cfg';
import {
  ensurePayrollPayslipsGtgcColumn,
  resolvePayGtgcForEmployee,
} from './pay-gtgc-resolver';
import { assertNoPaySiOverrideInBody } from './pay-si-ceiling-guard';
import { assertNoPayTaxOverrideInBody } from './pay-tax-guard';
import { HRM_SET_SI_412_MISSING } from '../settings/settings-defaults.constants';
import { SettingsTaxParamsService } from '../settings/settings-tax-params.service';
import {
  applyPaySiCeilingForEmployee,
  ensurePayrollPayslipsSiColumns,
  persistPaySiCeilingOnPayslip,
} from './pay-si-ceiling-resolver';
import {
  computePayTncnBreakdown,
  ensurePayrollPayslipsTaxColumn,
  loadPayTaxProcessContext,
  persistPayTncnOnPayslip,
  type PayTaxProcessContext,
} from './pay-tncn-resolver';
import {
  ensurePayTerminationSettlementSchema,
  ensurePayrollPayslipsFinalPayColumns,
} from './pay-termination-settlement.schema';
import { PayTerminationService } from './pay-termination.service';
import {
  assertNoIncludeTerminationsSettleSoT,
  assertNoPayTermPayoutOverrideInBody,
} from './pay-term-guard';
import { assertNoPayPayslipAmountOverrideInBody } from './pay-payslip-guard';
import {
  HRM_PAY_LOCK_409,
  HRM_PAY_PUBLISH_409,
  PAY_PAYSLIP_PAYMENT_STATUSES,
  type PayPayslipPaymentStatus,
} from './pay-payslip.constants';
import { ensurePayPayslipLifecycleSchema } from './pay-payslip-lifecycle.schema';
import { PayPayrollGroupService } from './pay-payroll-group.service';
import { HRM_PAY_GROUP_409 } from './pay-payroll-group.constants';
import type { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';
import {
  isPayslipCalculatedReady,
  isPeriodPayrollLocked,
  mapPayslipStatusForApi,
  paymentStatusLabelVi,
} from './pay-payslip-lifecycle.helpers';
import type { PatchPayslipPaymentStatusDto } from './dto/patch-payslip-payment-status.dto';
import type { PublishPayslipDto } from './dto/publish-payslip.dto';
import type { VoidPayslipDto } from './dto/void-payslip.dto';
import type { TerminationSettleDto } from './dto/termination-settle.dto';
import type { PaySrcResolvedLine } from './pay-src-resolver';

type PayrollPayslipRow = {
  id: string;
  company_id: string;
  period_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: string;
  deduction_amount: string;
  net_amount: string;
  currency: string;
  status: string;
  formula_definition_id?: string | null;
  employee_confirmed_at?: string | null;
  employee_confirmed_by?: string | null;
  gtgc_amount?: string | null;
  si_employee_amount?: string | null;
  si_employer_amount?: string | null;
  tax_amount?: string | null;
  is_final_pay?: boolean | null;
  termination_settlement_id?: string | null;
  settlement_status?: string | null;
  payment_status?: string | null;
  published_to_ess?: boolean | null;
  published_at?: string | null;
  published_by?: string | null;
  version?: number | null;
  payroll_group_id?: string | null;
  payroll_group_code?: string | null;
  payroll_group_name_vi?: string | null;
  created_at: string;
  updated_at: string;
};

const ESS_EMPLOYEE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PayrollPeriodRow = {
  id: string;
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'processed' | 'closed';
  payroll_locked?: boolean | null;
  created_by: string | null;
  processed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  employee_count?: string;
  /** Display-ready rollup from payroll_payslips (PROCESS payslip_summary SoT). */
  total_gross?: string;
  total_deduction?: string;
  total_net?: string;
  formula_definition_id?: string | null;
  pay_sheet_template_id?: string | null;
  sheet_template_snapshot_json?: unknown;
  payroll_group_id?: string | null;
  payroll_group_code?: string | null;
  payroll_group_name_vi?: string | null;
};

/** Correlated / LATERAL payslip rollup — reuse PROCESS SUM(gross/net) SoT (R-PAY-PERIOD-LIST-TOTALS). */
const PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL = `
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::text AS employee_count,
      COALESCE(SUM(ps.gross_amount), 0)::text AS total_gross,
      COALESCE(SUM(ps.deduction_amount), 0)::text AS total_deduction,
      COALESCE(SUM(ps.net_amount), 0)::text AS total_net
    FROM public.payroll_payslips ps
    WHERE ps.period_id = payroll_periods.id
  ) pay_tot ON TRUE
`;

type PayrollEmployeeEligibilityItem = {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  hire_date: string | null;
  eligible: boolean;
  reasons: string[];
};

import { SettingsPayrollParamsService } from '../settings/settings-payroll-params.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly db: HrmDbService,
    private readonly payFormulas: PayFormulaService,
    private readonly payInputPack: PayPeriodInputPackService,
    private readonly settingsTaxParams: SettingsTaxParamsService,
    private readonly payPayrollGroups: PayPayrollGroupService,
    private readonly payrollParams: SettingsPayrollParamsService,
  ) {}

  private payPayslipSplit(): PayPayslipSplitService {
    return new PayPayslipSplitService(this.db, this.payFormulas);
  }

  private payTermination(): PayTerminationService {
    return new PayTerminationService(this.db);
  }

  private isRequireClosedTimesheet(): boolean {
    const raw = (process.env.HRM_PAY_REQUIRE_CLOSED_TIMESHEET ?? '')
      .trim()
      .toLowerCase();
    if (!raw) {
      return true;
    }
    return !['0', 'false', 'no', 'off'].includes(raw);
  }

  private async hasClosedAttendanceSheet(
    period: Pick<
      PayrollPeriodRow,
      'id' | 'company_id' | 'start_date' | 'end_date'
    >,
  ): Promise<boolean> {
    await ensureAttendanceSheetSchema(this.db);
    await this.payInputPack.ensureSchema();
    const bound = await hasActiveTimesheetBindForPeriod(this.db, period.id);
    if (bound) {
      return true;
    }
    const companyIds = expandPayrollAttendanceSheetCompanyIds(
      period.company_id,
    );
    const res = await this.db.query<{ has_closed: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1
          FROM public.attendance_sheets s
          WHERE s.company_id = ANY($1::text[])
            AND s.status = 'closed'
            AND date_trunc('month', s.start_date::timestamp) = date_trunc('month', $2::date::timestamp)
        ) AS has_closed;
      `,
      [companyIds, period.start_date],
    );
    return Boolean(res.rows[0]?.has_closed);
  }

  private async loadPayrollEligibility(
    period: PayrollPeriodRow,
    scope: ReturnType<typeof resolveHrmListScope>,
    authorization?: string,
    filterPayrollGroupId?: string | null,
  ): Promise<{
    require_closed_timesheet: boolean;
    has_closed_sheet: boolean;
    eligible_count: number;
    ineligible_count: number;
    items: PayrollEmployeeEligibilityItem[];
  }> {
    const requireClosedTimesheet = this.isRequireClosedTimesheet();
    const hasClosedSheet = requireClosedTimesheet
      ? await this.hasClosedAttendanceSheet(period)
      : true;
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    // RBAC scope (group rollup / member) ∩ period OU (main↔holding) — legacy period.company_id=main
    // must not force exact `company_id = 'main'` (employees live under holding) → silent items[].
    pushEmployeeListScopeFilters(filters, values, scope);
    const periodOuCompanyIds = expandPayrollAttendanceSheetCompanyIds(
      period.company_id,
    );
    pushCompanyIdFilter(filters, values, periodOuCompanyIds);
    const employeesRes = await this.db.query<{
      id: string;
      employee_code: string;
      full_name: string;
      status: string;
      hired_at: string | null;
    }>(
      `
        SELECT id, employee_code, full_name, status, hired_at::text AS hired_at
        FROM public.employees
        WHERE ${filters.join(' AND ')}
        ORDER BY employee_code ASC, id ASC;
      `,
      values,
    );
    const items = employeesRes.rows.map<PayrollEmployeeEligibilityItem>(
      (row) => {
        const reasons: string[] = [];
        const isActive = row.status === 'active';
        if (!isActive) {
          reasons.push('NOT_ACTIVE');
        }
        if (!hasClosedSheet) {
          reasons.push('NO_CLOSED_SHEET');
        }
        const hiredAt = row.hired_at ? new Date(row.hired_at) : null;
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);
        if (hiredAt && hiredAt >= periodStart && hiredAt <= periodEnd) {
          reasons.push('HIRE_MID_MONTH');
        }
        return {
          employee_id: row.id,
          employee_code: row.employee_code,
          employee_name: row.full_name,
          hire_date: row.hired_at,
          eligible: isActive && hasClosedSheet,
          reasons,
        };
      },
    );
    const targetGroupId =
      filterPayrollGroupId ?? period.payroll_group_id ?? null;
    let filteredItems = items;
    if (targetGroupId) {
      const memberIds =
        await this.payPayrollGroups.resolveMemberEmployeeIdsForGroup(
          targetGroupId,
          period.company_id,
          authorization,
          scope,
        );
      const memberSet = new Set(memberIds);
      filteredItems = items.filter((item) => memberSet.has(item.employee_id));
    }
    const eligibleCount = filteredItems.filter((item) => item.eligible).length;
    return {
      require_closed_timesheet: requireClosedTimesheet,
      has_closed_sheet: hasClosedSheet,
      eligible_count: eligibleCount,
      ineligible_count: filteredItems.length - eligibleCount,
      items: filteredItems,
    };
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payroll_periods (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        period_label TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NULL,
        processed_at TIMESTAMPTZ NULL,
        closed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_payroll_status CHECK (status IN ('draft', 'processed', 'closed')),
        CONSTRAINT chk_payroll_date_range CHECK (start_date <= end_date)
      );
    `);
    try {
      await this.db.query(`
        ALTER TABLE public.payroll_periods
        ALTER COLUMN company_id TYPE TEXT USING company_id::text;
      `);
    } catch {
      /* already text */
    }
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_period_company_date_range
      ON public.payroll_periods (company_id, start_date, end_date);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.payroll_payslips (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        deduction_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'VND',
        status TEXT NOT NULL DEFAULT 'processed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_payslip_status CHECK (status IN ('draft', 'processed', 'paid'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_period_employee
      ON public.payroll_payslips (period_id, employee_id);
    `);
    await this.db.query(`
      ALTER TABLE public.payroll_payslips
        ADD COLUMN IF NOT EXISTS employee_confirmed_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.payroll_payslips
        ADD COLUMN IF NOT EXISTS employee_confirmed_by UUID NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.advance_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        salary_period TEXT NOT NULL,
        department TEXT,
        position TEXT,
        employee_count INTEGER DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        current_approval_level INTEGER DEFAULT 1,
        approval_steps JSONB,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.advance_request_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        request_id UUID NOT NULL REFERENCES public.advance_requests(id) ON DELETE CASCADE,
        employee_id UUID,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        advance_amount NUMERIC NOT NULL DEFAULT 0,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.payFormulas.ensureSchema();
    await this.payInputPack.ensureSchema();
    await ensurePayPayslipSplitSegmentsSchema(this.db);
    await ensurePayrollPayslipsGtgcColumn(this.db);
    await ensurePayrollPayslipsSiColumns(this.db);
    await ensurePayrollPayslipsTaxColumn(this.db);
    await ensurePayTerminationSettlementSchema(this.db);
    await ensurePayrollPayslipsFinalPayColumns(this.db);
    await ensurePayGtgcStatutoryCfgSchema(this.db);
    await ensurePayPayslipLifecycleSchema(this.db);
    await this.payPayrollGroups.ensureSchema();
    await this.settingsTaxParams.ensureSchema();
    await ensureHrmTenantIdColumns((sql) => this.db.query(sql));
  }

  private periodGroupJoinSql = `
    LEFT JOIN public.pay_payroll_group pg ON pg.id = payroll_periods.payroll_group_id
  `;

  /** Qualify predicates when {@link periodGroupJoinSql} joins pay_payroll_group (also has id/company_id). */
  private pushPayrollPeriodScopeFilter(
    filters: string[],
    values: unknown[],
    scope: HrmListScope,
  ): void {
    if (scope.tenantOnlyMode && scope.tenantIds?.length) {
      pushHrmTableScopeFilters(filters, values, scope, {
        tableAlias: 'payroll_periods',
      });
      return;
    }
    this.pushPayrollPeriodScopeFilter(
      filters,
      values,
      scope,
    );
  }

  private pushPayrollPeriodCompanyIdFilter(
    filters: string[],
    values: unknown[],
    companyIds: string[],
  ): void {
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`payroll_periods.company_id = $${values.length}::text`);
      return;
    }
    values.push(companyIds);
    filters.push(`payroll_periods.company_id = ANY($${values.length}::text[])`);
  }

  private periodGroupSelectSql = `
    payroll_periods.payroll_group_id::text AS payroll_group_id,
    pg.code AS payroll_group_code,
    pg.name_vi AS payroll_group_name_vi,
  `;

  private mapPeriod(row: PayrollPeriodRow) {
    const totalGross = Number(row.total_gross ?? 0);
    const totalDeduction = Number(row.total_deduction ?? 0);
    const totalNet = Number(row.total_net ?? 0);
    return {
      id: row.id,
      company_id: row.company_id,
      period_label: row.period_label,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      created_by: row.created_by,
      processed_at: row.processed_at,
      closed_at: row.closed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      employee_count: Number(row.employee_count ?? 0),
      /** Display-ready — same SUM as PROCESS payslip_summary (R-PAY-PERIOD-LIST-TOTALS). */
      total_gross: totalGross,
      total_deduction: totalDeduction,
      total_net: totalNet,
      payslip_summary: {
        total_gross: totalGross,
        total_deduction: totalDeduction,
        total_net: totalNet,
      },
      formula_definition_id: row.formula_definition_id ?? null,
      /** AC-PAY-TPL-03 — bind fields must survive list/get refetch (R-PAY-PERIOD-LIST-TPL). */
      pay_sheet_template_id: row.pay_sheet_template_id ?? null,
      sheet_template_snapshot_json: row.sheet_template_snapshot_json ?? null,
      payroll_group_id: row.payroll_group_id ?? null,
      payroll_group_code: row.payroll_group_code ?? null,
      payroll_group_name_vi: row.payroll_group_name_vi ?? null,
    };
  }

  private async queryPeriodInScope(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PayrollPeriodRow | undefined> {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['payroll_periods.id = $1::uuid'];
    const values: unknown[] = [periodId];
    this.pushPayrollPeriodScopeFilter(
      filters,
      values,
      scope,
    );
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT
          payroll_periods.id, payroll_periods.company_id, payroll_periods.period_label,
          payroll_periods.start_date, payroll_periods.end_date, payroll_periods.status,
          payroll_periods.payroll_locked,
          payroll_periods.created_by, payroll_periods.processed_at, payroll_periods.closed_at,
          payroll_periods.created_at, payroll_periods.updated_at,
          payroll_periods.formula_definition_id::text AS formula_definition_id,
          payroll_periods.pay_sheet_template_id::text AS pay_sheet_template_id,
          payroll_periods.sheet_template_snapshot_json,
          ${this.periodGroupSelectSql}
          COALESCE(pay_tot.employee_count, '0') AS employee_count,
          COALESCE(pay_tot.total_gross, '0') AS total_gross,
          COALESCE(pay_tot.total_deduction, '0') AS total_deduction,
          COALESCE(pay_tot.total_net, '0') AS total_net
        FROM public.payroll_periods
        ${this.periodGroupJoinSql}
        ${PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL}
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    return res.rows[0];
  }

  async getPeriodById(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const row = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    return this.mapPeriod(row);
  }

  async createPayrollPeriod(
    payload: CreatePayrollPeriodDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    if (
      new Date(payload.start_date).getTime() >
      new Date(payload.end_date).getTime()
    ) {
      throw new ApiException(
        'HRM-PAY-001',
        'start_date must be <= end_date',
        HttpStatus.BAD_REQUEST,
      );
    }

    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
      { tenantId },
    );

    let payrollGroupId: string | null = null;
    if (payload.payroll_group_id) {
      await this.payPayrollGroups.assertActiveGroupForPeriodBind(
        payload.payroll_group_id,
        companyId,
        authorization,
      );
      payrollGroupId = payload.payroll_group_id;
    }

    const overlapRes = await this.db.query<{ id: string }>(
      `
        SELECT id
        FROM public.payroll_periods
        WHERE company_id = $1
          AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
        LIMIT 1;
      `,
      [companyId, payload.start_date, payload.end_date],
    );
    if (overlapRes.rows[0]) {
      throw new ApiException(
        'HRM-PAY-002',
        'Payroll period overlaps with existing period',
        HttpStatus.CONFLICT,
      );
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        INSERT INTO public.payroll_periods (
          id, company_id, period_label, start_date, end_date, status, created_by, payroll_group_id
        ) VALUES ($1, $2, $3, $4::date, $5::date, 'draft', $6, $7::uuid)
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at;
      `,
      [
        randomUUID(),
        companyId,
        payload.period_label.trim(),
        payload.start_date,
        payload.end_date,
        payload.created_by?.trim() ?? null,
        payrollGroupId,
      ],
    );
    const created = res.rows[0];
    const fullPeriod = await this.queryPeriodInScope(
      created.id,
      payload.company_id,
      authorization,
    );
    const binds = payload.timesheetBinds ?? [];
    const boundTimesheetHeaderIds: string[] = [];
    for (const bind of binds) {
      const mapped = await this.payInputPack.createTimesheetBind(
        created.id,
        {
          timesheetHeaderId: bind.timesheetHeaderId,
          transferKind: bind.transferKind,
          note: bind.note,
        },
        payload.company_id,
        authorization,
      );
      boundTimesheetHeaderIds.push(mapped.timesheetHeaderId);
    }
    const mapped = this.mapPeriod(fullPeriod ?? created);
    if (boundTimesheetHeaderIds.length > 0) {
      return { ...mapped, boundTimesheetHeaderIds };
    }
    return mapped;
  }

  async updatePayrollPeriod(
    periodId: string,
    requestedCompanyId: string,
    payload: UpdatePayrollPeriodDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (current.status !== 'draft') {
      throw new ApiException(
        'HRM-PAY-003',
        'Only draft payroll periods can be updated',
        HttpStatus.CONFLICT,
      );
    }
    let payrollGroupId: string | null = current.payroll_group_id ?? null;
    if (payload.payroll_group_id !== undefined) {
      if (payload.payroll_group_id) {
        await this.payPayrollGroups.assertActiveGroupForPeriodBind(
          payload.payroll_group_id,
          current.company_id,
          authorization,
        );
        payrollGroupId = payload.payroll_group_id;
      } else {
        payrollGroupId = null;
      }
    }
    await this.db.query(
      `
        UPDATE public.payroll_periods
        SET payroll_group_id = $2::uuid, updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [periodId, payrollGroupId],
    );
    const row = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    return this.mapPeriod(row!);
  }

  async listPayrollPeriods(
    query: ListPayrollPeriodsQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    this.pushPayrollPeriodScopeFilter(
      filters,
      values,
      scope,
    );
    if (query.status) {
      values.push(query.status);
      filters.push(`payroll_periods.status = $${values.length}`);
    }
    if (query.payroll_group_id) {
      values.push(query.payroll_group_id);
      filters.push(
        `payroll_periods.payroll_group_id = $${values.length}::uuid`,
      );
    }
    const res = await this.db.query<PayrollPeriodRow>(
      `
        SELECT
          payroll_periods.id, payroll_periods.company_id, payroll_periods.period_label,
          payroll_periods.start_date, payroll_periods.end_date, payroll_periods.status,
          payroll_periods.payroll_locked,
          payroll_periods.created_by, payroll_periods.processed_at, payroll_periods.closed_at,
          payroll_periods.created_at, payroll_periods.updated_at,
          payroll_periods.formula_definition_id::text AS formula_definition_id,
          payroll_periods.pay_sheet_template_id::text AS pay_sheet_template_id,
          payroll_periods.sheet_template_snapshot_json,
          ${this.periodGroupSelectSql}
          COALESCE(pay_tot.employee_count, '0') AS employee_count,
          COALESCE(pay_tot.total_gross, '0') AS total_gross,
          COALESCE(pay_tot.total_deduction, '0') AS total_deduction,
          COALESCE(pay_tot.total_net, '0') AS total_net
        FROM public.payroll_periods
        ${this.periodGroupJoinSql}
        ${PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL}
        WHERE ${filters.join(' AND ')}
        ORDER BY payroll_periods.start_date DESC;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => this.mapPeriod(row)),
    };
  }

  async processPayrollPeriod(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
    mutateBody?: Record<string, unknown> | null,
    mutateQuery?: Record<string, unknown> | null,
  ) {
    assertPayrollAttHourBoundaryLocked();
    assertNoPayGtgcOverrideInBody(mutateBody);
    assertNoPaySiOverrideInBody(mutateBody);
    assertNoPayTaxOverrideInBody(mutateBody);
    assertNoPayTermPayoutOverrideInBody(mutateBody ?? null);
    assertNoIncludeTerminationsSettleSoT(
      mutateBody ?? null,
      mutateQuery ?? null,
    );
    await this.ensureSchema();
    await this.payFormulas.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    this.assertPeriodUnlockedForEnrollProcess(current);
    if (current.status !== 'draft') {
      throw new ApiException(
        'HRM-PAY-003',
        'Only draft payroll periods can move to processed',
        HttpStatus.CONFLICT,
      );
    }
    const eligibility = await this.loadPayrollEligibility(
      current,
      scope,
      authorization,
    );
    if (eligibility.require_closed_timesheet && !eligibility.has_closed_sheet) {
      throw new ApiException(
        'HRM-PAY-ATT-412',
        'Attendance sheet must be closed before processing payroll',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const termSvc = this.payTermination();

    const employeeAttrsList =
      await this.payPayrollGroups.loadEmployeeAttrsForCompany(
        current.company_id,
        scope,
      );
    const employeeAttrsMap = new Map(
      employeeAttrsList.map((a) => [a.employee_id, a]),
    );

    const boundFormula =
      await this.payFormulas.resolvePublishedFormulaForProcess({
        companyId: current.company_id,
        periodFormulaDefinitionId: current.formula_definition_id,
        authorization,
      });

    const existingPayslipsRes = await this.db.query<{ total: string }>(
      `
        SELECT COUNT(*)::text AS total
        FROM public.payroll_payslips
        WHERE period_id = $1::uuid;
      `,
      [periodId],
    );
    const existingCount = Number(existingPayslipsRes.rows[0]?.total ?? 0);
    if (existingCount === 0) {
      const autoEligible = eligibility.items.filter((item) => item.eligible);
      if (autoEligible.length === 0) {
        throw new ApiException(
          'HRM-PAY-ENROLL-REQUIRED',
          'No eligible employee to enroll into payroll period',
          HttpStatus.CONFLICT,
        );
      }
      for (const item of autoEligible) {
        await this.upsertPayslip({
          company_id: current.company_id,
          period_id: current.id,
          employee_id: item.employee_id,
          employee_code: item.employee_code,
          employee_name: item.employee_name,
          gross_amount: 0,
          deduction_amount: 0,
          net_amount: 0,
          status: 'draft',
          formula_definition_id: boundFormula.id,
        });
      }
    }

    const payslipRows = await this.db.query<{
      id: string;
      employee_id: string;
      employee_code: string;
      employee_name: string;
      gross_amount: string;
      deduction_amount: string;
      net_amount: string;
    }>(
      `
        SELECT id::text AS id, employee_id, employee_code, employee_name,
               gross_amount::text, deduction_amount::text, net_amount::text
        FROM public.payroll_payslips
        WHERE period_id = $1::uuid;
      `,
      [periodId],
    );
    if (payslipRows.rows.length === 0) {
      throw new ApiException(
        'HRM-PAY-ENROLL-REQUIRED',
        'Payroll period has no enrolled employee',
        HttpStatus.CONFLICT,
      );
    }

    let processPayslipRows = payslipRows.rows;
    if (current.payroll_group_id) {
      const scopedMemberIds = new Set(
        await this.payPayrollGroups.resolveMemberEmployeeIdsForGroup(
          current.payroll_group_id,
          current.company_id,
          authorization,
          scope,
        ),
      );
      processPayslipRows = payslipRows.rows.filter((r) =>
        scopedMemberIds.has(r.employee_id),
      );
      if (processPayslipRows.length === 0) {
        throw new ApiException(
          HRM_PAY_GROUP_409,
          'Không có phiếu lương trong phạm vi nhóm của kỳ',
          HttpStatus.CONFLICT,
          { reason_code: 'EMPTY_SCOPED_PERIOD' },
        );
      }
    }

    await termSvc.assertTerminationSettlementsPostedForProcess(
      current.company_id,
      {
        id: current.id,
        start_date: current.start_date,
        end_date: current.end_date,
      },
      processPayslipRows.map((r) => r.employee_id),
    );

    const formulaWarnings: string[] = [];
    const employeeProcessSummaries: Array<{
      employee_id: string;
      split: boolean;
      segment_count: number;
      payslip_id?: string;
      net_amount_vnd?: number;
      dependents_count?: number;
      gtgc_amount_vnd?: number;
      merged_insurance_base_vnd?: number;
      ceiling_amount_vnd?: number | null;
      si_employee_amount_vnd?: number;
      si_employer_amount_vnd?: number;
      taxable_income_vnd?: number;
      personal_deduction_vnd?: number;
      dependent_deduction_vnd?: number;
      tax_amount_vnd?: number;
      pay_tax_regime_code?: string;
      bracket_snapshot_version?: string;
    }> = [];
    let taxContext: PayTaxProcessContext | undefined;
    const splitSvc = this.payPayslipSplit();
    const systemParams = await this.payrollParams.getPayrollParams(current.company_id);

    for (const row of processPayslipRows) {
      const evaluated = await splitSvc.processEmployeeInPeriod({
        companyId: current.company_id,
        periodId: current.id,
        periodFrom: current.start_date,
        periodTo: current.end_date,
        employeeId: row.employee_id,
        asOfDate: current.end_date,
        sheetTemplateSnapshotJson: current.sheet_template_snapshot_json,
        boundFormula,
        authorization,
        systemParams,
      });
      if (evaluated.mode === 'blocked') {
        if (evaluated.code === HRM_PAY_SPLIT_409) {
          throw new ApiException(
            HRM_PAY_SPLIT_409,
            evaluated.message,
            HttpStatus.CONFLICT,
            {
              code: HRM_PAY_SPLIT_409,
              ...evaluated.details,
              periodId: current.id,
              employeeId: row.employee_id,
              payroll_e2e_ready: false,
            },
          );
        }
        throw new ApiException(
          evaluated.code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB'
            ? HRM_PAY_FORMULA_412
            : evaluated.code === HRM_PAY_GTCG_412
              ? HRM_PAY_GTCG_412
              : evaluated.code === HRM_SET_SI_412_MISSING
                ? HRM_SET_SI_412_MISSING
                : evaluated.code,
          evaluated.message,
          HttpStatus.PRECONDITION_FAILED,
          {
            ...evaluated.details,
            periodId: current.id,
            employeeId: row.employee_id,
            formulaSource: boundFormula.source,
            payroll_e2e_ready: false,
          },
        );
      }
      formulaWarnings.push(...evaluated.warnings);
      const payslip = await this.upsertPayslip({
        company_id: current.company_id,
        period_id: current.id,
        employee_id: row.employee_id,
        employee_code: row.employee_code,
        employee_name: row.employee_name,
        gross_amount: evaluated.gross,
        deduction_amount: evaluated.deduction,
        net_amount: evaluated.net,
        status: 'processed',
        formula_definition_id: evaluated.primaryFormulaDefinitionId,
      });
      const empAttrs = employeeAttrsMap.get(row.employee_id);
      if (empAttrs) {
        const groupResolved =
          await this.payPayrollGroups.resolveEffectiveGroupForEmployee(
            current.company_id,
            empAttrs,
            scope,
          );
        if (
          current.payroll_group_id &&
          groupResolved.winner_id !== current.payroll_group_id
        ) {
          throw new ApiException(
            HRM_PAY_GROUP_409,
            'Nhân viên không thuộc nhóm bảng lương của kỳ',
            HttpStatus.CONFLICT,
            {
              reason_code: 'OUT_OF_PERIOD_GROUP_SCOPE',
              employee_id: row.employee_id,
            },
          );
        }
        await this.payPayrollGroups.persistPayslipGroupSnapshot(
          payslip.id,
          groupResolved.winner_id,
        );
      }
      await this.payFormulas.replacePayslipLines({
        payslipId: payslip.id,
        companyId: current.company_id,
        formulaDefinitionId: evaluated.primaryFormulaDefinitionId,
        lines: evaluated.lines.map((line) => ({
          component_code: line.component_code,
          amount: line.amount,
          sign: line.sign,
          source_ref: line.source_ref,
          sort_order: line.sort_order,
          source_tier: line.source_tier,
          formula_definition_id: line.formula_definition_id,
        })),
      });
      if (evaluated.split && evaluated.segments.length > 0) {
        await splitSvc.replacePayslipSplitSegments({
          payslipId: payslip.id,
          companyId: current.company_id,
          segments: evaluated.segments,
        });
      } else {
        await splitSvc.clearPayslipSplitSegments(payslip.id);
      }

      const gtgcPersist = await resolvePayGtgcForEmployee(this.db, {
        periodCompanyId: current.company_id,
        employeeId: row.employee_id,
        asOf: current.end_date,
        failOnMissingCfg: false,
      });
      if (gtgcPersist.ok) {
        await this.db.query(
          `
            UPDATE public.payroll_payslips
            SET gtgc_amount = $2, updated_at = NOW()
            WHERE id = $1::uuid;
          `,
          [payslip.id, gtgcPersist.gtgc_amount_vnd],
        );
      }

      const siCeiling = await applyPaySiCeilingForEmployee(this.db, {
        periodCompanyId: current.company_id,
        periodStart: current.start_date,
        periodEnd: current.end_date,
        employeeId: row.employee_id,
        lines: evaluated.lines,
        failOnMissingCfg: true,
      });
      if (!siCeiling.ok) {
        throw new ApiException(
          siCeiling.code,
          siCeiling.message,
          HttpStatus.PRECONDITION_FAILED,
          {
            code: siCeiling.code,
            insurance_type_key: siCeiling.insurance_type_key,
            company_id: siCeiling.company_id,
            period_end: siCeiling.period_end,
            periodId: current.id,
            employeeId: row.employee_id,
            payroll_e2e_ready: false,
          },
        );
      }
      await persistPaySiCeilingOnPayslip(this.db, {
        payslipId: payslip.id,
        siEmployeeAmountVnd: siCeiling.si_employee_amount_vnd,
        siEmployerAmountVnd: siCeiling.si_employer_amount_vnd,
      });

      const mergedGrossVnd = evaluated.gross;
      if (mergedGrossVnd > 0) {
        if (!taxContext) {
          taxContext = await loadPayTaxProcessContext(
            this.settingsTaxParams,
            current.company_id,
            authorization,
          );
        }
        const tncn = computePayTncnBreakdown({
          mergedTaxableGrossVnd: mergedGrossVnd,
          gtgcAmountVnd: gtgcPersist.ok ? gtgcPersist.gtgc_amount_vnd : 0,
          siEmployeeAmountVnd: siCeiling.si_employee_amount_vnd,
          dependentsCount: gtgcPersist.ok ? gtgcPersist.dependents_count : 0,
          taxContext,
        });
        await persistPayTncnOnPayslip(this.db, {
          payslipId: payslip.id,
          taxAmountVnd: tncn.taxAmountVnd,
        });
        employeeProcessSummaries.push({
          employee_id: row.employee_id,
          split: evaluated.split,
          segment_count: evaluated.segmentCount,
          payslip_id: payslip.id,
          net_amount_vnd: evaluated.net,
          dependents_count: gtgcPersist.ok
            ? gtgcPersist.dependents_count
            : undefined,
          gtgc_amount_vnd: gtgcPersist.ok
            ? gtgcPersist.gtgc_amount_vnd
            : undefined,
          merged_insurance_base_vnd: siCeiling.merged_insurance_base_vnd,
          ceiling_amount_vnd: siCeiling.ceiling_amount_vnd,
          si_employee_amount_vnd: siCeiling.si_employee_amount_vnd,
          si_employer_amount_vnd: siCeiling.si_employer_amount_vnd,
          taxable_income_vnd: tncn.taxableIncomeVnd,
          personal_deduction_vnd: tncn.personalDeductionVnd,
          dependent_deduction_vnd: tncn.dependentDeductionVnd,
          tax_amount_vnd: tncn.taxAmountVnd,
          pay_tax_regime_code: tncn.payTaxRegimeCode,
          bracket_snapshot_version: tncn.bracketSnapshotVersion,
        });
        await termSvc.bindFinalPayslipToSettlement({
          companyId: current.company_id,
          periodId: current.id,
          employeeId: row.employee_id,
          payslipId: payslip.id,
        });
      } else {
        await persistPayTncnOnPayslip(this.db, {
          payslipId: payslip.id,
          taxAmountVnd: 0,
        });
        employeeProcessSummaries.push({
          employee_id: row.employee_id,
          split: evaluated.split,
          segment_count: evaluated.segmentCount,
          payslip_id: payslip.id,
          net_amount_vnd: evaluated.net,
          dependents_count: gtgcPersist.ok
            ? gtgcPersist.dependents_count
            : undefined,
          gtgc_amount_vnd: gtgcPersist.ok
            ? gtgcPersist.gtgc_amount_vnd
            : undefined,
          merged_insurance_base_vnd: siCeiling.merged_insurance_base_vnd,
          ceiling_amount_vnd: siCeiling.ceiling_amount_vnd,
          si_employee_amount_vnd: siCeiling.si_employee_amount_vnd,
          si_employer_amount_vnd: siCeiling.si_employer_amount_vnd,
          tax_amount_vnd: 0,
        });
        await termSvc.bindFinalPayslipToSettlement({
          companyId: current.company_id,
          periodId: current.id,
          employeeId: row.employee_id,
          payslipId: payslip.id,
        });
      }
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        UPDATE public.payroll_periods
        SET status = 'processed', processed_at = NOW(), updated_at = NOW(),
            formula_definition_id = COALESCE(formula_definition_id, $2::uuid)
        WHERE id = $1::uuid
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at,
          formula_definition_id::text AS formula_definition_id;
      `,
      [periodId, boundFormula.id],
    );
    const summaryRes = await this.db.query<{
      employee_count: string;
      total_gross: string;
      total_deduction: string;
      total_net: string;
    }>(
      `
        SELECT
          COUNT(*)::text AS employee_count,
          COALESCE(SUM(gross_amount), 0)::text AS total_gross,
          COALESCE(SUM(deduction_amount), 0)::text AS total_deduction,
          COALESCE(SUM(net_amount), 0)::text AS total_net
        FROM public.payroll_payslips
        WHERE period_id = $1::uuid;
      `,
      [periodId],
    );
    const summary = summaryRes.rows[0];
    const totalGross = Number(summary?.total_gross ?? 0);
    const totalDeduction = Number(summary?.total_deduction ?? 0);
    const totalNet = Number(summary?.total_net ?? 0);
    return {
      ...this.mapPeriod(res.rows[0]),
      employee_count: Number(summary?.employee_count ?? 0),
      total_gross: totalGross,
      total_deduction: totalDeduction,
      total_net: totalNet,
      payslip_summary: {
        total_gross: totalGross,
        total_deduction: totalDeduction,
        total_net: totalNet,
      },
      formula_bind: {
        formula_definition_id: boundFormula.id,
        code: boundFormula.code,
        version: boundFormula.version,
        source: boundFormula.source,
      },
      warnings: [...new Set(formulaWarnings)].slice(0, 40),
      employees: employeeProcessSummaries,
      payroll_e2e_ready: false,
    };
  }

  /** F-PAY-TERM-SETTLE-01 — POST …/termination-settle */
  async terminationSettlePayrollPeriod(
    periodId: string,
    requestedCompanyId: string,
    body: TerminationSettleDto,
    authorization?: string,
  ) {
    assertNoPayTermPayoutOverrideInBody(
      body as unknown as Record<string, unknown>,
    );
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });

    const employeeIds = body.employee_ids?.length
      ? body.employee_ids
      : (
          await this.db.query<{ employee_id: string }>(
            `
              SELECT DISTINCT employee_id::text AS employee_id
              FROM public.payroll_payslips
              WHERE period_id = $1::uuid;
            `,
            [periodId],
          )
        ).rows.map((r) => r.employee_id);

    if (employeeIds.length === 0) {
      throw new ApiException(
        'HRM-PAY-ENROLL-REQUIRED',
        'Chưa có nhân viên trong kỳ — cần employee_ids hoặc enroll trước',
        HttpStatus.CONFLICT,
      );
    }

    const targetStatus = body.target_status ?? 'ready';
    const terminationDateByEmployee: Record<string, string> = {};
    if (body.termination_date && employeeIds.length === 1) {
      terminationDateByEmployee[employeeIds[0]] = body.termination_date;
    }

    const termSvc = this.payTermination();
    return termSvc.upsertTerminationSettlement({
      companyId: current.company_id,
      periodId: current.id,
      periodFrom: current.start_date,
      periodTo: current.end_date,
      periodStartDate: current.start_date,
      employeeIds,
      targetStatus,
      requireClosedTimesheet: this.isRequireClosedTimesheet(),
      terminationDateByEmployee,
    });
  }

  /** GET …/termination-settle/preview */
  async getTerminationSettlePreview(
    periodId: string,
    requestedCompanyId: string,
    employeeId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });

    const termSvc = this.payTermination();
    const resolved = await termSvc.resolveTerminationCaseForPayroll({
      companyId: current.company_id,
      employeeId,
      periodFrom: current.start_date,
      periodTo: current.end_date,
    });
    const checklist = await termSvc.readTerminationChecklistSnapshot(
      employeeId,
      current.company_id,
    );
    const settlement = await termSvc.loadOpenSettlement(
      current.company_id,
      employeeId,
      current.id,
    );

    let isFinalPay = false;
    let finalNetVnd: number | undefined;
    if (settlement?.final_payslip_id) {
      const ps = await this.db.query<{
        is_final_pay: boolean;
        net_amount: string;
      }>(
        `SELECT is_final_pay, net_amount::text FROM public.payroll_payslips WHERE id = $1::uuid LIMIT 1;`,
        [settlement.final_payslip_id],
      );
      isFinalPay = Boolean(ps.rows[0]?.is_final_pay);
      finalNetVnd = ps.rows[0] ? Number(ps.rows[0].net_amount) : undefined;
    }

    return {
      termination_id: resolved?.terminationId ?? null,
      settlement_status: settlement?.status ?? null,
      settlement_id: settlement?.id ?? null,
      checklist: termSvc.mapChecklistDisplay(checklist),
      is_final_pay: isFinalPay,
      final_net_vnd: finalNetVnd,
      termination_date: resolved?.terminationDate,
      mid_month_split_required: resolved?.midMonthSplitRequired,
      payroll_e2e_ready: false,
    };
  }

  async getTerminationSettlementById(
    settlementId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const termSvc = this.payTermination();
    const row = await termSvc.loadSettlementById(settlementId, scopeCompanyId);
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Termination settlement not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope({ company_id: row.company_id }, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      payroll_period_id: row.payroll_period_id,
      termination_id: row.termination_id,
      settlement_status: row.status,
      final_payslip_id: row.final_payslip_id,
      checklist: {
        asset_ack: row.asset_checklist_ack,
        si_cutoff: row.si_cutoff_done,
        leave_cashout: row.leave_cashout_done,
        rd_included: row.reward_discipline_included,
      },
      payroll_e2e_ready: false,
    };
  }

  async getPayrollEligibility(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
    filterPayrollGroupId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    const eligibility = await this.loadPayrollEligibility(
      current,
      scope,
      authorization,
      filterPayrollGroupId ?? null,
    );
    return {
      period_id: current.id,
      require_closed_timesheet: eligibility.require_closed_timesheet,
      eligible_count: eligibility.eligible_count,
      ineligible_count: eligibility.ineligible_count,
      items: eligibility.items,
    };
  }

  async enrollPayrollPeriod(
    periodId: string,
    requestedCompanyId: string,
    payload: CreatePayrollEnrollDto,
    authorization?: string,
  ) {
    assertNoPayGtgcOverrideInBody(
      payload as unknown as Record<string, unknown>,
    );
    assertNoPaySiOverrideInBody(payload as unknown as Record<string, unknown>);
    assertNoPayTaxOverrideInBody(payload as unknown as Record<string, unknown>);
    assertNoPayTermPayoutOverrideInBody(
      payload as unknown as Record<string, unknown>,
    );
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    this.assertPeriodUnlockedForEnrollProcess(current);
    if (current.status !== 'draft') {
      throw new ApiException(
        'HRM-PAY-003',
        'Only draft payroll periods allow enrollment',
        HttpStatus.CONFLICT,
      );
    }
    const eligibility = await this.loadPayrollEligibility(
      current,
      scope,
      authorization,
    );
    const scopedMemberSet = current.payroll_group_id
      ? new Set(
          await this.payPayrollGroups.resolveMemberEmployeeIdsForGroup(
            current.payroll_group_id,
            current.company_id,
            authorization,
            scope,
          ),
        )
      : null;
    const eligibleMap = new Map(
      eligibility.items.map((item) => [item.employee_id, item]),
    );
    const targetIds =
      payload.mode === PayrollEnrollMode.AUTO_ELIGIBLE
        ? eligibility.items
            .filter((item) => item.eligible)
            .map((item) => item.employee_id)
        : [...new Set(payload.employee_ids ?? [])];

    const enrolled: Array<{
      payslip_id: string;
      employee_id: string;
      employee_code: string;
      employee_name: string;
      status: string;
    }> = [];
    const rejected: Array<{ employee_id: string; reasons: string[] }> = [];
    for (const employeeId of targetIds) {
      if (scopedMemberSet && !scopedMemberSet.has(employeeId)) {
        rejected.push({
          employee_id: employeeId,
          reasons: ['OUT_OF_PAYROLL_GROUP_SCOPE'],
        });
        continue;
      }
      const item = eligibleMap.get(employeeId);
      if (!item) {
        rejected.push({ employee_id: employeeId, reasons: ['NOT_FOUND'] });
        continue;
      }
      if (!item.eligible) {
        rejected.push({
          employee_id: employeeId,
          reasons: item.reasons.filter((reason) => reason !== 'HIRE_MID_MONTH'),
        });
        continue;
      }
      const payslip = await this.upsertPayslip({
        company_id: current.company_id,
        period_id: current.id,
        employee_id: item.employee_id,
        employee_code: item.employee_code,
        employee_name: item.employee_name,
        gross_amount: 0,
        deduction_amount: 0,
        net_amount: 0,
        status: 'draft',
      });
      enrolled.push({
        payslip_id: payslip.id,
        employee_id: payslip.employee_id,
        employee_code: payslip.employee_code,
        employee_name: payslip.employee_name,
        status: payslip.status,
      });
    }

    if (enrolled.length === 0) {
      throw new ApiException(
        'HRM-PAY-ENROLL-EMPTY',
        'Không có nhân viên đủ điều kiện để đưa vào kỳ lương',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      period_id: current.id,
      require_closed_timesheet: eligibility.require_closed_timesheet,
      enrolled,
      rejected,
      employee_count: enrolled.length,
    };
  }

  async closePayrollPeriod(
    periodId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const current = await this.queryPeriodInScope(
      periodId,
      requestedCompanyId,
      authorization,
    );
    if (!current) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(current, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (current.status !== 'processed') {
      throw new ApiException(
        'HRM-PAY-004',
        'Only processed payroll periods can be closed',
        HttpStatus.CONFLICT,
      );
    }

    const unpaidRes = await this.db.query<{ total: string }>(
      `
        SELECT COUNT(*)::text AS total
        FROM public.payroll_payslips
        WHERE period_id = $1::uuid
          AND status <> 'void'
          AND COALESCE(
            payment_status,
            CASE WHEN status = 'paid' THEN 'paid' ELSE 'unpaid' END
          ) <> 'paid';
      `,
      [periodId],
    );
    const unpaidCount = Number(unpaidRes.rows[0]?.total ?? 0);
    if (unpaidCount > 0) {
      throw new ApiException(
        'HRM-PAY-005',
        'Tất cả phiếu lương phải được chi trả (paid) trước khi chốt kỳ lương',
        HttpStatus.PRECONDITION_FAILED,
        { unpaid_payslip_count: unpaidCount, payroll_e2e_ready: false },
      );
    }

    const res = await this.db.query<PayrollPeriodRow>(
      `
        UPDATE public.payroll_periods
        SET status = 'closed', closed_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id, company_id, period_label, start_date, end_date, status, created_by,
          processed_at, closed_at, created_at, updated_at;
      `,
      [periodId],
    );
    return this.mapPeriod(res.rows[0]);
  }

  async getPayrollReconciliationSummary(
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushPayrollPeriodScopeFilters(filters, values, scope);
    const where = filters.join(' AND ');
    const res = await this.db.query<{
      status: 'draft' | 'processed' | 'closed';
      total: string;
    }>(
      `
        SELECT status, COUNT(*)::text AS total
        FROM public.payroll_periods
        WHERE ${where}
        GROUP BY status;
      `,
      values,
    );
    const summary = { draft: 0, processed: 0, closed: 0 };
    for (const row of res.rows) {
      summary[row.status] = Number(row.total ?? 0);
    }
    return summary;
  }

  private mapPayslip(row: PayrollPayslipRow) {
    const gtgcStored =
      row.gtgc_amount != null && row.gtgc_amount !== ''
        ? Number(row.gtgc_amount)
        : null;
    const siEmployeeStored =
      row.si_employee_amount != null && row.si_employee_amount !== ''
        ? Number(row.si_employee_amount)
        : null;
    const siEmployerStored =
      row.si_employer_amount != null && row.si_employer_amount !== ''
        ? Number(row.si_employer_amount)
        : null;
    const taxStored =
      row.tax_amount != null && row.tax_amount !== ''
        ? Number(row.tax_amount)
        : null;
    return {
      id: row.id,
      company_id: row.company_id,
      period_id: row.period_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code,
      employee_name: row.employee_name,
      gross_amount: Number(row.gross_amount),
      deduction_amount: Number(row.deduction_amount),
      net_amount: Number(row.net_amount),
      currency: row.currency,
      status: mapPayslipStatusForApi(row.status),
      payment_status:
        (row.payment_status as PayPayslipPaymentStatus | null) ?? null,
      payment_status_label_vi: paymentStatusLabelVi(row.payment_status),
      published_to_ess: Boolean(row.published_to_ess),
      published_at: row.published_at ?? null,
      version: row.version != null ? Number(row.version) : 1,
      formula_definition_id: row.formula_definition_id ?? null,
      employee_confirmed_at: row.employee_confirmed_at ?? null,
      employee_confirmed_by: row.employee_confirmed_by ?? null,
      ess_confirmed: Boolean(row.employee_confirmed_at),
      gtgc_amount: gtgcStored,
      si_employee_amount: siEmployeeStored,
      si_employer_amount: siEmployerStored,
      tax_amount: taxStored,
      is_final_pay: Boolean(row.is_final_pay),
      isFinalPay: Boolean(row.is_final_pay),
      termination_settlement_id: row.termination_settlement_id ?? null,
      terminationSettlementId: row.termination_settlement_id ?? null,
      settlement_status: row.settlement_status ?? null,
      settlementStatus: row.settlement_status ?? null,
      payroll_group_id: row.payroll_group_id ?? null,
      payroll_group_code: row.payroll_group_code ?? null,
      payroll_group_name_vi: row.payroll_group_name_vi ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /** F-PAY-PAYSLIP-01 GTCG display-ready (API-01 §5.2). */
  private async enrichPayslipGtgcDisplay(
    row: PayrollPayslipRow,
    periodEndDate: string | undefined,
    periodCompanyId: string,
  ): Promise<{ dependentsCount: number; gtgcAmountVnd: number }> {
    const stored =
      row.gtgc_amount != null && row.gtgc_amount !== ''
        ? Number(row.gtgc_amount)
        : null;
    const asOf = (periodEndDate ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
      return {
        dependentsCount: 0,
        gtgcAmountVnd: stored != null && Number.isFinite(stored) ? stored : 0,
      };
    }
    const resolved = await resolvePayGtgcForEmployee(this.db, {
      periodCompanyId,
      employeeId: row.employee_id,
      asOf,
      failOnMissingCfg: false,
    });
    const dependentsCount = resolved.ok ? resolved.dependents_count : 0;
    const gtgcAmountVnd =
      stored != null && Number.isFinite(stored)
        ? stored
        : resolved.ok
          ? resolved.gtgc_amount_vnd
          : 0;
    return { dependentsCount, gtgcAmountVnd };
  }

  /** F-PAY-PAYSLIP-01 SI/ceiling display-ready (API-01 PAY-05 §5.2). */
  private async enrichPayslipSiDisplay(
    row: PayrollPayslipRow,
    periodStartDate: string | undefined,
    periodEndDate: string | undefined,
    periodCompanyId: string,
    lines?: PaySrcResolvedLine[],
  ): Promise<{
    consolidatedInsuranceBaseVnd: number | null;
    ceilingAmountVnd: number | null;
    siEmployeeAmountVnd: number | null;
    siEmployerAmountVnd: number | null;
  }> {
    const storedSiEe =
      row.si_employee_amount != null && row.si_employee_amount !== ''
        ? Number(row.si_employee_amount)
        : null;
    const storedSiEr =
      row.si_employer_amount != null && row.si_employer_amount !== ''
        ? Number(row.si_employer_amount)
        : null;
    const asOf = (periodEndDate ?? '').slice(0, 10);
    const periodStart = (periodStartDate ?? asOf).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !lines || lines.length === 0) {
      return {
        consolidatedInsuranceBaseVnd: null,
        ceilingAmountVnd: null,
        siEmployeeAmountVnd: storedSiEe,
        siEmployerAmountVnd: storedSiEr,
      };
    }
    const resolved = await applyPaySiCeilingForEmployee(this.db, {
      periodCompanyId,
      periodStart,
      periodEnd: asOf,
      employeeId: row.employee_id,
      lines,
      failOnMissingCfg: false,
    });
    if (!resolved.ok) {
      return {
        consolidatedInsuranceBaseVnd: null,
        ceilingAmountVnd: null,
        siEmployeeAmountVnd: storedSiEe,
        siEmployerAmountVnd: storedSiEr,
      };
    }
    return {
      consolidatedInsuranceBaseVnd: resolved.merged_insurance_base_vnd,
      ceilingAmountVnd: resolved.ceiling_amount_vnd,
      siEmployeeAmountVnd:
        storedSiEe != null && Number.isFinite(storedSiEe)
          ? storedSiEe
          : resolved.si_employee_amount_vnd,
      siEmployerAmountVnd:
        storedSiEr != null && Number.isFinite(storedSiEr)
          ? storedSiEr
          : resolved.si_employer_amount_vnd,
    };
  }

  /** F-PAY-PAYSLIP-01 TNCN display-ready (API-01 PAY-06 §5.2). */
  private async enrichPayslipTaxDisplay(
    row: PayrollPayslipRow,
    periodEndDate: string | undefined,
    periodCompanyId: string,
    authorization?: string,
  ): Promise<{
    taxableIncomeVnd: number;
    personalDeductionVnd: number;
    dependentDeductionVnd: number;
    taxAmountVnd: number;
    payTaxRegimeCode: string | null;
    bracketSnapshotVersion: string | null;
  }> {
    const storedTax =
      row.tax_amount != null && row.tax_amount !== ''
        ? Number(row.tax_amount)
        : null;
    const gross = Number(row.gross_amount ?? 0);
    const gtgc =
      row.gtgc_amount != null && row.gtgc_amount !== ''
        ? Number(row.gtgc_amount)
        : 0;
    const siEe =
      row.si_employee_amount != null && row.si_employee_amount !== ''
        ? Number(row.si_employee_amount)
        : 0;
    const asOf = (periodEndDate ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || gross <= 0) {
      return {
        taxableIncomeVnd: 0,
        personalDeductionVnd: 0,
        dependentDeductionVnd: 0,
        taxAmountVnd:
          storedTax != null && Number.isFinite(storedTax) ? storedTax : 0,
        payTaxRegimeCode: null,
        bracketSnapshotVersion: null,
      };
    }
    try {
      const taxContext = await loadPayTaxProcessContext(
        this.settingsTaxParams,
        periodCompanyId,
        authorization,
      );
      const gtgcResolved = await resolvePayGtgcForEmployee(this.db, {
        periodCompanyId,
        employeeId: row.employee_id,
        asOf,
        failOnMissingCfg: false,
      });
      const breakdown = computePayTncnBreakdown({
        mergedTaxableGrossVnd: gross,
        gtgcAmountVnd: Number.isFinite(gtgc)
          ? gtgc
          : gtgcResolved.ok
            ? gtgcResolved.gtgc_amount_vnd
            : 0,
        siEmployeeAmountVnd: siEe,
        dependentsCount: gtgcResolved.ok ? gtgcResolved.dependents_count : 0,
        taxContext,
      });
      return {
        taxableIncomeVnd: breakdown.taxableIncomeVnd,
        personalDeductionVnd: breakdown.personalDeductionVnd,
        dependentDeductionVnd: breakdown.dependentDeductionVnd,
        taxAmountVnd:
          storedTax != null && Number.isFinite(storedTax)
            ? storedTax
            : breakdown.taxAmountVnd,
        payTaxRegimeCode: breakdown.payTaxRegimeCode,
        bracketSnapshotVersion: breakdown.bracketSnapshotVersion,
      };
    } catch {
      return {
        taxableIncomeVnd: Math.max(0, gross - gtgc - siEe),
        personalDeductionVnd: 0,
        dependentDeductionVnd: 0,
        taxAmountVnd:
          storedTax != null && Number.isFinite(storedTax) ? storedTax : 0,
        payTaxRegimeCode: null,
        bracketSnapshotVersion: null,
      };
    }
  }
  resolveEssEmployeeId(authorization?: string): string {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const employeeId = String(
      payload?.employee_id ?? payload?.employeeId ?? '',
    ).trim();
    if (!employeeId || !ESS_EMPLOYEE_ID_RE.test(employeeId)) {
      throw new ApiException(
        'HRM-PAY-403-ESS',
        'ESS phiếu lương yêu cầu token gắn nhân viên',
        HttpStatus.FORBIDDEN,
      );
    }
    return employeeId;
  }

  private resolveEssCompanyId(
    authorization: string | undefined,
    requestedCompanyId?: string,
  ): string {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const fromJwt = String(
      payload?.companyId ?? payload?.company_id ?? '',
    ).trim();
    const requested = (requestedCompanyId ?? fromJwt ?? 'main').trim();
    return normalizePayrollListCompanyId(authorization, requested);
  }

  private payslipSelectColumns(): string {
    return `
      p.id, p.company_id, p.period_id, p.employee_id, p.employee_code, p.employee_name,
      p.gross_amount::text, p.deduction_amount::text, p.net_amount::text,
      p.currency, p.status, p.formula_definition_id::text AS formula_definition_id,
      p.employee_confirmed_at::text AS employee_confirmed_at,
      p.employee_confirmed_by::text AS employee_confirmed_by,
      p.gtgc_amount::text AS gtgc_amount,
      p.si_employee_amount::text AS si_employee_amount,
      p.si_employer_amount::text AS si_employer_amount,
      p.tax_amount::text AS tax_amount,
      p.is_final_pay,
      p.termination_settlement_id::text AS termination_settlement_id,
      p.payment_status,
      p.published_to_ess,
      p.published_at::text AS published_at,
      p.version,
      p.payroll_group_id::text AS payroll_group_id,
      pg.code AS payroll_group_code,
      pg.name_vi AS payroll_group_name_vi,
      pts.status AS settlement_status,
      p.created_at, p.updated_at
    `;
  }

  private async loadPayslipHeaderInScope(
    payslipId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<
    | (PayrollPayslipRow & {
        period_label: string;
        period_start_date: string;
        period_end_date: string;
      })
    | undefined
  > {
    const { filters, values } = this.buildPayslipScopeFilters(
      authorization,
      companyId,
      scopeContext,
      {
        payslipId,
      },
    );
    const res = await this.db.query<
      PayrollPayslipRow & {
        period_label: string;
        period_start_date: string;
        period_end_date: string;
      }
    >(
      `
        SELECT
          ${this.payslipSelectColumns()},
          pp.period_label,
          pp.start_date::text AS period_start_date,
          pp.end_date::text AS period_end_date
        FROM public.payroll_payslips p
        JOIN public.payroll_periods pp ON pp.id = p.period_id
        LEFT JOIN public.pay_payroll_group pg ON pg.id = p.payroll_group_id
        LEFT JOIN public.pay_termination_settlement pts ON pts.id = p.termination_settlement_id
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    return res.rows[0];
  }

  private assertPeriodUnlockedForEnrollProcess(period: PayrollPeriodRow): void {
    if (!isPeriodPayrollLocked(period)) return;
    throw new ApiException(
      HRM_PAY_LOCK_409,
      'Kỳ lương đã khóa — không được enroll hoặc xử lý tính lương',
      HttpStatus.CONFLICT,
      { period_id: period.id, payroll_e2e_ready: false },
    );
  }

  private assertPayslipPublishedForEss(row: PayrollPayslipRow): void {
    if (row.status === 'published' && row.published_to_ess) return;
    throw new ApiException(
      HRM_PAY_PUBLISH_409,
      'Phiếu lương chưa phát hành cho ESS',
      HttpStatus.CONFLICT,
      {
        payslip_status: mapPayslipStatusForApi(row.status),
        payment_status: row.payment_status ?? null,
        payroll_e2e_ready: false,
      },
    );
  }

  private throwPayslipPublish409(
    message: string,
    row?: Pick<PayrollPayslipRow, 'status' | 'payment_status'>,
  ): never {
    throw new ApiException(HRM_PAY_PUBLISH_409, message, HttpStatus.CONFLICT, {
      payslip_status: row ? mapPayslipStatusForApi(row.status) : undefined,
      payment_status: row?.payment_status ?? null,
      payroll_e2e_ready: false,
    });
  }

  private resolveCbActorUserId(authorization?: string): string | null {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const sub = String(payload?.sub ?? '').trim();
    if (ESS_EMPLOYEE_ID_RE.test(sub)) return sub;
    return null;
  }

  private async insertPayslipPaymentAudit(input: {
    companyId: string;
    payslipId: string;
    eventKind: 'payment_status_change' | 'publish';
    fromPaymentStatus: string | null;
    toPaymentStatus: string | null;
    actorUserId: string | null;
    note?: string | null;
  }): Promise<void> {
    await this.db.query(
      `
        INSERT INTO public.pay_payslip_payment_status_audit (
          company_id, payslip_id, event_kind,
          from_payment_status, to_payment_status,
          actor_user_id, note
        )
        VALUES ($1, $2::uuid, $3, $4, $5, $6::uuid, $7);
      `,
      [
        input.companyId,
        input.payslipId,
        input.eventKind,
        input.fromPaymentStatus,
        input.toPaymentStatus,
        input.actorUserId,
        input.note ?? null,
      ],
    );
  }

  /** F-PAY-PAYSLIP-01 — POST publish (calculated → published). */
  async publishPayslip(
    payslipId: string,
    companyId: string,
    _body: PublishPayslipDto | undefined,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const row = await this.loadPayslipHeaderInScope(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll payslip not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.status === 'void') {
      this.throwPayslipPublish409('Không thể phát hành phiếu đã void', row);
    }
    if (row.status === 'published' && row.published_to_ess) {
      return this.getPayslipById(
        payslipId,
        companyId,
        authorization,
        scopeContext,
      );
    }
    if (!isPayslipCalculatedReady(row.status)) {
      this.throwPayslipPublish409(
        'Chỉ phát hành phiếu đã tính lương (calculated)',
        row,
      );
    }
    const lineCountRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.payroll_payslip_lines WHERE payslip_id = $1::uuid;`,
      [payslipId],
    );
    if (Number(lineCountRes.rows[0]?.total ?? 0) === 0) {
      this.throwPayslipPublish409(
        'Phiếu lương không có dòng thành phần từ xử lý kỳ',
        row,
      );
    }
    const actorId = this.resolveCbActorUserId(authorization);
    const priorPayment = row.payment_status ?? null;
    await this.db.query(
      `
        UPDATE public.payroll_payslips
        SET
          status = 'published',
          published_to_ess = true,
          published_at = NOW(),
          published_by = $2::uuid,
          payment_status = COALESCE(payment_status, 'unpaid'),
          updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [payslipId, actorId],
    );
    await this.insertPayslipPaymentAudit({
      companyId: row.company_id,
      payslipId,
      eventKind: 'publish',
      fromPaymentStatus: priorPayment,
      toPaymentStatus: 'unpaid',
      actorUserId: actorId,
      note: null,
    });
    return this.getPayslipById(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
  }

  /** F-PAY-PAYSLIP-01 — PATCH payment-status on published payslip. */
  async patchPayslipPaymentStatus(
    payslipId: string,
    companyId: string,
    body: PatchPayslipPaymentStatusDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    assertNoPayPayslipAmountOverrideInBody(
      body as unknown as Record<string, unknown>,
    );
    await this.ensureSchema();
    const row = await this.loadPayslipHeaderInScope(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll payslip not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.status === 'void') {
      this.throwPayslipPublish409('Không cập nhật TT trên phiếu void', row);
    }
    if (row.status !== 'published') {
      this.throwPayslipPublish409(
        'Chỉ cập nhật TT trên phiếu đã phát hành',
        row,
      );
    }
    const nextStatus = body.payment_status;
    if (!PAY_PAYSLIP_PAYMENT_STATUSES.includes(nextStatus)) {
      throw new ApiException(
        'HRM-VAL-001',
        'payment_status không hợp lệ',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const actorId = this.resolveCbActorUserId(authorization);
    const fromStatus = row.payment_status ?? 'unpaid';
    await this.db.query(
      `
        UPDATE public.payroll_payslips
        SET payment_status = $2, updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [payslipId, nextStatus],
    );
    await this.insertPayslipPaymentAudit({
      companyId: row.company_id,
      payslipId,
      eventKind: 'payment_status_change',
      fromPaymentStatus: fromStatus,
      toPaymentStatus: nextStatus,
      actorUserId: actorId,
      note: body.note ?? null,
    });
    return this.getPayslipById(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
  }

  /** F-PAY-PAYSLIP-VOID-01 — void O22 (no silent DELETE). */
  async voidPayslip(
    payslipId: string,
    companyId: string,
    body: VoidPayslipDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    assertNoPayPayslipAmountOverrideInBody(
      body as unknown as Record<string, unknown>,
    );
    await this.ensureSchema();
    const row = await this.loadPayslipHeaderInScope(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll payslip not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.status === 'void') {
      return {
        payslip_id: payslipId,
        status: 'void' as const,
        settlement_status: row.settlement_status ?? null,
        payroll_e2e_ready: false,
      };
    }
    const paymentStatus = row.payment_status ?? 'unpaid';
    const mayVoid =
      paymentStatus === 'paid' ||
      paymentStatus === 'partial' ||
      (row.is_final_pay && row.settlement_status === 'posted');
    if (!mayVoid && row.status !== 'published') {
      throw new ApiException(
        'HRM-PAY-VOID-409',
        'Chính sách void: cần phiếu đã TT hoặc tất toán posted',
        HttpStatus.CONFLICT,
        { payroll_e2e_ready: false },
      );
    }
    await this.db.query(
      `
        UPDATE public.payroll_payslips
        SET status = 'void', updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [payslipId],
    );
    if (row.termination_settlement_id) {
      const settlementStatus =
        body.adjustment_mode === 'mark_adjustment_required'
          ? 'ready'
          : 'cancelled';
      await this.db.query(
        `
          UPDATE public.pay_termination_settlement
          SET status = $2, updated_at = NOW()
          WHERE id = $1::uuid;
        `,
        [row.termination_settlement_id, settlementStatus],
      );
    }
    await this.insertPayslipPaymentAudit({
      companyId: row.company_id,
      payslipId,
      eventKind: 'payment_status_change',
      fromPaymentStatus: paymentStatus,
      toPaymentStatus: paymentStatus,
      actorUserId: this.resolveCbActorUserId(authorization),
      note: body.reason,
    });
    const settlementAfter = row.termination_settlement_id
      ? ((
          await this.db.query<{ status: string }>(
            `SELECT status FROM public.pay_termination_settlement WHERE id = $1::uuid LIMIT 1;`,
            [row.termination_settlement_id],
          )
        ).rows[0]?.status ?? null)
      : null;
    return {
      payslip_id: payslipId,
      status: 'void' as const,
      settlement_status: settlementAfter,
      payroll_e2e_ready: false,
    };
  }

  denyGenericPayslipPatch(body: Record<string, unknown> | undefined): void {
    assertNoPayPayslipAmountOverrideInBody(body);
    throw new ApiException(
      'HRM-PAY-PAYSLIP-405',
      'Phiếu lương không hỗ trợ PATCH tổng quát — dùng payment-status hoặc xử lý kỳ',
      HttpStatus.METHOD_NOT_ALLOWED,
      { payroll_e2e_ready: false },
    );
  }

  private assertEssPayslipOwnership(
    row: PayrollPayslipRow | undefined,
    employeeId: string,
  ): asserts row is PayrollPayslipRow {
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll payslip not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.employee_id !== employeeId) {
      throw new ApiException(
        'HRM-PAY-403-ESS',
        'ESS chỉ được xem hoặc xác nhận phiếu lương của chính mình',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /**
   * F-PAY-PAYSLIP-01 ESS — GET /payroll/me/payslips (token employee_id only).
   */
  async listMyPayslips(
    query: { company_id?: string; period_id?: string },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const employeeId = this.resolveEssEmployeeId(authorization);
    const companyId = this.resolveEssCompanyId(authorization, query.company_id);
    return this.listPayslips(
      {
        company_id: companyId,
        period_id: query.period_id,
        employee_id: employeeId,
      },
      authorization,
      scopeContext,
      { essPublishedOnly: true },
    );
  }

  /**
   * F-PAY-PAYSLIP-01 ESS — GET /payroll/me/payslips/:id (403 cross-employee · 404 scope).
   */
  async getMyPayslipById(
    payslipId: string,
    companyId: string | undefined,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const employeeId = this.resolveEssEmployeeId(authorization);
    const scopeCompanyId = this.resolveEssCompanyId(authorization, companyId);
    const row = await this.loadPayslipHeaderInScope(
      payslipId,
      scopeCompanyId,
      authorization,
      scopeContext,
    );
    this.assertEssPayslipOwnership(row, employeeId);
    this.assertPayslipPublishedForEss(row);
    const lines = await this.loadPayslipLinesForPayslip(row.id);
    const gtgcDisplay = await this.enrichPayslipGtgcDisplay(
      row,
      row.period_end_date,
      row.company_id,
    );
    const siDisplay = await this.enrichPayslipSiDisplay(
      row,
      row.period_start_date,
      row.period_end_date,
      row.company_id,
      lines as PaySrcResolvedLine[],
    );
    const taxDisplay = await this.enrichPayslipTaxDisplay(
      row,
      row.period_end_date,
      row.company_id,
      authorization,
    );
    return {
      ...this.mapPayslip(row),
      ...gtgcDisplay,
      ...siDisplay,
      ...taxDisplay,
      period_label: row.period_label,
      components: lines,
      lines,
    };
  }

  /**
   * AMIS step6 GĐ1 — POST /payroll/me/payslips/:id/confirm (employee self-service).
   */
  async confirmMyPayslip(
    payslipId: string,
    companyId: string | undefined,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const employeeId = this.resolveEssEmployeeId(authorization);
    const scopeCompanyId = this.resolveEssCompanyId(authorization, companyId);
    const row = await this.loadPayslipHeaderInScope(
      payslipId,
      scopeCompanyId,
      authorization,
      scopeContext,
    );
    this.assertEssPayslipOwnership(row, employeeId);
    this.assertPayslipPublishedForEss(row);

    if (!row.employee_confirmed_at) {
      await this.db.query(
        `
          UPDATE public.payroll_payslips
          SET
            employee_confirmed_at = NOW(),
            employee_confirmed_by = $2::uuid,
            updated_at = NOW()
          WHERE id = $1::uuid
            AND employee_id = $2::uuid
            AND employee_confirmed_at IS NULL;
        `,
        [payslipId, employeeId],
      );
    }

    return this.getMyPayslipById(
      payslipId,
      scopeCompanyId,
      authorization,
      scopeContext,
    );
  }

  private mapPayslipLine(row: {
    id: string;
    payslip_id: string;
    company_id: string;
    component_code: string;
    amount: string;
    sign: string;
    source_ref: string | null;
    formula_definition_id: string | null;
    sort_order: number;
    created_at: string;
    source_tier?: string | null;
  }) {
    // AC-PAY-SRC-GET-TIER: always emit source_tier key (null only when unknown).
    const source_tier = resolvePayslipLineSourceTier(
      row.source_tier,
      row.source_ref,
    );
    return {
      id: row.id,
      payslip_id: row.payslip_id,
      company_id: row.company_id,
      component_code: row.component_code,
      amount: Number(row.amount),
      sign: row.sign,
      source_ref: row.source_ref,
      source_tier,
      formula_definition_id: row.formula_definition_id,
      sort_order: Number(row.sort_order),
      created_at: row.created_at,
    };
  }

  /**
   * Same scope predicate as listPayslips (U19 scope_parity).
   */
  private buildPayslipScopeFilters(
    authorization: string | undefined,
    companyId: string,
    scopeContext: HrmListScopeContext | undefined,
    extra?: {
      payslipId?: string;
      periodId?: string;
      employeeId?: string;
      payrollGroupId?: string;
      essPublishedOnly?: boolean;
    },
  ): { filters: string[]; values: unknown[] } {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(
      authorization,
      scopeCompanyId,
      scopeContext,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    if (scope.masterTenantPartition || scope.memberTenantId) {
      pushWorkforceEmployeeScopeFilter(filters, values, scope, 'p.employee_id');
    } else if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`p.company_id = $${values.length}`);
    } else {
      values.push(scope.companyIds);
      filters.push(`p.company_id = ANY($${values.length}::text[])`);
    }
    if (extra?.payslipId) {
      values.push(extra.payslipId);
      filters.push(`p.id = $${values.length}::uuid`);
    }
    if (extra?.periodId) {
      values.push(extra.periodId);
      filters.push(`p.period_id = $${values.length}::uuid`);
    }
    if (extra?.employeeId) {
      values.push(extra.employeeId);
      filters.push(`p.employee_id = $${values.length}::uuid`);
    }
    if (extra?.payrollGroupId) {
      values.push(extra.payrollGroupId);
      filters.push(`p.payroll_group_id = $${values.length}::uuid`);
    }
    if (extra?.essPublishedOnly) {
      filters.push(`p.published_to_ess = true`);
      filters.push(`p.status = 'published'`);
    }
    return { filters, values };
  }

  private async loadPayslipLinesForPayslip(payslipId: string) {
    const res = await this.db.query<{
      id: string;
      payslip_id: string;
      company_id: string;
      component_code: string;
      amount: string;
      sign: string;
      source_ref: string | null;
      formula_definition_id: string | null;
      sort_order: number;
      created_at: string;
      source_tier: string | null;
    }>(
      `
        SELECT
          id, payslip_id, company_id, component_code, amount::text AS amount,
          sign, source_ref, formula_definition_id::text AS formula_definition_id,
          sort_order, created_at,
          source_tier
        FROM public.payroll_payslip_lines
        WHERE payslip_id = $1::uuid
        ORDER BY sort_order ASC, component_code ASC;
      `,
      [payslipId],
    );
    return res.rows.map((row) => this.mapPayslipLine(row));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-PR-05
   * SRS bước: Diễn biến #4 Tải phiếu · #5 Empty · #6 lọc phạm vi
   * TechSpec: §14.6 ref_srs FR-HRM-PR-05
   */
  async listPayslips(
    query: {
      company_id: string;
      period_id?: string;
      employee_id?: string;
      payroll_group_id?: string;
      page?: number | string;
      page_size?: number | string;
      pageSize?: number | string;
    },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    listOptions?: { essPublishedOnly?: boolean },
  ) {
    await this.ensureSchema();
    // Xử lý: Diễn biến #6 — chỉ phiếu trong ladder scope (không xem hộ).
    const { filters, values } = this.buildPayslipScopeFilters(
      authorization,
      query.company_id,
      scopeContext,
      {
        periodId: query.period_id,
        employeeId: query.employee_id,
        payrollGroupId: query.payroll_group_id,
        essPublishedOnly: listOptions?.essPublishedOnly,
      },
    );
    const res = await this.db.query<
      PayrollPayslipRow & {
        period_label: string;
        period_start_date: string;
        period_end_date: string;
      }
    >(
      `
        SELECT
          ${this.payslipSelectColumns()},
          pp.period_label,
          pp.start_date::text AS period_start_date,
          pp.end_date::text AS period_end_date
        FROM public.payroll_payslips p
        JOIN public.payroll_periods pp ON pp.id = p.period_id
        LEFT JOIN public.pay_payroll_group pg ON pg.id = p.payroll_group_id
        LEFT JOIN public.pay_termination_settlement pts ON pts.id = p.termination_settlement_id
        WHERE ${filters.join(' AND ')}
        ORDER BY pp.start_date DESC, p.employee_code ASC;
      `,
      values,
    );
    // Thành công: Diễn biến #4/#5 — total=0 = empty trung thực.
    const data = await Promise.all(
      res.rows.map(async (row) => {
        const gtgcDisplay = await this.enrichPayslipGtgcDisplay(
          row,
          row.period_end_date,
          row.company_id,
        );
        const siDisplay = await this.enrichPayslipSiDisplay(
          row,
          row.period_start_date,
          row.period_end_date,
          row.company_id,
        );
        const taxDisplay = await this.enrichPayslipTaxDisplay(
          row,
          row.period_end_date,
          row.company_id,
          authorization,
        );
        return {
          ...this.mapPayslip(row),
          ...gtgcDisplay,
          ...siDisplay,
          ...taxDisplay,
          period_label: row.period_label,
        };
      }),
    );
    return {
      total: data.length,
      data,
    };
  }

  /**
   * F-PAY-PAYSLIP-01 — GET by id + components/lines (Nest physical /payroll/payslips/:id).
   * Scope predicate ≡ listPayslips — out of scope → HRM-PAY-404 (no leak).
   */
  async getPayslipById(
    payslipId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    includeSegments = true,
  ) {
    await this.ensureSchema();
    const { filters, values } = this.buildPayslipScopeFilters(
      authorization,
      companyId,
      scopeContext,
      {
        payslipId,
      },
    );
    const res = await this.db.query<
      PayrollPayslipRow & {
        period_label: string;
        period_start_date: string;
        period_end_date: string;
      }
    >(
      `
        SELECT
          ${this.payslipSelectColumns()},
          pp.period_label,
          pp.start_date::text AS period_start_date,
          pp.end_date::text AS period_end_date,
          pp.company_id AS period_company_id
        FROM public.payroll_payslips p
        JOIN public.payroll_periods pp ON pp.id = p.period_id
        LEFT JOIN public.pay_payroll_group pg ON pg.id = p.payroll_group_id
        LEFT JOIN public.pay_termination_settlement pts ON pts.id = p.termination_settlement_id
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll payslip not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const lines = await this.loadPayslipLinesForPayslip(row.id);
    const segments =
      includeSegments !== false
        ? await this.payPayslipSplit().loadSplitSegmentsForPayslip(row.id)
        : [];
    const gtgcDisplay = await this.enrichPayslipGtgcDisplay(
      row,
      row.period_end_date,
      row.company_id,
    );
    const siDisplay = await this.enrichPayslipSiDisplay(
      row,
      row.period_start_date,
      row.period_end_date,
      row.company_id,
      lines as PaySrcResolvedLine[],
    );
    const taxDisplay = await this.enrichPayslipTaxDisplay(
      row,
      row.period_end_date,
      row.company_id,
      authorization,
    );
    return {
      ...this.mapPayslip(row),
      ...gtgcDisplay,
      ...siDisplay,
      ...taxDisplay,
      period_label: row.period_label,
      split: segments.length > 0,
      segmentCount: segments.length,
      /** F-PAY-PAYSLIP-01 Response: components[] */
      components: lines,
      /** Alias for QA OBS / FE consumers probing /lines shape */
      lines,
      segments,
    };
  }

  /**
   * F-PAY-PAYSLIP-01 lines slice — GET /payroll/payslips/:id/lines.
   * Reuses getPayslipById scope gate (404 when list would not return the header).
   */
  async listPayslipLines(
    payslipId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const payslip = await this.getPayslipById(
      payslipId,
      companyId,
      authorization,
      scopeContext,
    );
    return {
      payslip_id: payslip.id,
      company_id: payslip.company_id,
      total: payslip.lines.length,
      data: payslip.lines,
    };
  }

  private async ensureSalaryTemplateSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.salary_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_salary_templates_company_code UNIQUE (company_id, code)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_salary_template_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        component_id UUID NOT NULL,
        default_value NUMERIC NOT NULL DEFAULT 0,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async listSalaryTemplates(
    query: { company_id: string; status?: string },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }
    const res = await this.db.query<{
      id: string;
      company_id: string;
      code: string;
      name: string;
      description: string | null;
      is_default: boolean;
      status: string;
      created_at: string;
      updated_at: string;
    }>(
      `
        SELECT id, company_id, code, name, description, is_default, status, created_at, updated_at
        FROM public.salary_templates
        WHERE ${filters.join(' AND ')}
        ORDER BY is_default DESC, name ASC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createSalaryTemplate(
    payload: {
      company_id: string;
      code: string;
      name: string;
      description?: string;
      is_default?: boolean;
    },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    if (payload.is_default) {
      await this.db.query(
        `UPDATE public.salary_templates SET is_default = FALSE, updated_at = NOW() WHERE company_id = $1;`,
        [companyId],
      );
    }
    const res = await this.db.query(
      `
        INSERT INTO public.salary_templates (id, company_id, code, name, description, is_default, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING id, company_id, code, name, description, is_default, status, created_at, updated_at;
      `,
      [
        randomUUID(),
        companyId,
        payload.code.trim(),
        payload.name.trim(),
        payload.description ?? null,
        payload.is_default ?? false,
      ],
    );
    return res.rows[0];
  }

  async updateSalaryTemplate(
    templateId: string,
    payload: {
      company_id: string;
      code?: string;
      name?: string;
      description?: string;
      is_default?: boolean;
      status?: string;
    },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const existingRes = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new ApiException(
        'HRM-PAY-404',
        'Salary template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    if (payload.is_default) {
      await this.db.query(
        `UPDATE public.salary_templates SET is_default = FALSE, updated_at = NOW() WHERE company_id = $1;`,
        [existing.company_id],
      );
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.code != null) set('code', payload.code.trim());
    if (payload.name != null) set('name', payload.name.trim());
    if (payload.description !== undefined)
      set('description', payload.description ?? null);
    if (payload.is_default != null) set('is_default', payload.is_default);
    if (payload.status != null) set('status', payload.status);
    if (fields.length === 0) {
      const res = await this.db.query(
        `SELECT id, company_id, code, name, description, is_default, status, created_at, updated_at
         FROM public.salary_templates WHERE id = $1::uuid;`,
        [templateId],
      );
      return res.rows[0];
    }
    fields.push('updated_at = NOW()');
    values.push(templateId);
    const res = await this.db.query(
      `UPDATE public.salary_templates SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING id, company_id, code, name, description, is_default, status, created_at, updated_at;`,
      values,
    );
    return res.rows[0];
  }

  async deleteSalaryTemplate(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existingRes = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new ApiException(
        'HRM-PAY-404',
        'Salary template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-PAY-409',
    });
    await this.db.query(
      `DELETE FROM public.salary_templates WHERE id = $1::uuid;`,
      [templateId],
    );
    return { id: templateId };
  }

  async listSalaryTemplateComponents(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['stc.template_id = $1::uuid'];
    const values: unknown[] = [templateId];
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`stc.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`stc.company_id = ANY($${values.length}::text[])`);
    }
    const res = await this.db.query(
      `SELECT stc.*, sc.code AS component_code, sc.name AS component_name, sc.component_type, sc.nature, sc.value_type
       FROM public.hrm_salary_template_components stc
       LEFT JOIN public.salary_components sc ON sc.id = stc.component_id
       WHERE ${filters.join(' AND ')}
       ORDER BY stc.sort_order ASC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => ({
        id: row.id,
        template_id: row.template_id,
        component_id: row.component_id,
        default_value: Number(row.default_value ?? 0),
        is_required: Boolean(row.is_required),
        sort_order: Number(row.sort_order ?? 0),
        created_at: row.created_at,
        component: row.component_code
          ? {
              id: row.component_id,
              code: row.component_code,
              name: row.component_name,
              component_type: row.component_type,
              nature: row.nature,
              value_type: row.value_type,
            }
          : undefined,
      })),
    };
  }

  async addSalaryTemplateComponent(
    templateId: string,
    payload: {
      company_id: string;
      component_id: string;
      default_value?: number;
      is_required?: boolean;
      sort_order?: number;
    },
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.hrm_salary_template_components
        (id, template_id, company_id, component_id, default_value, is_required, sort_order)
       VALUES ($1, $2::uuid, $3, $4::uuid, $5, $6, $7) RETURNING *;`,
      [
        id,
        templateId,
        companyId,
        payload.component_id,
        payload.default_value ?? 0,
        payload.is_required ?? false,
        payload.sort_order ?? 0,
      ],
    );
    return res.rows[0];
  }

  async updateSalaryTemplateComponent(
    componentRowId: string,
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_salary_template_components WHERE id = $1::uuid LIMIT 1;`,
      [componentRowId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-STC-404',
      mismatchCode: 'HRM-STC-409',
    });
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const key of ['default_value', 'is_required', 'sort_order']) {
      if (payload[key] !== undefined) {
        values.push(payload[key]);
        fields.push(`${key} = $${values.length}`);
      }
    }
    values.push(componentRowId);
    const res = await this.db.query(
      `UPDATE public.hrm_salary_template_components SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  async removeSalaryTemplateComponent(
    componentRowId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSalaryTemplateSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.hrm_salary_template_components WHERE id = $1::uuid LIMIT 1;`,
      [componentRowId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-STC-404',
      mismatchCode: 'HRM-STC-409',
    });
    await this.db.query(
      `DELETE FROM public.hrm_salary_template_components WHERE id = $1::uuid;`,
      [componentRowId],
    );
    return { id: componentRowId };
  }

  async duplicateSalaryTemplate(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    const existing = await this.db.query(
      `SELECT * FROM public.salary_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Salary template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const copy = await this.createSalaryTemplate(
      {
        company_id: companyId,
        code: `${row.code}-copy`,
        name: `${row.name} (copy)`,
        description: row.description,
        is_default: false,
      },
      authorization,
    );
    const components = await this.listSalaryTemplateComponents(
      templateId,
      companyId,
      authorization,
    );
    for (const comp of components.data) {
      await this.addSalaryTemplateComponent(
        copy.id,
        {
          company_id: companyId,
          component_id: comp.component_id,
          default_value: comp.default_value,
          is_required: comp.is_required,
          sort_order: comp.sort_order,
        },
        authorization,
      );
    }
    return copy;
  }

  async upsertPayslip(input: {
    company_id: string;
    period_id: string;
    employee_id: string;
    employee_code: string;
    employee_name: string;
    gross_amount: number;
    deduction_amount: number;
    net_amount: number;
    status?: string;
    formula_definition_id?: string | null;
  }) {
    await this.ensureSchema();
    await this.payFormulas.ensureSchema();
    const res = await this.db.query<PayrollPayslipRow>(
      `
        INSERT INTO public.payroll_payslips (
          id, company_id, period_id, employee_id, employee_code, employee_name,
          gross_amount, deduction_amount, net_amount, status, formula_definition_id
        ) VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10, $11::uuid)
        ON CONFLICT (period_id, employee_id) DO UPDATE SET
          employee_code = EXCLUDED.employee_code,
          employee_name = EXCLUDED.employee_name,
          gross_amount = EXCLUDED.gross_amount,
          deduction_amount = EXCLUDED.deduction_amount,
          net_amount = EXCLUDED.net_amount,
          status = EXCLUDED.status,
          formula_definition_id = COALESCE(EXCLUDED.formula_definition_id, public.payroll_payslips.formula_definition_id),
          updated_at = NOW()
        RETURNING
          id, company_id, period_id, employee_id, employee_code, employee_name,
          gross_amount::text, deduction_amount::text, net_amount::text,
          currency, status, formula_definition_id::text AS formula_definition_id,
          created_at, updated_at;
      `,
      [
        randomUUID(),
        input.company_id,
        input.period_id,
        input.employee_id,
        input.employee_code,
        input.employee_name,
        input.gross_amount,
        input.deduction_amount,
        input.net_amount,
        input.status ?? 'processed',
        input.formula_definition_id ?? null,
      ],
    );
    return this.mapPayslip(res.rows[0]);
  }

  async listAdvanceRequests(
    query: ListAdvanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const params: unknown[] = [];
    const filters: string[] = [];
    pushCompanyIdFilter(filters, params, scope.companyIds);
    let sql = `SELECT ar.* FROM public.advance_requests ar WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND ar.status = $${params.length}`;
    }
    sql += ` ORDER BY ar.created_at DESC LIMIT 200`;
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createAdvanceRequest(
    body: CreateAdvanceRequestDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.advance_requests (
          id, company_id, name, salary_period, department, position, approval_steps, status
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7::jsonb, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.name.trim(),
        body.salary_period.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.approval_steps ? JSON.stringify(body.approval_steps) : null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-500',
        'Failed to create advance request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return row;
  }

  async listAdvanceRequestEmployees(
    requestId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const header = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(header, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `SELECT * FROM public.advance_request_employees WHERE request_id = $1::uuid ORDER BY created_at;`,
      [requestId],
    );
    return { total: res.rows.length, data: res.rows };
  }

  /**
   * F-PAY-ADV-EMP-01 — POST advance-request employees (product path for VAL-INP-ADV-01).
   * Only while request is pending; rolls employee_count / total_amount on header.
   */
  async createAdvanceRequestEmployee(
    requestId: string,
    body: {
      employee_id?: string;
      employee_code: string;
      employee_name: string;
      department?: string;
      position?: string;
      advance_amount: number;
      note?: string;
    },
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const header = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(header, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    if (!header || header.status !== 'pending') {
      throw new ApiException(
        'HRM-ADV-409',
        'Advance request employees can only be added while status is pending',
        HttpStatus.CONFLICT,
      );
    }
    const employeeCode = body.employee_code.trim();
    const employeeName = body.employee_name.trim();
    if (!employeeCode || !employeeName) {
      throw new ApiException(
        'HRM-VAL-400',
        'employee_code and employee_name are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const amount = Number(body.advance_amount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new ApiException(
        'HRM-VAL-400',
        'advance_amount must be a finite number ≥ 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.advance_request_employees (
          id, company_id, request_id, employee_id, employee_code, employee_name,
          department, position, advance_amount, note
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10
        )
        RETURNING *;
      `,
      [
        id,
        header.company_id,
        requestId,
        body.employee_id?.trim() || null,
        employeeCode,
        employeeName,
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        amount,
        body.note?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-500',
        'Failed to create advance request employee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.db.query(
      `
        UPDATE public.advance_requests
        SET employee_count = (
              SELECT COUNT(*)::int FROM public.advance_request_employees WHERE request_id = $1::uuid
            ),
            total_amount = (
              SELECT COALESCE(SUM(advance_amount), 0) FROM public.advance_request_employees WHERE request_id = $1::uuid
            ),
            updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [requestId],
    );
    return row;
  }

  private async loadAdvanceRequestScopeRow(
    requestId: string,
  ): Promise<{ company_id: string; status: string } | null> {
    const res = await this.db.query<{ company_id: string; status: string }>(
      `SELECT company_id, status FROM public.advance_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async approveAdvanceRequest(
    requestId: string,
    _body: DecideAdvanceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'approved',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-404',
        'Advance request not found or not pending',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async rejectAdvanceRequest(
    requestId: string,
    _body: DecideAdvanceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'rejected',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-404',
        'Advance request not found or not pending',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.payInputPack.archiveAdvanceBridgedLines(requestId);
    return row;
  }

  async markAdvanceRequestPaid(
    requestId: string,
    body: {
      reviewer_name: string;
      reviewer_employee_id?: string;
      rejected_reason?: string;
      payrollPeriodId?: string;
      componentCode?: string;
    },
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.advance_requests
        SET status = 'paid',
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'approved'
        RETURNING *;
      `,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ADV-404',
        'Advance request not found or not approved',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!body.payrollPeriodId) {
      throw new ApiException(
        'HRM-VAL-400',
        'payrollPeriodId required for advance bridge to period input pack',
        HttpStatus.BAD_REQUEST,
      );
    }
    const bridge = await this.payInputPack.bridgeAdvanceRequestToPeriod({
      requestId,
      payrollPeriodId: body.payrollPeriodId,
      componentCode: body.componentCode,
      requestedCompanyId,
      authorization,
      tenantId,
    });
    return {
      ...row,
      bridgedInputLineIds: bridge.bridgedInputLineIds,
      failedEmployees: bridge.failedEmployees,
    };
  }

  async bridgeAdvanceRequestToPeriod(
    requestId: string,
    body: { payrollPeriodId: string; componentCode?: string },
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const existing = await this.loadAdvanceRequestScopeRow(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ADV-404',
      mismatchCode: 'HRM-ADV-409',
    });
    const status = String(existing?.status ?? '');
    if (status !== 'paid' && status !== 'approved') {
      throw new ApiException(
        'HRM-ADV-404',
        'Advance request must be paid or approved for payroll bridge',
        HttpStatus.CONFLICT,
      );
    }
    return this.payInputPack.bridgeAdvanceRequestToPeriod({
      requestId,
      payrollPeriodId: body.payrollPeriodId,
      componentCode: body.componentCode,
      requestedCompanyId,
      authorization,
      tenantId,
    });
  }
}
