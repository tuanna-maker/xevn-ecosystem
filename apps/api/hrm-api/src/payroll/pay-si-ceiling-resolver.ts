/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — F-PAY-SI-CEILING-01 internal resolver
 * UC:         FR-UC-BP-PAY-05 Diễn biến #1–#2
 * Purpose:    Gộp is_insurance_base · pick CFG · min(base, ceiling) một lần · ghi si_* header
 * WorkItem:   PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01
 * must_keep:  payroll_e2e_ready=false · cấm segment si_* · HRM-SET-SI-412-MISSING fail-closed
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_SET_SI_412_MISSING } from '../settings/settings-defaults.constants';
import { expandCbReadCompanyIds } from './pay-formula-variable-bag';
import type { PaySrcResolvedLine } from './pay-src-resolver';

export type PaySiCeilingOk = {
  ok: true;
  merged_insurance_base_vnd: number;
  ceiling_amount_vnd: number | null;
  si_employee_amount_vnd: number;
  si_employer_amount_vnd: number;
  enrolled_type_keys: string[];
};

export type PaySiCeilingBlocked = {
  ok: false;
  code: typeof HRM_SET_SI_412_MISSING;
  message: string;
  insurance_type_key?: string;
  company_id: string;
  period_end: string;
};

type RateCfgRow = {
  id: string;
  employee_rate_pct: string | number;
  employer_rate_pct: string | number;
  ceiling_amount: string | number | null;
};

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toMoney(raw: string | number | null | undefined): number {
  if (raw == null || raw === '') return 0;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? roundMoney(n) : 0;
}

export async function ensurePayrollPayslipsSiColumns(db: HrmDbService): Promise<void> {
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS si_employee_amount NUMERIC(15,2) NULL;
  `);
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS si_employer_amount NUMERIC(15,2) NULL;
  `);
}

/** Sum merged period lines where salary_components.is_insurance_base = true (post-split). */
export async function sumMergedInsuranceBaseFromLines(
  db: HrmDbService,
  input: { companyId: string; lines: PaySrcResolvedLine[] },
): Promise<number> {
  const codes = [...new Set(input.lines.map((l) => String(l.component_code ?? '').trim()).filter(Boolean))];
  if (codes.length === 0) return 0;

  const companyIds = expandCbReadCompanyIds(input.companyId, null);
  const flagRes = await db.query<{ code: string; is_insurance_base: boolean }>(
    `
      SELECT lower(code) AS code, BOOL_OR(is_insurance_base) AS is_insurance_base
      FROM public.salary_components
      WHERE company_id = ANY($1::text[])
        AND lower(code) = ANY($2::text[])
        AND archived_at IS NULL
      GROUP BY lower(code);
    `,
    [companyIds, codes.map((c) => c.toLowerCase())],
  );
  const insuranceBase = new Map<string, boolean>();
  for (const row of flagRes.rows) {
    insuranceBase.set(row.code, Boolean(row.is_insurance_base));
  }

  let total = 0;
  for (const line of input.lines) {
    const code = String(line.component_code ?? '').trim();
    if (!code) continue;
    if (!insuranceBase.get(code.toLowerCase())) continue;
    const sign = String(line.sign ?? '').toLowerCase();
    if (sign === 'deduction') continue;
    total += toMoney(line.amount);
  }
  return roundMoney(total);
}

/** Active enrollment type keys at period end (employee_insurances.type = catalog key). */
export async function listActiveEnrolledInsuranceTypeKeys(
  db: HrmDbService,
  input: { employeeId: string; asOf: string },
): Promise<string[]> {
  const asOf = input.asOf.slice(0, 10);
  const res = await db.query<{ type_key: string }>(
    `
      SELECT DISTINCT lower(trim(COALESCE(NULLIF(trim(type), ''), provider))) AS type_key
      FROM public.employee_insurances
      WHERE employee_id = $1::uuid
        AND archived_at IS NULL
        AND lower(status) = 'active'
        AND (start_date IS NULL OR start_date::date <= $2::date)
        AND (end_date IS NULL OR end_date::date >= $2::date)
        AND trim(COALESCE(NULLIF(trim(type), ''), provider)) <> '';
    `,
    [input.employeeId, asOf],
  );
  return res.rows.map((r) => r.type_key).filter(Boolean);
}

async function pickInsuranceRateCfgAtPeriodEnd(
  db: HrmDbService,
  input: {
    companyId: string;
    insuranceTypeKey: string;
    periodStart: string;
    periodEnd: string;
  },
): Promise<RateCfgRow | null> {
  const start = input.periodStart.slice(0, 10);
  const end = input.periodEnd.slice(0, 10);
  const companyIds = expandCbReadCompanyIds(input.companyId, null);
  for (const co of companyIds) {
    const res = await db.query<RateCfgRow>(
      `
        SELECT id::text AS id, employee_rate_pct, employer_rate_pct, ceiling_amount
        FROM public.pay_insurance_rate_cfg
        WHERE company_id = $1
          AND lower(insurance_type_key) = lower($2)
          AND status = 'active'
          AND archived_at IS NULL
          AND effective_from <= $3::date
          AND (effective_to IS NULL OR effective_to > $4::date)
        ORDER BY effective_from DESC
        LIMIT 1;
      `,
      [co, input.insuranceTypeKey, end, start],
    );
    if (res.rows[0]) return res.rows[0];
  }
  return null;
}

/**
 * F-PAY-SI-CEILING-01 — compute + optional persist header si_* (after GTCG persist).
 */
export async function applyPaySiCeilingForEmployee(
  db: HrmDbService,
  input: {
    periodCompanyId: string;
    periodStart: string;
    periodEnd: string;
    employeeId: string;
    lines: PaySrcResolvedLine[];
    failOnMissingCfg?: boolean;
  },
): Promise<PaySiCeilingOk | PaySiCeilingBlocked> {
  const periodEnd = input.periodEnd.slice(0, 10);
  const mergedBase = await sumMergedInsuranceBaseFromLines(db, {
    companyId: input.periodCompanyId,
    lines: input.lines,
  });
  const enrolledTypes = await listActiveEnrolledInsuranceTypeKeys(db, {
    employeeId: input.employeeId,
    asOf: periodEnd,
  });

  if (enrolledTypes.length === 0) {
    return {
      ok: true,
      merged_insurance_base_vnd: mergedBase,
      ceiling_amount_vnd: null,
      si_employee_amount_vnd: 0,
      si_employer_amount_vnd: 0,
      enrolled_type_keys: [],
    };
  }

  let siEmployee = 0;
  let siEmployer = 0;
  let appliedCeilingDisplay: number | null = null;

  for (const typeKey of enrolledTypes) {
    const cfg = await pickInsuranceRateCfgAtPeriodEnd(db, {
      companyId: input.periodCompanyId,
      insuranceTypeKey: typeKey,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    });
    if (!cfg) {
      const blocked: PaySiCeilingBlocked = {
        ok: false,
        code: HRM_SET_SI_412_MISSING,
        message: `Chưa cấu hình tỷ lệ/trần BH active cho loại ${typeKey} tại cuối kỳ — cấu hình tại Cài đặt BH`,
        insurance_type_key: typeKey,
        company_id: input.periodCompanyId,
        period_end: periodEnd,
      };
      if (input.failOnMissingCfg) {
        throw new ApiException(HRM_SET_SI_412_MISSING, blocked.message, HttpStatus.PRECONDITION_FAILED, {
          code: HRM_SET_SI_412_MISSING,
          insurance_type_key: typeKey,
          company_id: input.periodCompanyId,
          period_end: periodEnd,
          payroll_e2e_ready: false,
        });
      }
      return blocked;
    }

    const ceilingRaw = cfg.ceiling_amount;
    const ceiling =
      ceilingRaw == null || ceilingRaw === '' ? null : toMoney(ceilingRaw);
    const contributionBase =
      ceiling != null && ceiling > 0 ? Math.min(mergedBase, ceiling) : mergedBase;
    if (ceiling != null && (appliedCeilingDisplay == null || ceiling < (appliedCeilingDisplay ?? Infinity))) {
      appliedCeilingDisplay = ceiling;
    }
    const empRate = toMoney(cfg.employee_rate_pct);
    const erRate = toMoney(cfg.employer_rate_pct);
    siEmployee += roundMoney((contributionBase * empRate) / 100);
    siEmployer += roundMoney((contributionBase * erRate) / 100);
  }

  return {
    ok: true,
    merged_insurance_base_vnd: mergedBase,
    ceiling_amount_vnd: appliedCeilingDisplay,
    si_employee_amount_vnd: roundMoney(siEmployee),
    si_employer_amount_vnd: roundMoney(siEmployer),
    enrolled_type_keys: enrolledTypes,
  };
}

export async function persistPaySiCeilingOnPayslip(
  db: HrmDbService,
  input: { payslipId: string; siEmployeeAmountVnd: number; siEmployerAmountVnd: number },
): Promise<void> {
  await db.query(
    `
      UPDATE public.payroll_payslips
      SET
        si_employee_amount = $2,
        si_employer_amount = $3,
        updated_at = NOW()
      WHERE id = $1::uuid;
    `,
    [input.payslipId, input.siEmployeeAmountVnd, input.siEmployerAmountVnd],
  );
}
