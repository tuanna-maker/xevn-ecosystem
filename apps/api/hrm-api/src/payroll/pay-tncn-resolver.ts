/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — F-PAY-TNCN-01 internal resolver
 * UC:         FR-UC-BP-PAY-06 Diễn biến #5–#6
 * Purpose:    Taxable bag · Settings pay_tax_* · progressive_vn_v1 once · persist tax_amount header
 * WorkItem:   PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01
 * must_keep:  payroll_e2e_ready=false · after F-PAY-SI-CEILING-01 · cấm per-segment tax
 */
import { HrmDbService } from '../db/hrm-db.service';
import {
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_FLAGS,
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_REGIME,
} from '../settings/settings-defaults.constants';
import type { SettingsTaxParamsService } from '../settings/settings-tax-params.service';
import { PAY_TNCN_BRACKET_SNAPSHOT_VERSION } from './pay-tax.constants';
import { computeProgressiveVnV1Tax } from './pay-progressive-vn.constants';

export type PayTaxProcessContext = {
  regimeCode: string;
  applyPersonalDeduction: boolean;
  applyDependentDeduction: boolean;
  personalDeductionVnd: number;
  dependentDeductionPerUnitVnd: number;
  flatRatePct?: number;
  flatMinTaxableIncomeVnd?: number;
};

export type PayTncnBreakdown = {
  taxableIncomeVnd: number;
  personalDeductionVnd: number;
  dependentDeductionVnd: number;
  postDeductionBaseVnd: number;
  taxAmountVnd: number;
  payTaxRegimeCode: string;
  bracketSnapshotVersion: string;
};

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function readAmountVnd(value: Record<string, unknown> | undefined): number {
  if (!value) return 0;
  const raw = value.amount ?? value.Amount;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n >= 0 ? roundMoney(n) : 0;
}

/** Load pay_tax_* KV for process (throws HRM-SET-TAX-412-MISSING when progressive_vn and missing). */
export async function loadPayTaxProcessContext(
  settingsTax: SettingsTaxParamsService,
  companyId: string,
  authorization?: string,
  db?: HrmDbService,
): Promise<PayTaxProcessContext> {
  // 1. Try to load Flat Policy from DB if provided
  let flatRatePct: number | undefined;
  let flatMinTaxableIncomeVnd: number | undefined;

  if (db) {
    const activePolicies = await db.query(
      `
      SELECT p.id, c.component_type, c.params
      FROM public.payroll_policies p
      JOIN public.pay_income_components c ON c.policy_id = p.id
      WHERE p.tenant_id = $1 AND p.pay_group_code = 'TAX' 
        AND p.status = 'ACTIVE' 
        AND p.deleted_at IS NULL AND c.deleted_at IS NULL
      `,
      [companyId]
    );

    const flatPolicy = activePolicies.rows.find(r => r.component_type === 'tax_flat');
    if (flatPolicy && flatPolicy.params && flatPolicy.params.calculation_rules) {
      const rules = flatPolicy.params.calculation_rules;
      flatRatePct = rules.rate != null ? Number(rules.rate) : 10;
      flatMinTaxableIncomeVnd = rules.min_taxable_income != null ? Number(rules.min_taxable_income) : 2000000;
    }
  }

  // 2. Load Global Settings as fallback / progressive base
  const regime = await settingsTax.readRequiredTaxValue(
    companyId,
    PAY_TAX_REGIME,
    authorization,
  );
  const regimeCode = String(regime.code ?? '').trim();
  if (regimeCode === 'other' && !flatRatePct) {
    return {
      regimeCode: 'other',
      applyPersonalDeduction: false,
      applyDependentDeduction: false,
      personalDeductionVnd: 0,
      dependentDeductionPerUnitVnd: 0,
    };
  }

  const flags = await settingsTax.readRequiredTaxValue(
    companyId,
    PAY_TAX_FLAGS,
    authorization,
  );
  const applyPersonal = Boolean(
    flags.applyPersonalDeduction ?? flags.apply_personal_deduction ?? false,
  );
  const applyDependent = Boolean(
    flags.applyDependentDeduction ?? flags.apply_dependent_deduction ?? false,
  );

  let personalDeductionVnd = 0;
  let dependentDeductionPerUnitVnd = 0;
  if (applyPersonal) {
    const personal = await settingsTax.readRequiredTaxValue(
      companyId,
      PAY_TAX_PERSONAL_DEDUCTION,
      authorization,
    );
    personalDeductionVnd = readAmountVnd(personal);
  }
  if (applyDependent) {
    const dependent = await settingsTax.readRequiredTaxValue(
      companyId,
      PAY_TAX_DEPENDENT_DEDUCTION,
      authorization,
    );
    dependentDeductionPerUnitVnd = readAmountVnd(dependent);
  }

  return {
    // If flat policy is found in DB, it becomes capable of flat, but we preserve the core regime code 
    // unless the logic overrides it. Actually, if flat exists, we just embed it.
    regimeCode: regimeCode || 'progressive_vn',
    applyPersonalDeduction: applyPersonal,
    applyDependentDeduction: applyDependent,
    personalDeductionVnd,
    dependentDeductionPerUnitVnd,
    flatRatePct,
    flatMinTaxableIncomeVnd,
  };
}

export function computePayTncnBreakdown(input: {
  mergedTaxableGrossVnd: number;
  gtgcAmountVnd: number;
  siEmployeeAmountVnd: number;
  dependentsCount: number;
  taxContext: PayTaxProcessContext;
}): PayTncnBreakdown {
  const gross = roundMoney(Math.max(0, input.mergedTaxableGrossVnd));
  const gtgc = roundMoney(Math.max(0, input.gtgcAmountVnd));
  const siEe = roundMoney(Math.max(0, input.siEmployeeAmountVnd));
  const personal = input.taxContext.applyPersonalDeduction
    ? roundMoney(input.taxContext.personalDeductionVnd)
    : 0;
  const dependent = input.taxContext.applyDependentDeduction
    ? roundMoney(
        input.taxContext.dependentDeductionPerUnitVnd *
          Math.max(0, input.dependentsCount),
      )
    : 0;

  const taxableIncomeVnd = roundMoney(Math.max(0, gross - gtgc - siEe));
  const postDeductionBaseVnd = roundMoney(
    Math.max(0, taxableIncomeVnd - personal - dependent),
  );

  let taxAmountVnd = 0;
  let appliedRegime = input.taxContext.regimeCode;
  let snapshotVersion = PAY_TNCN_BRACKET_SNAPSHOT_VERSION;

  // If a Flat policy was active in the database and employee income crosses the threshold, apply Flat
  if (
    input.taxContext.flatRatePct != null &&
    input.taxContext.flatMinTaxableIncomeVnd != null &&
    gross >= input.taxContext.flatMinTaxableIncomeVnd
  ) {
    taxAmountVnd = roundMoney(gross * (input.taxContext.flatRatePct / 100));
    appliedRegime = 'flat';
    snapshotVersion = 'FLAT_DB_POLICY';
  } else if (input.taxContext.regimeCode === 'progressive_vn') {
    taxAmountVnd = computeProgressiveVnV1Tax(postDeductionBaseVnd);
  }

  return {
    taxableIncomeVnd,
    personalDeductionVnd: personal,
    dependentDeductionVnd: dependent,
    postDeductionBaseVnd,
    taxAmountVnd,
    payTaxRegimeCode: appliedRegime,
    bracketSnapshotVersion: snapshotVersion,
  };
}

export async function ensurePayrollPayslipsTaxColumn(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) NULL;
  `);
}

export async function persistPayTncnOnPayslip(
  db: HrmDbService,
  input: { payslipId: string; taxAmountVnd: number },
): Promise<void> {
  await db.query(
    `
      UPDATE public.payroll_payslips
      SET tax_amount = $2, updated_at = NOW()
      WHERE id = $1::uuid;
    `,
    [input.payslipId, roundMoney(Math.max(0, input.taxAmountVnd))],
  );
}
