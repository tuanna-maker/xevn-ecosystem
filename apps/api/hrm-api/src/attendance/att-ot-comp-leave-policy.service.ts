/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Chế độ phép bù OT + accrual on approve OT
 * UC:         FR-UC-BP-ATT-06 · BR-BP-LV-03 · AC-ATT-06-POLICY-TOGGLE · AC-ATT-06-ACCRUE-ENGINE
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md §4.6–§4.9
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md §5.1 · §5.2
 * API_DESIGN: GET/PUT ot-comp-leave-policy · F-ATT-OT-COMP-ACCRUE hook on approve
 * Purpose:    ensureSchema policy + accrual ledger; GET/PUT tenant toggle/ratio; idempotent credit
 *             on OT approve when policy ON + comp maps leave (≠ sheet close).
 * WorkItem:   PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01
 * Coded:      2026-08-10
 * Callers:    attendance.controller · attendance-requests.approveOvertimeRequest
 * Callees:    HrmDbService · resolveHrmListScope · expandHrmTextCompanyIds
 * BEChain:    ensureSchema → policy GET/PUT · withTransaction ledger+entitled_days
 * Impact:     Accrual on sheet close = sai SRS #1; invent att_leave_hold = FAIL ATT09;
 *             merge comp→annual = FAIL ATT05QC1
 * must_keep:  pending_days hold RETAIN · peer ATT seals · compensatory bucket separate
 * SOLID:      Policy/accrue tách OT TXN service; hook inject Optional
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-02
 * change_mode: FIX
 * What: Accrual upsert employee_leave_balances dùng employee.company_id partition (≠ chỉ OT row);
 *       read path expand main↔holding↔UUID ở LeaveBalanceService.
 * Why:  J-HRM-ATT-06-04 — credited_days 0.5 nhưng GET compensatory entitled 0 (partition mismatch).
 * must_keep: ledger company_id = OT row · DENY merge compensatory→annual · pending_days hold
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-03
 * change_mode: FIX
 * What: ensureSchema employee_leave_balances trước accrual; idempotent replay đồng bộ entitled từ ledger SUM;
 *       balance_key lowercase; repair ledger-without-balance (stale accrual build).
 * Why:  J-04 FAIL live — approve 201 + ledger nhưng GET source=default (BE-02 jest ≠ runtime).
 * must_keep: ledger company_id = OT row · ON CONFLICT entitled += credited (fresh path only)
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
import {
  ATT_OT_COMP_BALANCE_KEY_DEFAULT,
  ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES,
  HRM_ATT_OT_COMP_POLICY_CONFIG,
  HRM_ATT_OT_COMP_POLICY_CONFLICT,
  HRM_ATT_OT_COMP_POLICY_RATIO,
} from './att-ot-comp-leave-policy.constants';
import type { PutOtCompLeavePolicyDto } from './dto/att-ot-comp-leave-policy.dto';

type PolicyRow = {
  id: string;
  company_id: string;
  mode_enabled: boolean;
  hours_per_leave_day: string | number;
  comp_balance_key: string;
  maps_comp_codes: string[] | null;
  status: string;
  effective_from: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type LedgerRow = {
  id: string;
  company_id: string;
  overtime_request_id: string;
  employee_id: string;
  balance_year: number;
  compensation_type: string;
  ot_hours: string | number;
  hours_per_leave_day: string | number;
  credited_days: string | number;
  ledger_status: string;
  created_at: string;
};

export type OtCompLeavePolicyDisplay = {
  modeEnabled: boolean;
  hoursPerLeaveDay: number | null;
  compBalanceKey: string;
  mapsCompCodes: string[] | null;
  status: string;
  effectiveFrom: string | null;
  updatedAt: string | null;
  companyId: string;
};

export type OtCompAccrualResult = {
  credited_days: number;
  balance_year: number;
  ledger_id: string;
  idempotent_replay: boolean;
};

type OvertimeRowForAccrual = {
  id: string;
  company_id: string;
  employee_id: string;
  status: string;
  total_hours: string | number;
  compensation_type: string | null;
  overtime_date?: string | Date | null;
};

function calendarYearInHoChiMinh(ref?: Date): number {
  const d = ref ?? new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
  });
  return Number(fmt.format(d));
}

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Half-day step 0.5 aligned with employee_leave_balances NUMERIC(5,1). */
export function computeOtCompCreditedDays(
  otHours: number,
  hoursPerLeaveDay: number,
): number {
  if (hoursPerLeaveDay <= 0 || otHours <= 0) return 0;
  const raw = otHours / hoursPerLeaveDay;
  return Math.round(raw * 2) / 2;
}

@Injectable()
export class AttOtCompLeavePolicyService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_ot_comp_leave_policy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        mode_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        hours_per_leave_day NUMERIC(6, 2) NOT NULL DEFAULT 8,
        comp_balance_key TEXT NOT NULL DEFAULT 'compensatory',
        maps_comp_codes TEXT[] NULL,
        status TEXT NOT NULL DEFAULT 'active',
        effective_from DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_ot_comp_leave_policy_company_active
        ON public.att_ot_comp_leave_policy (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_comp_leave_policy
          DROP CONSTRAINT IF EXISTS chk_att_ot_comp_policy_balance_key;
        ALTER TABLE public.att_ot_comp_leave_policy
          ADD CONSTRAINT chk_att_ot_comp_policy_balance_key
          CHECK (comp_balance_key NOT IN ('annual', 'carry_over'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_comp_leave_policy
          DROP CONSTRAINT IF EXISTS chk_att_ot_comp_policy_status;
        ALTER TABLE public.att_ot_comp_leave_policy
          ADD CONSTRAINT chk_att_ot_comp_policy_status
          CHECK (status IN ('active', 'retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_ot_comp_accrual_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        overtime_request_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        balance_year INT NOT NULL,
        compensation_type TEXT NOT NULL,
        ot_hours NUMERIC(6, 2) NOT NULL,
        hours_per_leave_day NUMERIC(6, 2) NOT NULL,
        credited_days NUMERIC(5, 1) NOT NULL,
        ledger_status TEXT NOT NULL DEFAULT 'credited',
        reversal_reason TEXT NULL,
        reversed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_ot_comp_accrual_ledger_ot_credited
        ON public.att_ot_comp_accrual_ledger (company_id, overtime_request_id)
        WHERE ledger_status = 'credited';
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_comp_accrual_ledger_employee_year
        ON public.att_ot_comp_accrual_ledger (employee_id, balance_year);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    await this.db.query(`
      ALTER TABLE public.employee_leave_balances
        ADD COLUMN IF NOT EXISTS advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0;
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
    row: PolicyRow | null,
    companyId: string,
  ): OtCompLeavePolicyDisplay {
    if (!row) {
      return {
        modeEnabled: false,
        hoursPerLeaveDay: null,
        compBalanceKey: ATT_OT_COMP_BALANCE_KEY_DEFAULT,
        mapsCompCodes: null,
        status: 'active',
        effectiveFrom: null,
        updatedAt: null,
        companyId,
      };
    }
    return {
      modeEnabled: row.mode_enabled,
      hoursPerLeaveDay: row.mode_enabled
        ? toNum(row.hours_per_leave_day)
        : toNum(row.hours_per_leave_day) || null,
      compBalanceKey: row.comp_balance_key,
      mapsCompCodes: row.maps_comp_codes,
      status: row.status,
      effectiveFrom: row.effective_from,
      updatedAt: row.updated_at,
      companyId: row.company_id,
    };
  }

  async getPolicy(
    companyId: string | undefined,
    authorization?: string,
    tenantId?: string,
  ): Promise<OtCompLeavePolicyDisplay> {
    await this.ensureSchema();
    const { scope, companyKeys, persistCompanyId } = this.resolveScope(
      authorization,
      companyId,
      tenantId,
    );
    const res = await this.db.query<PolicyRow>(
      `
        SELECT id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
               maps_comp_codes, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_ot_comp_leave_policy
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

  async putPolicy(
    body: PutOtCompLeavePolicyDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<OtCompLeavePolicyDisplay> {
    await this.ensureSchema();
    const compKey = (
      body.comp_balance_key?.trim() || ATT_OT_COMP_BALANCE_KEY_DEFAULT
    ).toLowerCase();
    if (compKey === 'annual' || compKey === 'carry_over') {
      throw new ApiException(
        HRM_ATT_OT_COMP_POLICY_RATIO,
        'comp_balance_key must remain compensatory (not annual or carry_over)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.mode_enabled) {
      const ratio = body.hours_per_leave_day;
      if (ratio === null || ratio === undefined || ratio <= 0) {
        throw new ApiException(
          HRM_ATT_OT_COMP_POLICY_RATIO,
          'hours_per_leave_day must be > 0 when mode_enabled is true',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const { scope, persistCompanyId } = this.resolveScope(
      authorization,
      body.company_id,
      tenantId,
    );
    const hoursPerDay = body.mode_enabled
      ? toNum(body.hours_per_leave_day)
      : toNum(body.hours_per_leave_day ?? 8);

    const existing = await this.db.query<PolicyRow>(
      `
        SELECT id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
               maps_comp_codes, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_ot_comp_leave_policy
        WHERE company_id = $1
          AND archived_at IS NULL
          AND status = 'active'
        LIMIT 1;
      `,
      [persistCompanyId],
    );
    const mapsCodes = body.maps_comp_codes?.length
      ? body.maps_comp_codes.map((c) => c.trim().toLowerCase()).filter(Boolean)
      : null;

    let row: PolicyRow;
    if (existing.rows[0]) {
      assertResourceInHrmScope(
        { company_id: existing.rows[0].company_id },
        scope,
        {
          notFoundCode: 'HRM-SCOPE-409',
          mismatchCode: 'HRM-SCOPE-409',
        },
      );
      const upd = await this.db.query<PolicyRow>(
        `
          UPDATE public.att_ot_comp_leave_policy
          SET mode_enabled = $2,
              hours_per_leave_day = $3,
              comp_balance_key = $4,
              maps_comp_codes = $5,
              effective_from = COALESCE($6::date, effective_from),
              updated_at = NOW()
          WHERE id = $1::uuid
          RETURNING id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
                    maps_comp_codes, status, effective_from::text AS effective_from,
                    archived_at::text AS archived_at,
                    created_at::text AS created_at, updated_at::text AS updated_at;
        `,
        [
          existing.rows[0].id,
          body.mode_enabled,
          hoursPerDay,
          compKey,
          mapsCodes,
          body.effective_from ?? null,
        ],
      );
      row = upd.rows[0]!;
    } else {
      const id = randomUUID();
      try {
        const ins = await this.db.query<PolicyRow>(
          `
            INSERT INTO public.att_ot_comp_leave_policy (
              id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
              maps_comp_codes, status, effective_from
            ) VALUES (
              $1::uuid, $2, $3, $4, $5, $6, 'active', $7::date
            )
            RETURNING id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
                      maps_comp_codes, status, effective_from::text AS effective_from,
                      archived_at::text AS archived_at,
                      created_at::text AS created_at, updated_at::text AS updated_at;
          `,
          [
            id,
            persistCompanyId,
            body.mode_enabled,
            hoursPerDay,
            compKey,
            mapsCodes,
            body.effective_from ?? null,
          ],
        );
        row = ins.rows[0]!;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('uq_att_ot_comp_leave_policy_company_active')) {
          throw new ApiException(
            HRM_ATT_OT_COMP_POLICY_CONFLICT,
            'Active OT comp leave policy already exists for company',
            HttpStatus.CONFLICT,
          );
        }
        throw e;
      }
    }
    return this.displayPolicy(row, row.company_id);
  }

  private mapsToLeaveComp(
    compensationType: string | null | undefined,
    policy: PolicyRow | null,
  ): boolean {
    const code = (compensationType ?? '').trim().toLowerCase();
    if (!code) return false;
    if (policy?.maps_comp_codes?.length) {
      return policy.maps_comp_codes.map((c) => c.toLowerCase()).includes(code);
    }
    return (
      ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES as readonly string[]
    ).includes(code);
  }

  async loadActivePolicyForCompany(
    companyId: string,
  ): Promise<PolicyRow | null> {
    await this.ensureSchema();
    const res = await this.db.query<PolicyRow>(
      `
        SELECT id, company_id, mode_enabled, hours_per_leave_day, comp_balance_key,
               maps_comp_codes, status, effective_from::text AS effective_from,
               archived_at::text AS archived_at,
               created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.att_ot_comp_leave_policy
        WHERE company_id = $1
          AND archived_at IS NULL
          AND status = 'active'
        LIMIT 1;
      `,
      [companyId],
    );
    return res.rows[0] ?? null;
  }

  async findCreditedLedger(
    companyId: string,
    overtimeRequestId: string,
  ): Promise<LedgerRow | null> {
    await this.ensureSchema();
    const res = await this.db.query<LedgerRow>(
      `
        SELECT id, company_id, overtime_request_id, employee_id, balance_year,
               compensation_type, ot_hours, hours_per_leave_day, credited_days,
               ledger_status, created_at::text AS created_at
        FROM public.att_ot_comp_accrual_ledger
        WHERE company_id = $1
          AND overtime_request_id = $2::uuid
          AND ledger_status = 'credited'
        LIMIT 1;
      `,
      [companyId, overtimeRequestId],
    );
    return res.rows[0] ?? null;
  }

  /** Partition key for employee_leave_balances — aligns with LeaveBalanceService read path. */
  private async loadEmployeeBalancePartitionCompanyId(
    employeeId: string,
  ): Promise<string | null> {
    const res = await this.db.query<{ company_id: string }>(
      `
        SELECT company_id
        FROM public.employees
        WHERE id = $1::uuid
          AND archived_at IS NULL
        LIMIT 1;
      `,
      [employeeId],
    );
    const row = res.rows[0];
    return row?.company_id?.trim() ? row.company_id.trim() : null;
  }

  /**
   * When ledger rows exist but employee_leave_balances entitled lags (stale accrual / idempotent replay),
   * top up entitled to ledger SUM without double-counting on repeated approve.
   */
  private async syncLeaveBalanceEntitledFromLedgerSum(
    partitionCompanyId: string,
    employeeId: string,
    balanceKey: string,
    balanceYear: number,
  ): Promise<void> {
    await this.ensureSchema();
    const sumRes = await this.db.query<{ total: string }>(
      `
        SELECT COALESCE(SUM(credited_days), 0)::text AS total
        FROM public.att_ot_comp_accrual_ledger
        WHERE employee_id = $1::uuid
          AND balance_year = $2
          AND ledger_status = 'credited';
      `,
      [employeeId, balanceYear],
    );
    const ledgerTotal = toNum(sumRes.rows[0]?.total);
    if (ledgerTotal <= 0) {
      return;
    }
    const balRes = await this.db.query<{ entitled_days: string }>(
      `
        SELECT entitled_days::text
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND lower(leave_type) = lower($3)
          AND balance_year = $4
        LIMIT 1;
      `,
      [partitionCompanyId, employeeId, balanceKey, balanceYear],
    );
    const currentEntitled = balRes.rows[0]
      ? toNum(balRes.rows[0].entitled_days)
      : 0;
    if (currentEntitled >= ledgerTotal) {
      return;
    }
    const delta = Math.round((ledgerTotal - currentEntitled) * 2) / 2;
    if (delta <= 0) {
      return;
    }
    await this.db.query(
      `
        INSERT INTO public.employee_leave_balances (
          company_id, employee_id, leave_type, balance_year,
          entitled_days, used_days, pending_days, updated_at
        ) VALUES (
          $1, $2::uuid, $3, $4, $5, 0, 0, NOW()
        )
        ON CONFLICT (company_id, employee_id, leave_type, balance_year)
        DO UPDATE SET
          entitled_days = employee_leave_balances.entitled_days + EXCLUDED.entitled_days,
          updated_at = NOW();
      `,
      [partitionCompanyId, employeeId, balanceKey, balanceYear, delta],
    );
  }

  /**
   * F-ATT-OT-COMP-ACCRUE — side-effect after OT approved (≠ sheet close).
   * Returns null when mode OFF or comp type not mapped (not an error).
   */
  async accrueOnApprovedOvertime(
    ot: OvertimeRowForAccrual,
  ): Promise<OtCompAccrualResult | null> {
    if (ot.status !== 'approved') {
      return null;
    }
    const policy = await this.loadActivePolicyForCompany(ot.company_id);
    if (!policy?.mode_enabled) {
      return null;
    }
    if (!this.mapsToLeaveComp(ot.compensation_type, policy)) {
      return null;
    }
    const hoursPerDay = toNum(policy.hours_per_leave_day);
    if (hoursPerDay <= 0) {
      throw new ApiException(
        HRM_ATT_OT_COMP_POLICY_CONFIG,
        'OT comp leave policy ratio invalid while mode is enabled',
        HttpStatus.CONFLICT,
      );
    }
    const existing = await this.findCreditedLedger(ot.company_id, ot.id);
    const balanceKey = (
      policy.comp_balance_key || ATT_OT_COMP_BALANCE_KEY_DEFAULT
    )
      .trim()
      .toLowerCase();
    const balancePartitionCompanyId =
      (await this.loadEmployeeBalancePartitionCompanyId(ot.employee_id)) ??
      ot.company_id;

    if (existing) {
      await this.syncLeaveBalanceEntitledFromLedgerSum(
        balancePartitionCompanyId,
        ot.employee_id,
        balanceKey,
        existing.balance_year,
      );
      return {
        credited_days: toNum(existing.credited_days),
        balance_year: existing.balance_year,
        ledger_id: existing.id,
        idempotent_replay: true,
      };
    }
    const otHours = toNum(ot.total_hours);
    const creditedDays = computeOtCompCreditedDays(otHours, hoursPerDay);
    if (creditedDays <= 0) {
      return null;
    }
    const otDate =
      ot.overtime_date instanceof Date
        ? ot.overtime_date
        : ot.overtime_date
          ? new Date(ot.overtime_date)
          : new Date();
    const balanceYear = calendarYearInHoChiMinh(otDate);
    const compType =
      (ot.compensation_type ?? '').trim() || 'compensatory_leave';

    const accrualResult = await this.db.withTransaction(async (query) => {
      const ledgerId = randomUUID();
      try {
        await query(
          `
            INSERT INTO public.att_ot_comp_accrual_ledger (
              id, company_id, overtime_request_id, employee_id, balance_year,
              compensation_type, ot_hours, hours_per_leave_day, credited_days, ledger_status
            ) VALUES (
              $1::uuid, $2, $3::uuid, $4::uuid, $5,
              $6, $7, $8, $9, 'credited'
            );
          `,
          [
            ledgerId,
            ot.company_id,
            ot.id,
            ot.employee_id,
            balanceYear,
            compType,
            otHours,
            hoursPerDay,
            creditedDays,
          ],
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('uq_att_ot_comp_accrual_ledger_ot_credited')) {
          const replay = await this.findCreditedLedger(ot.company_id, ot.id);
          if (replay) {
            await this.syncLeaveBalanceEntitledFromLedgerSum(
              balancePartitionCompanyId,
              ot.employee_id,
              balanceKey,
              replay.balance_year,
            );
            return {
              credited_days: toNum(replay.credited_days),
              balance_year: replay.balance_year,
              ledger_id: replay.id,
              idempotent_replay: true,
            };
          }
        }
        throw e;
      }
      await query(
        `
          INSERT INTO public.employee_leave_balances (
            company_id, employee_id, leave_type, balance_year,
            entitled_days, used_days, pending_days, updated_at
          ) VALUES (
            $1, $2::uuid, $3, $4, $5, 0, 0, NOW()
          )
          ON CONFLICT (company_id, employee_id, leave_type, balance_year)
          DO UPDATE SET
            entitled_days = employee_leave_balances.entitled_days + EXCLUDED.entitled_days,
            updated_at = NOW();
        `,
        [
          balancePartitionCompanyId,
          ot.employee_id,
          balanceKey,
          balanceYear,
          creditedDays,
        ],
      );
      return {
        credited_days: creditedDays,
        balance_year: balanceYear,
        ledger_id: ledgerId,
        idempotent_replay: false,
      };
    });
    await this.syncLeaveBalanceEntitledFromLedgerSum(
      balancePartitionCompanyId,
      ot.employee_id,
      balanceKey,
      accrualResult.balance_year,
    );
    return accrualResult;
  }
}
