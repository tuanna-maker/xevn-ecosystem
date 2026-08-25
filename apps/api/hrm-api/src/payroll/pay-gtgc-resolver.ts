/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — F-PAY-GTCG-01 internal resolver
 * UC:         FR-UC-BP-PAY-03 Diễn biến #2
 * Purpose:    Đếm NPT thuế tại as_of · tính gtgc_amount_vnd từ CFG · nạp bag
 * WorkItem:   PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01
 * must_keep:  F-CORE-DEP-01 ONE SoT · payroll_e2e_ready=false · cấm segment gtgc
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { expandCbReadCompanyIds } from './pay-formula-variable-bag';
import { normalizePayrollAsOfDate } from './pay-src-resolver';
import { HRM_PAY_GTCG_412 } from './pay-gtgc.constants';
import {
  ensurePayGtgcStatutoryCfgSchema,
  pickPayGtgcStatutoryCfgAtAsOf,
} from './pay-gtgc-statutory-cfg';

export type PayGtgcResolveOk = {
  ok: true;
  as_of: string;
  dependents_count: number;
  gtgc_amount_vnd: number;
  cfg_id: string;
  employee_company_id: string;
};

export type PayGtgcResolveBlocked = {
  ok: false;
  code: typeof HRM_PAY_GTCG_412;
  message: string;
  as_of: string;
  company_id: string;
};

export async function ensurePayrollPayslipsGtgcColumn(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS gtgc_amount NUMERIC(15,2) NULL;
  `);
}

export async function countEligibleTaxDependents(
  db: HrmDbService,
  input: { employeeId: string; employeeCompanyId: string; asOf: string },
): Promise<number> {
  const asOf = normalizePayrollAsOfDate(input.asOf);
  const res = await db.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM public.employee_dependents d
      WHERE d.employee_id = $1::uuid
        AND d.company_id = $2
        AND d.archived_at IS NULL
        AND d.is_tax_dependent = TRUE
        AND (d.effective_from IS NULL OR d.effective_from::date <= $3::date)
        AND (d.effective_to IS NULL OR d.effective_to::date >= $3::date);
    `,
    [input.employeeId, input.employeeCompanyId, asOf],
  );
  return Number(res.rows[0]?.count ?? 0);
}

async function resolveEmployeeCompanyId(
  db: HrmDbService,
  employeeId: string,
): Promise<string | null> {
  const res = await db.query<{ company_id: string }>(
    `
      SELECT e.company_id::text AS company_id
      FROM public.employees e
      WHERE e.id = $1::uuid
        AND e.archived_at IS NULL
      LIMIT 1;
    `,
    [employeeId],
  );
  return res.rows[0]?.company_id?.trim() || null;
}

function toMoney(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * F-PAY-GTCG-01 — RESOLVE + AMOUNT + BAG slice (throws HRM-PAY-GTCG-412 when CFG missing).
 */
export async function resolvePayGtgcForEmployee(
  db: HrmDbService,
  input: {
    periodCompanyId: string;
    employeeId: string;
    asOf: string;
    failOnMissingCfg?: boolean;
  },
): Promise<PayGtgcResolveOk | PayGtgcResolveBlocked> {
  await ensurePayGtgcStatutoryCfgSchema(db);
  const asOf = normalizePayrollAsOfDate(input.asOf);
  const employeeCompanyId = await resolveEmployeeCompanyId(
    db,
    input.employeeId,
  );
  if (!employeeCompanyId) {
    return {
      ok: false,
      code: HRM_PAY_GTCG_412,
      message:
        'Không tìm thấy công ty gắn nhân viên để đọc người phụ thuộc thuế',
      as_of: asOf,
      company_id: input.periodCompanyId,
    };
  }

  const eligibleCount = await countEligibleTaxDependents(db, {
    employeeId: input.employeeId,
    employeeCompanyId,
    asOf,
  });

  const cfgCompanyIds = expandCbReadCompanyIds(
    input.periodCompanyId,
    employeeCompanyId,
  );
  let cfg: Awaited<ReturnType<typeof pickPayGtgcStatutoryCfgAtAsOf>> = null;
  for (const co of cfgCompanyIds) {
    cfg = await pickPayGtgcStatutoryCfgAtAsOf(db, { companyId: co, asOf });
    if (cfg) break;
  }

  if (!cfg) {
    const blocked: PayGtgcResolveBlocked = {
      ok: false,
      code: HRM_PAY_GTCG_412,
      message:
        'Chưa cấu hình mức giảm trừ gia cảnh statutory tại ngày cuối kỳ — bổ sung pay_gtgc_statutory_cfg',
      as_of: asOf,
      company_id: input.periodCompanyId,
    };
    if (input.failOnMissingCfg) {
      throw new ApiException(
        HRM_PAY_GTCG_412,
        blocked.message,
        HttpStatus.PRECONDITION_FAILED,
        {
          code: HRM_PAY_GTCG_412,
          as_of: asOf,
          company_id: input.periodCompanyId,
          payroll_e2e_ready: false,
        },
      );
    }
    return blocked;
  }

  const selfAmt = toMoney(cfg.gtgc_self_amount);
  const perDep = toMoney(cfg.gtgc_per_dependent_amount);
  const gtgcAmountVnd = toMoney(selfAmt + eligibleCount * perDep);

  return {
    ok: true,
    as_of: asOf,
    dependents_count: eligibleCount,
    gtgc_amount_vnd: gtgcAmountVnd,
    cfg_id: cfg.id,
    employee_company_id: employeeCompanyId,
  };
}

/** Merge GTCG vars into formula bag (after F-PAY-CB-READ-01). */
export async function injectPayGtgcIntoVariableBag(
  db: HrmDbService,
  input: {
    periodCompanyId: string;
    employeeId: string;
    asOf: string;
    vars: Record<string, number>;
    warnings: string[];
  },
): Promise<
  | { injected: true; snapshot: PayGtgcResolveOk }
  | { injected: false; blocked: PayGtgcResolveBlocked }
> {
  const resolved = await resolvePayGtgcForEmployee(db, {
    periodCompanyId: input.periodCompanyId,
    employeeId: input.employeeId,
    asOf: input.asOf,
    failOnMissingCfg: false,
  });
  if (!resolved.ok) {
    return { injected: false, blocked: resolved };
  }
  input.vars.dependents_count = resolved.dependents_count;
  input.vars.gtgc_amount_vnd = resolved.gtgc_amount_vnd;
  input.warnings.push('F-PAY-GTCG-01:INJECTED');
  input.warnings.push(`GTCG_CFG:${resolved.cfg_id}`);
  return { injected: true, snapshot: resolved };
}
