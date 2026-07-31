import { describe, expect, it } from 'vitest';
import {
  buildInsurancePolicyCreateBody,
  buildInsurancePolicyStatusPatchBody,
  buildInsurancePolicyUpdateBody,
} from './insurancePolicyPayload';

const formValues = {
  policy_code: ' POL-01 ',
  policy_name: ' BHXH 2026 ',
  insurer_key: ' bao_viet ',
  insurance_type: ' bhxh ',
  effective_date: '2026-01-01',
  expiry_date: '2026-12-31',
  notes: ' note ',
};

describe('insurancePolicyPayload — D-HDSD-BF-03-BH-POL-DTO-01', () => {
  it('create body omits insurer_label and maps allowed DTO fields', () => {
    const body = buildInsurancePolicyCreateBody('main', formValues);
    expect(body).toEqual({
      company_id: 'main',
      policy_code: 'POL-01',
      policy_name: 'BHXH 2026',
      insurer_key: 'bao_viet',
      insurance_type: 'bhxh',
      effective_date: '2026-01-01',
      expiry_date: '2026-12-31',
      notes: 'note',
    });
    expect(Object.prototype.hasOwnProperty.call(body, 'insurer_label')).toBe(false);
    expect(JSON.stringify(body)).not.toContain('insurer_label');
  });

  it('create body omits blank expiry/notes keys', () => {
    const body = buildInsurancePolicyCreateBody('main', {
      ...formValues,
      expiry_date: '  ',
      notes: '',
    });
    expect(body.expiry_date).toBeUndefined();
    expect(body.notes).toBeUndefined();
    expect(Object.keys(body).sort()).toEqual(
      [
        'company_id',
        'effective_date',
        'insurance_type',
        'insurer_key',
        'policy_code',
        'policy_name',
      ].sort(),
    );
  });

  it('update body omits company_id and insurer_label', () => {
    const body = buildInsurancePolicyUpdateBody(formValues);
    expect(Object.prototype.hasOwnProperty.call(body, 'company_id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(body, 'insurer_label')).toBe(false);
    expect(JSON.stringify(body)).not.toContain('company_id');
    expect(body).toMatchObject({
      policy_code: 'POL-01',
      policy_name: 'BHXH 2026',
      insurer_key: 'bao_viet',
      insurance_type: 'bhxh',
      effective_date: '2026-01-01',
      expiry_date: '2026-12-31',
      notes: 'note',
    });
  });

  it('SM status patch is status-only', () => {
    const body = buildInsurancePolicyStatusPatchBody('active');
    expect(body).toEqual({ status: 'active' });
    expect(Object.keys(body)).toEqual(['status']);
    expect(JSON.stringify(body)).not.toContain('company_id');
  });
});
