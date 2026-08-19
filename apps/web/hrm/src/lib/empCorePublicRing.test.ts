/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * Purpose: Unit — CB deny strip + relation_label resolve + physical path guard
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_CB_MAP_REDIRECT_TITLE_VI,
  isCoreCbDenyKey,
  isCoreEmployeesPhysicalPath,
  publicPayloadHasCbDenyKeys,
  resolveDependentRelationLabel,
  stripCoreCbKeysFromRecord,
} from './empCorePublicRing';

describe('empCorePublicRing — UC-BP-CORE-01 FE', () => {
  it('flags DATA §4.3 deny keys', () => {
    expect(isCoreCbDenyKey('salary')).toBe(true);
    expect(isCoreCbDenyKey('base_salary')).toBe(true);
    expect(isCoreCbDenyKey('bank_name')).toBe(true);
    expect(isCoreCbDenyKey('tax_code')).toBe(true);
    expect(isCoreCbDenyKey('social_insurance_number')).toBe(true);
    expect(isCoreCbDenyKey('bhxh_no')).toBe(true);
    expect(isCoreCbDenyKey('department')).toBe(false);
    expect(isCoreCbDenyKey('phone_number')).toBe(false);
  });

  it('strips deny keys from custom_fields', () => {
    const stripped = stripCoreCbKeysFromRecord({
      department: 'OPS',
      salary: '20000000',
      bank_account: '123',
      phone_number: '090',
    });
    expect(stripped).toEqual({ department: 'OPS', phone_number: '090' });
  });

  it('detects CB keys in payload body or nested CF', () => {
    expect(publicPayloadHasCbDenyKeys({ full_name: 'A', salary: 1 })).toBe(true);
    expect(
      publicPayloadHasCbDenyKeys({
        full_name: 'A',
        custom_fields: { tax_code: 'x' },
      }),
    ).toBe(true);
    expect(publicPayloadHasCbDenyKeys({ full_name: 'A', custom_fields: { phone: '1' } })).toBe(
      false,
    );
  });

  it('prefers BE relation_label over FE invent', () => {
    expect(resolveDependentRelationLabel('child', 'Con cái')).toBe('Con cái');
    expect(resolveDependentRelationLabel('child', null)).toBe('Con');
    expect(resolveDependentRelationLabel('unknown_x', '')).toBe('unknown_x');
  });

  it('physical /employees path — DENY Nest /core SoT', () => {
    expect(isCoreEmployeesPhysicalPath('/api/hrm/employees/abc')).toBe(true);
    expect(isCoreEmployeesPhysicalPath('/api/hrm/employees/abc/dependents')).toBe(true);
    expect(isCoreEmployeesPhysicalPath('/api/hrm/core/employees/abc')).toBe(false);
  });

  it('CB-MAP redirect copy present (VI)', () => {
    expect(CORE_CB_MAP_REDIRECT_TITLE_VI.toLowerCase()).toContain('công khai');
  });
});
