import { describe, expect, it } from 'vitest';
import {
  SETTINGS_DEFAULTS_PAYROLL_E2E_READY,
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_REGIME,
  PAY_TAX_FLAGS,
  buildPosCreateBody,
  buildSiCreateBody,
  buildTaxDeductionValue,
  buildTaxFlagsValue,
  buildTaxPutBody,
  buildTaxRegimeValue,
  formatPosResolveWarnings,
  isValidInsuranceTypeKeyFormat,
  normalizeInsuranceTypeKey,
  readTaxAmount,
  siStatusLabel,
  taxFormFromSettingsItems,
  taxKeyLabel,
} from './settingsDefaultsCatalog';

describe('settingsDefaultsCatalog', () => {
  it('keeps payroll_e2e_ready honesty false', () => {
    expect(SETTINGS_DEFAULTS_PAYROLL_E2E_READY).toBe(false);
  });

  it('labels starter tax keys in vi-VN', () => {
    expect(taxKeyLabel(PAY_TAX_PERSONAL_DEDUCTION)).toContain('bản thân');
    expect(taxKeyLabel('unknown_key')).toBe('unknown_key');
  });

  it('builds tax PUT body camelCase with value shape', () => {
    const body = buildTaxPutBody('main', PAY_TAX_PERSONAL_DEDUCTION, buildTaxDeductionValue(11_000_000));
    expect(body).toEqual({
      companyId: 'main',
      settingKey: PAY_TAX_PERSONAL_DEDUCTION,
      value: { amount: 11_000_000, currency: 'VND' },
    });
    expect(buildTaxRegimeValue('progressive_vn')).toEqual({ code: 'progressive_vn' });
    expect(
      buildTaxFlagsValue({
        personalAmount: 0,
        dependentAmount: 0,
        regimeCode: 'progressive_vn',
        applyPersonalDeduction: true,
        applyDependentDeduction: false,
      }),
    ).toEqual({ applyPersonalDeduction: true, applyDependentDeduction: false });
  });

  it('hydrates tax form from prefix list items', () => {
    const form = taxFormFromSettingsItems([
      { settingKey: PAY_TAX_PERSONAL_DEDUCTION, value: { amount: 11_000_000, currency: 'VND' } },
      { settingKey: PAY_TAX_DEPENDENT_DEDUCTION, value: { amount: 4_400_000, currency: 'VND' } },
      { settingKey: PAY_TAX_REGIME, value: { code: 'other' } },
      {
        settingKey: PAY_TAX_FLAGS,
        value: { applyPersonalDeduction: false, applyDependentDeduction: true },
      },
    ]);
    expect(form.personalAmount).toBe(11_000_000);
    expect(form.dependentAmount).toBe(4_400_000);
    expect(form.regimeCode).toBe('other');
    expect(form.applyPersonalDeduction).toBe(false);
    expect(readTaxAmount(null)).toBe(0);
  });

  it('validates SI type key format and builds create body YYYY-MM-DD', () => {
    expect(isValidInsuranceTypeKeyFormat('BHXH')).toBe(true);
    expect(isValidInsuranceTypeKeyFormat('1BAD')).toBe(false);
    expect(normalizeInsuranceTypeKey(' BH XH ')).toBe('BH_XH');
    const body = buildSiCreateBody('main', {
      insuranceTypeKey: 'BHXH_QA',
      employeeRatePct: 8,
      employerRatePct: 17.5,
      effectiveFrom: '2026-01-01',
      status: 'active',
      notes: 'fe',
    });
    expect(body.companyId).toBe('main');
    expect(body.effectiveFrom).toBe('2026-01-01');
    expect(body.insuranceTypeKey).toBe('BHXH_QA');
    expect(siStatusLabel('active')).toBe('Đang hiệu lực');
  });

  it('builds POS create without positionLabelSnapshot', () => {
    const body = buildPosCreateBody('main', {
      positionKey: 'CEO',
      nameVi: 'Chính sách CEO',
      effectiveFrom: '2026-01-01',
      status: 'active',
      lines: [{ componentCode: 'PC_RET_AC81', amount: 500_000, calcMode: 'fixed' }],
    });
    expect(body.companyId).toBe('main');
    expect(body.positionKey).toBe('CEO');
    expect(body).not.toHaveProperty('positionLabelSnapshot');
    expect(body.lines).toEqual([
      {
        componentCode: 'PC_RET_AC81',
        amount: 500_000,
        calcMode: 'fixed',
        currency: 'VND',
        sortOrder: 0,
      },
    ]);
    expect(formatPosResolveWarnings(['NO_POLICY'])).toContain('NO_POLICY');
    expect(formatPosResolveWarnings([])).toContain('draft read-only');
  });
});
