import { describe, expect, it } from 'vitest';
import {
  resolveAvatarUploadQueryCompanyId,
  resolveDirectoryQueryCompanyId,
  resolveHomeSummaryQueryCompanyId,
  resolveLeaveBalanceQueryCompanyId,
  resolvePayrollQueryCompanyId,
  resolveWireCompanyId,
} from '../companyWireScope';
import { resolveHrmCompanyHeaderId, resolveHrmWriteHeaderId } from '../hrmApiClient';

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

  it('uses holding slug for payroll query (uat workforce pilot)', () => {
    expect(
      resolvePayrollQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'holding',
      }),
    ).toBe('holding');
  });
});

describe('resolveHomeSummaryQueryCompanyId', () => {
  it('uses holding slug for home/summary whos_out workforce rollup (D-W7-HOME-WHOS-SLUG-01)', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    expect(
      resolveHomeSummaryQueryCompanyId({
        companyUuid: holdingUuid,
        companyId: 'holding',
      }),
    ).toBe('holding');
  });

  it('uses main slug for group CEO home summary rollup', () => {
    expect(
      resolveHomeSummaryQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'main',
      }),
    ).toBe('main');
  });

  it('falls back to wire UUID when scope slug is not rollup', () => {
    expect(
      resolveHomeSummaryQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'xe-du-lich',
      }),
    ).toBe(DU_LICH_UUID);
  });

  it('PCOMP-W7-MOB-WHOS-OUT-02: recovers holding slug from membership when companyId is legal UUID', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';
    expect(
      resolveHomeSummaryQueryCompanyId({
        companyUuid: holdingUuid,
        companyId: holdingUuid,
        employeeId,
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: holdingUuid,
            employee_id: employeeId,
          },
        ],
      }),
    ).toBe('holding');
  });
});

describe('resolveLeaveBalanceQueryCompanyId', () => {
  it('D-W8-MOB-BAL-UI-01: uses holding slug when SecureStore companyId is legal UUID', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: holdingUuid,
        companyId: holdingUuid,
        employeeId,
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: holdingUuid,
            employee_id: employeeId,
          },
        ],
      }),
    ).toBe('holding');
  });

  it('P1-LEAVE-BALANCE-DEVICE-01: member slug trsport — never wire UUID on query', () => {
    const trsportUuid = '32a3cdcb-c534-4e47-80f9-d2f156e65094';
    const employeeId = '293b5900-8f99-4a97-878b-26270fb01827';
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: trsportUuid,
        companyId: trsportUuid,
        employeeId,
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'trsport',
            company_uuid: trsportUuid,
            employee_id: employeeId,
          },
        ],
      }),
    ).toBe('trsport');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ companyId: 'trsport', company_uuid: trsportUuid, employee_id: employeeId }),
    ).toString('base64url');
    const token = `${header}.${payload}.sig`;
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: trsportUuid,
        companyId: trsportUuid,
        employeeId,
        accessToken: token,
        memberships: [],
      }),
    ).toBe('trsport');
  });

  it('PCOMP-W7-MOB-LEAVE-BAL-02: delegates Plane B to resolveDirectoryQueryCompanyId', () => {
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'main',
      }),
    ).toBe('main');
    expect(
      resolveLeaveBalanceQueryCompanyId({
        companyUuid: '10000000-0000-4000-8000-000000000001',
        companyId: 'holding',
      }),
    ).toBe(
      resolveDirectoryQueryCompanyId({
        companyUuid: '10000000-0000-4000-8000-000000000001',
        companyId: 'holding',
      }),
    );
  });
});

describe('resolveDirectoryQueryCompanyId', () => {
  it('PCOMP-W7-MOB-DIRECTORY-01: keeps Plane B slug holding (not LE UUID)', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    expect(
      resolveDirectoryQueryCompanyId({
        companyUuid: holdingUuid,
        companyId: 'holding',
      }),
    ).toBe('holding');
  });

  it('PCOMP-W7-MOB-DIRECTORY-01: main rollup stays on query (header may use UUID)', () => {
    expect(
      resolveDirectoryQueryCompanyId({
        companyUuid: DU_LICH_UUID,
        companyId: 'main',
      }),
    ).toBe('main');
  });

  it('PCOMP-W7-MOB-DIRECTORY-01: recovers trsport from membership when companyId is UUID', () => {
    const trsportUuid = '10000000-0000-4000-8000-000000000005';
    const employeeId = '293b5900-8f99-4a97-878b-26270fb01827';
    expect(
      resolveDirectoryQueryCompanyId({
        companyUuid: trsportUuid,
        companyId: trsportUuid,
        employeeId,
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'trsport',
            company_uuid: trsportUuid,
            employee_id: employeeId,
          },
        ],
      }),
    ).toBe('trsport');
  });
});

describe('resolveAvatarUploadQueryCompanyId', () => {
  it('PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03: holding slug for file upload query (ADR scope ladder)', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    expect(
      resolveAvatarUploadQueryCompanyId({
        companyUuid: holdingUuid,
        companyId: holdingUuid,
        employeeId: '3796d949-4513-45c0-88fa-33030a062b17',
        tenantId: 'xevn',
        memberships: [
          {
            tenant_id: 'xevn',
            company_id: 'holding',
            company_uuid: holdingUuid,
            employee_id: '3796d949-4513-45c0-88fa-33030a062b17',
          },
        ],
      }),
    ).toBe('holding');
  });
});

describe('resolveHrmCompanyHeaderId scope slug guard', () => {
  it('never returns literal main when only slug is present', () => {
    expect(resolveHrmCompanyHeaderId('', 'main')).toBe('');
  });

  it('UAT P5 parity: holding slug header on GET + UUID on write', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    expect(resolveHrmCompanyHeaderId(holdingUuid, 'holding')).toBe('holding');
    expect(resolveHrmWriteHeaderId(holdingUuid, 'holding')).toBe(holdingUuid);
    expect(
      resolveWireCompanyId({
        companyUuid: holdingUuid,
        companyId: 'holding',
      }),
    ).toBe(holdingUuid);
  });
});
