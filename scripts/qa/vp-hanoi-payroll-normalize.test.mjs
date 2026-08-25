import assert from 'node:assert/strict';
import {
  normalizeSocialInsuranceDeduction,
  shouldSeedPeriodInput,
} from '../lib/vp-hanoi-payroll-config.mjs';

const xe236 = {
  income: { insurance_base_p1: 5_310_000, paying_insurance: null },
  deductions: { social_insurance: 5_217_548.08, total_deduction: 521_754.81 },
};

assert.equal(normalizeSocialInsuranceDeduction(xe236), 521_754.81);

const xe250 = {
  income: { insurance_base_p1: 5_700_000, paying_insurance: 5_700_000 },
  deductions: { social_insurance: 23_557_692.31, total_deduction: 1_534.62 },
};

assert.equal(normalizeSocialInsuranceDeduction(xe250), 598_500);

assert.equal(shouldSeedPeriodInput('LUONG_CO_BAN', 8_600_000), false);
assert.equal(shouldSeedPeriodInput('LUONG_KPI', 1), false);
assert.equal(shouldSeedPeriodInput('THUONG_P4', 4_000_000), true);

console.log('vp-hanoi-payroll-normalize: ok');
