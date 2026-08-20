/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Thứ tự quỹ nghỉ ốm + phân nhánh ngày ốm
 * UC:         FR-UC-BP-ATT-07 · BR-BP-LV-04 · DV-16
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md §4.7–§4.8
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md §6.1 · §6.2
 * Purpose:    ensureSchema fund-order + day-branch; GET/PUT policy; allocator on sick submit/approve;
 *             void branches on reject/cancel; annual-branch pending_days only (≠ sick panel bucket).
 * WorkItem:   PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01
 * Coded:      2026-08-10
 * Callers:    attendance.controller · LeaveRequestsService sick hooks
 * must_keep:  pending_days RETAIN · DENY att_leave_hold · DENY merge compensatory→annual · ATT06QC1
 * SOLID:      Policy/allocator tách LeaveRequestsService; pure allocate* for jest
 * LastVerified: po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  type HrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { expandLeaveDateRange } from './leave-attendance-funnel.service';
import {
  DEFAULT_OVER_INSURANCE_ACTION,
  DEFAULT_SICK_FUND_SEQUENCE,
  HRM_ATT_SICK_DV16_DAY,
  HRM_ATT_SICK_FUND_ORDER_INVALID,
  SICK_DAY_BRANCH_CODES,
  SICK_FUND_SEQUENCE_TOKENS,
  type SickDayBranchCode,
  type SickFundSequenceToken,
} from './att-sick-leave-fund-order.constants';
import type { PutSickLeaveFundOrderDto } from './dto/att-sick-leave-fund-order.dto';
import { MVP_LEAVE_BALANCE_TYPES } from './leave-balance.service';

type FundOrderRow = {
  id: string;
  company_id: string;
  fund_sequence: string[] | null;
  annual_first_enabled: boolean;
  insurance_day_cap: string | number | null;
  over_insurance_action: string | null;
  status: string;
  effective_from: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SickLeaveFundOrderDisplay = {
  companyId: string;
  fundSequence: string[];
  annualFirstEnabled: boolean;
  insuranceDayCap: number | null;
  overInsuranceAction: 'company_topup' | 'unpaid' | null;
  status: string;
  effectiveFrom: string | null;
  updatedAt: string | null;
  policyId: string | null;
  isProgramDefault: boolean;
};

export type SickDayBranchDisplay = {
  calendarDate: string;
  branchCode: SickDayBranchCode;
  deductUnits: number;
  sheetDayCode?: string | null;
};

export type SickLeaveTypeFlags = {
  insuranceRegimeFlag: boolean;
  companyTopupFlag: boolean;
};

export type AllocateSickDayBranchesInput = {
  startDate: string;
  endDate: string;
  fundSequence: SickFundSequenceToken[];
  annualFirstEnabled: boolean;
  insuranceDayCap: number | null;
  overInsuranceAction: 'company_topup' | 'unpaid';
  typeFlags: SickLeaveTypeFlags;
  deductUnitsPerDay?: number;
};

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fundTokenToBranch(token: SickFundSequenceToken): SickDayBranchCode {
  if (token === 'company') return 'company_topup';
  return token;
}

/** Validate fund sequence tokens — throws ApiException shape for service; returns normalized tokens for pure fn. */
export function normalizeFundSequence(raw: string[]): SickFundSequenceToken[] {
  const tokens = raw.map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.length < 1) {
    throw new ApiException(
      HRM_ATT_SICK_FUND_ORDER_INVALID,
      'fund_sequence must contain at least one token',
      HttpStatus.CONFLICT,
    );
  }
  const seen = new Set<string>();
  for (const t of tokens) {
    if (!(SICK_FUND_SEQUENCE_TOKENS as readonly string[]).includes(t)) {
      throw new ApiException(
        HRM_ATT_SICK_FUND_ORDER_INVALID,
        `Unknown fund_sequence token: ${t}`,
        HttpStatus.CONFLICT,
      );
    }
    if (seen.has(t)) {
      throw new ApiException(
        HRM_ATT_SICK_FUND_ORDER_INVALID,
        'fund_sequence must not contain duplicate tokens',
        HttpStatus.CONFLICT,
      );
    }
    seen.add(t);
  }
  return tokens as SickFundSequenceToken[];
}

/**
 * BR-BP-LV-04 allocator — one branch per calendar day in inclusive span.
 * Insurance cap counts allocated insurance days across the request; post-cap uses overInsuranceAction.
 */
export function allocateSickDayBranches(
  input: AllocateSickDayBranchesInput,
): SickDayBranchDisplay[] {
  const dates = expandLeaveDateRange(input.startDate, input.endDate);
  const units = input.deductUnitsPerDay ?? 1;
  const seq = input.fundSequence.length
    ? input.fundSequence
    : [...DEFAULT_SICK_FUND_SEQUENCE];
  const cap =
    input.insuranceDayCap != null && input.insuranceDayCap >= 0
      ? input.insuranceDayCap
      : null;
  const overAction = input.overInsuranceAction ?? DEFAULT_OVER_INSURANCE_ACTION;
  let insuranceDaysUsed = 0;
  const out: SickDayBranchDisplay[] = [];

  for (const calendarDate of dates) {
    let assigned: SickDayBranchCode | null = null;

    for (const token of seq) {
      if (token === 'annual') {
        const annualFirst = input.annualFirstEnabled || seq[0] === 'annual';
        if (annualFirst) {
          assigned = 'annual';
          break;
        }
        continue;
      }
      if (token === 'insurance') {
        if (!input.typeFlags.insuranceRegimeFlag) {
          continue;
        }
        if (cap != null && insuranceDaysUsed >= cap) {
          assigned = overAction;
          break;
        }
        assigned = 'insurance';
        insuranceDaysUsed += units;
        break;
      }
      if (token === 'company') {
        if (input.typeFlags.companyTopupFlag) {
          assigned = 'company_topup';
          break;
        }
        continue;
      }
      if (token === 'unpaid') {
        assigned = 'unpaid';
        break;
      }
    }

    if (!assigned) {
      assigned = 'unpaid';
    }
    out.push({
      calendarDate,
      branchCode: assigned,
      deductUnits: units,
    });
  }

  return out;
}

@Injectable()
export class AttSickLeaveFundOrderService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_sick_leave_fund_order (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        fund_sequence TEXT[] NOT NULL,
        annual_first_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        insurance_day_cap NUMERIC(5,1) NULL,
        over_insurance_action TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        effective_from DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_sick_leave_fund_order_company_active
        ON public.att_sick_leave_fund_order (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_sick_leave_fund_order
          DROP CONSTRAINT IF EXISTS chk_att_sick_fund_order_status;
        ALTER TABLE public.att_sick_leave_fund_order
          ADD CONSTRAINT chk_att_sick_fund_order_status
          CHECK (status IN ('active', 'retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_sick_leave_fund_order
          DROP CONSTRAINT IF EXISTS chk_att_sick_fund_over_action;
        ALTER TABLE public.att_sick_leave_fund_order
          ADD CONSTRAINT chk_att_sick_fund_over_action
          CHECK (
            insurance_day_cap IS NULL
            OR over_insurance_action IN ('company_topup', 'unpaid')
          );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_sick_leave_day_branch (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        leave_request_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        calendar_date DATE NOT NULL,
        branch_code TEXT NOT NULL,
        deduct_units NUMERIC(5,2) NOT NULL DEFAULT 1,
        sheet_day_code TEXT NULL,
        allocator_version TEXT NULL,
        ledger_status TEXT NOT NULL DEFAULT 'allocated',
        void_reason TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_sick_leave_day_branch
          DROP CONSTRAINT IF EXISTS chk_att_sick_day_branch_code;
        ALTER TABLE public.att_sick_leave_day_branch
          ADD CONSTRAINT chk_att_sick_day_branch_code
          CHECK (branch_code IN ('annual', 'insurance', 'company_topup', 'unpaid'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_sick_leave_day_branch
          DROP CONSTRAINT IF EXISTS chk_att_sick_day_branch_ledger;
        ALTER TABLE public.att_sick_leave_day_branch
          ADD CONSTRAINT chk_att_sick_day_branch_ledger
          CHECK (ledger_status IN ('allocated', 'void'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_sick_leave_day_branch_request_date
        ON public.att_sick_leave_day_branch (leave_request_id, calendar_date)
        WHERE ledger_status = 'allocated';
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_sick_leave_day_branch_employee_date
        ON public.att_sick_leave_day_branch (employee_id, calendar_date);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_sick_leave_day_branch_request
        ON public.att_sick_leave_day_branch (leave_request_id);
    `);
    this.schemaReady = true;
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string | undefined,
    tenantId?: string,
  ): { scope: HrmListScope; companyKeys: string[]; persistCompanyId: string } {
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      requestedCompanyId ?? '',
    );
    const scope = resolveHrmListScope(authorization, persistCompanyId, {
      tenantId,
    });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, companyKeys, persistCompanyId };
  }

  private displayPolicy(
    row: FundOrderRow | null,
    companyId: string,
  ): SickLeaveFundOrderDisplay {
    if (!row) {
      return {
        companyId,
        fundSequence: [...DEFAULT_SICK_FUND_SEQUENCE],
        annualFirstEnabled: false,
        insuranceDayCap: null,
        overInsuranceAction: null,
        status: 'active',
        effectiveFrom: null,
        updatedAt: null,
        policyId: null,
        isProgramDefault: true,
      };
    }
    const seq = Array.isArray(row.fund_sequence)
      ? row.fund_sequence.map((s) => String(s).trim().toLowerCase())
      : [...DEFAULT_SICK_FUND_SEQUENCE];
    const over = row.over_insurance_action?.trim().toLowerCase();
    return {
      companyId: row.company_id,
      fundSequence: seq,
      annualFirstEnabled: row.annual_first_enabled,
      insuranceDayCap:
        row.insurance_day_cap == null ? null : toNum(row.insurance_day_cap),
      overInsuranceAction:
        over === 'unpaid' || over === 'company_topup' ? over : null,
      status: row.status,
      effectiveFrom: row.effective_from,
      updatedAt: row.updated_at,
      policyId: row.id,
      isProgramDefault: false,
    };
  }

  async getFundOrder(
    companyId: string | undefined,
    authorization?: string,
    tenantId?: string,
  ): Promise<SickLeaveFundOrderDisplay> {
    await this.ensureSchema();
    const { scope, companyKeys, persistCompanyId } = this.resolveScope(
      authorization,
      companyId,
      tenantId,
    );
    const res = await this.db.query<FundOrderRow>(
      `
        SELECT id, company_id, fund_sequence, annual_first_enabled, insurance_day_cap,
               over_insurance_action, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_sick_leave_fund_order
        WHERE company_id = ANY($1::text[])
          AND archived_at IS NULL
          AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1;
      `,
      [companyKeys],
    );
    const row = res.rows[0] ?? null;
    if (row) {
      assertResourceInHrmScope({ company_id: row.company_id }, scope, {
        notFoundCode: 'HRM-SCOPE-409',
        mismatchCode: 'HRM-SCOPE-409',
      });
    }
    return this.displayPolicy(row, row?.company_id ?? persistCompanyId);
  }

  async putFundOrder(
    body: PutSickLeaveFundOrderDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<SickLeaveFundOrderDisplay> {
    await this.ensureSchema();
    const fundSequence = normalizeFundSequence(body.fund_sequence);
    const cap =
      body.insurance_day_cap === undefined || body.insurance_day_cap === null
        ? null
        : toNum(body.insurance_day_cap);
    if (cap != null && !body.over_insurance_action) {
      throw new ApiException(
        HRM_ATT_SICK_FUND_ORDER_INVALID,
        'over_insurance_action required when insurance_day_cap is set',
        HttpStatus.CONFLICT,
      );
    }
    const overAction = body.over_insurance_action ?? null;
    const { scope, persistCompanyId } = this.resolveScope(
      authorization,
      body.company_id,
      tenantId,
    );
    const annualFirst = body.annual_first_enabled === true;

    const existing = await this.db.query<FundOrderRow>(
      `
        SELECT id, company_id, fund_sequence, annual_first_enabled, insurance_day_cap,
               over_insurance_action, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_sick_leave_fund_order
        WHERE company_id = $1
          AND archived_at IS NULL
          AND status = 'active'
        LIMIT 1;
      `,
      [persistCompanyId],
    );

    let row: FundOrderRow;
    if (existing.rows[0]) {
      assertResourceInHrmScope(
        { company_id: existing.rows[0].company_id },
        scope,
        {
          notFoundCode: 'HRM-SCOPE-409',
          mismatchCode: 'HRM-SCOPE-409',
        },
      );
      const upd = await this.db.query<FundOrderRow>(
        `
          UPDATE public.att_sick_leave_fund_order
          SET fund_sequence = $2::text[],
              annual_first_enabled = $3,
              insurance_day_cap = $4,
              over_insurance_action = $5,
              effective_from = COALESCE($6::date, effective_from),
              status = COALESCE($7, status),
              updated_at = NOW()
          WHERE id = $1::uuid
          RETURNING id, company_id, fund_sequence, annual_first_enabled, insurance_day_cap,
                    over_insurance_action, status, effective_from::text AS effective_from,
                    archived_at::text AS archived_at,
                    created_at::text AS created_at, updated_at::text AS updated_at;
        `,
        [
          existing.rows[0].id,
          fundSequence,
          annualFirst,
          cap,
          overAction,
          body.effective_from ?? null,
          body.status ?? 'active',
        ],
      );
      row = upd.rows[0]!;
    } else {
      const id = randomUUID();
      try {
        const ins = await this.db.query<FundOrderRow>(
          `
            INSERT INTO public.att_sick_leave_fund_order (
              id, company_id, fund_sequence, annual_first_enabled,
              insurance_day_cap, over_insurance_action, status, effective_from
            ) VALUES (
              $1::uuid, $2, $3::text[], $4, $5, $6, COALESCE($7, 'active'), $8::date
            )
            RETURNING id, company_id, fund_sequence, annual_first_enabled, insurance_day_cap,
                      over_insurance_action, status, effective_from::text AS effective_from,
                      archived_at::text AS archived_at,
                      created_at::text AS created_at, updated_at::text AS updated_at;
          `,
          [
            id,
            persistCompanyId,
            fundSequence,
            annualFirst,
            cap,
            overAction,
            body.status ?? 'active',
            body.effective_from ?? null,
          ],
        );
        row = ins.rows[0]!;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('uq_att_sick_leave_fund_order_company_active')) {
          throw new ApiException(
            HRM_ATT_SICK_FUND_ORDER_INVALID,
            'Active sick leave fund order already exists for company',
            HttpStatus.CONFLICT,
          );
        }
        throw e;
      }
    }
    return this.displayPolicy(row, row.company_id);
  }

  async loadActivePolicyForCompany(
    companyId: string,
  ): Promise<SickLeaveFundOrderDisplay> {
    await this.ensureSchema();
    const res = await this.db.query<FundOrderRow>(
      `
        SELECT id, company_id, fund_sequence, annual_first_enabled, insurance_day_cap,
               over_insurance_action, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_sick_leave_fund_order
        WHERE company_id = $1
          AND archived_at IS NULL
          AND status = 'active'
        LIMIT 1;
      `,
      [companyId],
    );
    return this.displayPolicy(res.rows[0] ?? null, companyId);
  }

  async listDayBranchesForRequest(
    leaveRequestId: string,
  ): Promise<SickDayBranchDisplay[]> {
    await this.ensureSchema();
    const res = await this.db.query<{
      calendar_date: string;
      branch_code: string;
      deduct_units: string | number;
      sheet_day_code: string | null;
    }>(
      `
        SELECT calendar_date::text AS calendar_date, branch_code, deduct_units, sheet_day_code
        FROM public.att_sick_leave_day_branch
        WHERE leave_request_id = $1::uuid
          AND ledger_status = 'allocated'
        ORDER BY calendar_date ASC;
      `,
      [leaveRequestId],
    );
    return res.rows.map((r) => ({
      calendarDate: r.calendar_date.slice(0, 10),
      branchCode: r.branch_code as SickDayBranchCode,
      deductUnits: toNum(r.deduct_units),
      sheetDayCode: r.sheet_day_code,
    }));
  }

  /**
   * Persist allocator rows on sick submit (post-VAL). Idempotent: skips if rows already allocated.
   */
  async allocateAndPersistSickDayBranches(input: {
    companyId: string;
    leaveRequestId: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    typeFlags: SickLeaveTypeFlags;
    deductUnitsPerDay?: number;
  }): Promise<SickDayBranchDisplay[]> {
    await this.ensureSchema();
    const existing = await this.listDayBranchesForRequest(input.leaveRequestId);
    if (existing.length > 0) {
      return existing;
    }
    const policy = await this.loadActivePolicyForCompany(input.companyId);
    const fundSequence = normalizeFundSequence(policy.fundSequence);
    const branches = allocateSickDayBranches({
      startDate: input.startDate,
      endDate: input.endDate,
      fundSequence,
      annualFirstEnabled: policy.annualFirstEnabled,
      insuranceDayCap: policy.insuranceDayCap,
      overInsuranceAction:
        policy.overInsuranceAction ?? DEFAULT_OVER_INSURANCE_ACTION,
      typeFlags: input.typeFlags,
      deductUnitsPerDay: input.deductUnitsPerDay ?? 1,
    });
    const allocatorVersion = policy.policyId ?? 'program-default';
    for (const b of branches) {
      try {
        await this.db.query(
          `
            INSERT INTO public.att_sick_leave_day_branch (
              company_id, leave_request_id, employee_id, calendar_date,
              branch_code, deduct_units, allocator_version, ledger_status
            ) VALUES (
              $1, $2::uuid, $3::uuid, $4::date, $5, $6, $7, 'allocated'
            );
          `,
          [
            input.companyId,
            input.leaveRequestId,
            input.employeeId,
            b.calendarDate,
            b.branchCode,
            b.deductUnits,
            allocatorVersion,
          ],
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('uq_att_sick_leave_day_branch_request_date')) {
          throw new ApiException(
            HRM_ATT_SICK_DV16_DAY,
            'Duplicate sick day branch for calendar date (DV-16)',
            HttpStatus.CONFLICT,
          );
        }
        throw e;
      }
    }
    return branches;
  }

  async voidDayBranchesForRequest(
    leaveRequestId: string,
    voidReason: string,
  ): Promise<void> {
    await this.ensureSchema();
    await this.db.query(
      `
        UPDATE public.att_sick_leave_day_branch
        SET ledger_status = 'void',
            void_reason = $2
        WHERE leave_request_id = $1::uuid
          AND ledger_status = 'allocated';
      `,
      [leaveRequestId, voidReason],
    );
  }

  /** Sum annual-branch units for pending_days hold on annual row only. */
  sumAnnualBranchUnits(branches: SickDayBranchDisplay[]): number {
    return branches
      .filter((b) => b.branchCode === 'annual')
      .reduce((acc, b) => acc + b.deductUnits, 0);
  }

  /** Regression guard — compensatory must remain a distinct panel key (ATT06QC1). */
  static assertMvpPanelKeysUnmerged(): void {
    const keys = MVP_LEAVE_BALANCE_TYPES.map((k) => k.toLowerCase());
    if (!keys.includes('compensatory')) {
      throw new Error(
        'compensatory bucket missing from MVP_LEAVE_BALANCE_TYPES',
      );
    }
    if (keys.includes('sick') || keys.includes('sick_leave')) {
      throw new Error('sick bucket must not appear on MVP panel');
    }
  }
}

export { fundTokenToBranch, SICK_DAY_BRANCH_CODES };
