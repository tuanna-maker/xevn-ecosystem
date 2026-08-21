/**
 * WorkItem: PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01
 */
import { ApiException } from '../common/api.exception';
import { HRM_SET_TAX_412_MISSING } from '../settings/settings-defaults.constants';
import { assertNoPayTaxOverrideInBody } from './pay-tax-guard';
import { HRM_PAY_TAX_403 } from './pay-tax.constants';
import {
  computeProgressiveVnV1Tax,
  PROGRESSIVE_VN_V1_BRACKETS,
} from './pay-progressive-vn.constants';
import { computePayTncnBreakdown } from './pay-tncn-resolver';

describe('assertNoPayTaxOverrideInBody', () => {
  it('throws HRM-PAY-TAX-403 on override keys', () => {
    try {
      assertNoPayTaxOverrideInBody({ tax_amount: 1, net_amount_vnd: 2 });
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      const ex = e as ApiException;
      expect(ex.code).toBe(HRM_PAY_TAX_403);
    }
  });

  it('allows empty body', () => {
    assertNoPayTaxOverrideInBody({});
    assertNoPayTaxOverrideInBody(null);
  });
});

describe('computeProgressiveVnV1Tax', () => {
  it('applies 7-bracket ladder once (not per segment)', () => {
    expect(PROGRESSIVE_VN_V1_BRACKETS).toHaveLength(7);
    expect(computeProgressiveVnV1Tax(0)).toBe(0);
    expect(computeProgressiveVnV1Tax(5_000_000)).toBe(250_000);
    expect(computeProgressiveVnV1Tax(10_000_000)).toBe(750_000);
  });
});

describe('computePayTncnBreakdown', () => {
  const progressiveCtx = {
    regimeCode: 'progressive_vn',
    applyPersonalDeduction: true,
    applyDependentDeduction: true,
    personalDeductionVnd: 11_000_000,
    dependentDeductionPerUnitVnd: 4_400_000,
  };

  it('subtracts GTCG + SI once then deductions before progressive', () => {
    const breakdown = computePayTncnBreakdown({
      mergedTaxableGrossVnd: 30_000_000,
      gtgcAmountVnd: 15_400_000,
      siEmployeeAmountVnd: 800_000,
      dependentsCount: 1,
      taxContext: progressiveCtx,
    });
    expect(breakdown.taxableIncomeVnd).toBe(13_800_000);
    expect(breakdown.personalDeductionVnd).toBe(11_000_000);
    expect(breakdown.dependentDeductionVnd).toBe(4_400_000);
    expect(breakdown.postDeductionBaseVnd).toBe(0);
    expect(breakdown.taxAmountVnd).toBe(0);
    expect(breakdown.bracketSnapshotVersion).toBe('progressive_vn_v1');
  });

  it('computes tax when post-deduction base > 0', () => {
    const breakdown = computePayTncnBreakdown({
      mergedTaxableGrossVnd: 50_000_000,
      gtgcAmountVnd: 11_000_000,
      siEmployeeAmountVnd: 1_000_000,
      dependentsCount: 0,
      taxContext: {
        ...progressiveCtx,
        applyDependentDeduction: false,
        dependentDeductionPerUnitVnd: 0,
      },
    });
    const expectedBase = 50_000_000 - 11_000_000 - 1_000_000 - 11_000_000;
    expect(breakdown.postDeductionBaseVnd).toBe(expectedBase);
    expect(breakdown.taxAmountVnd).toBe(
      computeProgressiveVnV1Tax(expectedBase),
    );
  });

  it('regime other yields zero tax without progressive', () => {
    const breakdown = computePayTncnBreakdown({
      mergedTaxableGrossVnd: 20_000_000,
      gtgcAmountVnd: 0,
      siEmployeeAmountVnd: 0,
      dependentsCount: 0,
      taxContext: {
        regimeCode: 'other',
        applyPersonalDeduction: false,
        applyDependentDeduction: false,
        personalDeductionVnd: 0,
        dependentDeductionPerUnitVnd: 0,
      },
    });
    expect(breakdown.payTaxRegimeCode).toBe('other');
    expect(breakdown.taxAmountVnd).toBe(0);
  });
});

describe('HRM-SET-TAX-412-MISSING contract', () => {
  it('stable code constant for process bind', () => {
    expect(HRM_SET_TAX_412_MISSING).toBe('HRM-SET-TAX-412-MISSING');
  });
});
