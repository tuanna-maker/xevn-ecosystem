import { describe, expect, it } from 'vitest';
import { resolvePayrollQueryCompanyId, resolveWireCompanyId } from '../companyWireScope';
import { resolveHrmCompanyHeaderId } from '../hrmApiClient';

const DU_LICH_UUID = '7b626710-02eb-4a39-89c5-e9a90ecc74ff';

describe('resolveWireCompanyId', () => {
  it('prefers SecureStore companyUuid over slug main', () => {
    expect(
      resolveWireCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'main',
      }),
    ).toBe(DU_LICH_UUID);
  });

  it('backfills from JWT company_uuid when store uuid missing', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ company_uuid: DU_LICH_UUID, company_id: 'main' }),
    ).toString('base64url');
    const token = `${header}.${payload}.sig`;

    expect(
      resolveWireCompanyId({
        companyId: 'main',
        accessToken: token,
      }),
    ).toBe(DU_LICH_UUID);
  });

  it('backfills from active membership when store and jwt lack uuid', () => {
    expect(
      resolveWireCompanyId({
        companyId: 'main',
        tenantId: 'xe-du-lich',
        employeeId: 'emp-1',
        memberships: [
          {
            tenant_id: 'xe-du-lich',
            employee_id: 'emp-1',
            company_uuid: DU_LICH_UUID,
          },
        ],
      }),
    ).toBe(DU_LICH_UUID);
  });
});

describe('resolvePayrollQueryCompanyId', () => {
  it('uses scope slug main for payroll rollup when membership slug is main', () => {
    expect(
      resolvePayrollQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'main',
      }),
    ).toBe('main');
  });

  it('falls back to wire UUID when scope slug is not main', () => {
    expect(
      resolvePayrollQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'xe-du-lich',
      }),
    ).toBe(DU_LICH_UUID);
  });
});

describe('resolveHrmCompanyHeaderId scope slug guard', () => {
  it('never returns literal main when only slug is present', () => {
    expect(resolveHrmCompanyHeaderId('', 'main')).toBe('');
  });
});
