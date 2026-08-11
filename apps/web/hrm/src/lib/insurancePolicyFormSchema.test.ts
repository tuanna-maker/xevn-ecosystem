import { describe, expect, it } from 'vitest';
import { createInsurancePolicyFormSchema } from './insurancePolicyFormSchema';

const msg = {
  codeRequired: 'code',
  nameRequired: 'name',
  insurerRequired: 'insurer',
  insurerNotInCatalog: 'insurerCat',
  typeRequired: 'type',
  typeNotInCatalog: 'typeCat',
  effectiveRequired: 'eff',
  dateOrder: 'order',
};

describe('insurancePolicyFormSchema — E3 Zod', () => {
  it('requires codes + catalog membership when items > 0', () => {
    const schema = createInsurancePolicyFormSchema(msg, () => ['bao_viet'], () => ['bhxh']);
    expect(
      schema.safeParse({
        policy_code: 'P1',
        policy_name: 'Pol',
        insurer_key: '',
        insurance_type: 'bhxh',
        effective_date: '2026-01-01',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        policy_code: 'P1',
        policy_name: 'Pol',
        insurer_key: 'invent',
        insurance_type: 'bhxh',
        effective_date: '2026-01-01',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        policy_code: 'P1',
        policy_name: 'Pol',
        insurer_key: 'bao_viet',
        insurance_type: 'bhxh',
        effective_date: '2026-01-01',
      }).success,
    ).toBe(true);
  });

  it('blocks save when catalogs empty (empty+CTA)', () => {
    const schema = createInsurancePolicyFormSchema(msg, () => [], () => []);
    expect(
      schema.safeParse({
        policy_code: 'P1',
        policy_name: 'Pol',
        insurer_key: 'x',
        insurance_type: 'y',
        effective_date: '2026-01-01',
      }).success,
    ).toBe(false);
  });
});
