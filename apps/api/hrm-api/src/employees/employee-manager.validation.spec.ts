import { ApiException } from '../common/api.exception';
import { assertManagerAssignment } from './employee-manager.validation';
import { signServiceJwt } from '../common/jwt-sign';

describe('assertManagerAssignment (R-SPINE-MGR-HIER-01-BE)', () => {
  const employeeId = '11111111-1111-4111-8111-111111111111';
  const managerId = '22222222-2222-4222-8222-222222222222';
  const otherCompanyManagerId = '33333333-3333-4333-8333-333333333333';
  const cycleMidId = '44444444-4444-4444-8444-444444444444';

  // Group CEO token for master tenant
  const groupCeoToken = signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

  function mockDb(
    handlers: Array<(sql: string, params?: unknown[]) => { rows: unknown[] }>,
  ) {
    let i = 0;
    return {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        const handler = handlers[i];
        i += 1;
        if (!handler) {
          return { rows: [] };
        }
        return handler(sql, params);
      }),
    };
  }

  it('null manager_id clears (returns null)', async () => {
    const db = mockDb([]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId: null,
      }),
    ).resolves.toBeNull();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('undefined manager_id is no-op (returns null, no query)', async () => {
    const db = mockDb([]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId: undefined,
      }),
    ).resolves.toBeNull();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('rejects self as manager', async () => {
    const db = mockDb([]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId: employeeId,
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-MGR-SELF' });
  });

  it('rejects missing / archived manager', async () => {
    const db = mockDb([() => ({ rows: [] })]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId,
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-MGR-404' });
  });

  it('rejects cross-company manager (not in list scope)', async () => {
    const db = mockDb([
      () => ({
        rows: [
          {
            id: otherCompanyManagerId,
            company_id: 'trsport',
            archived_at: null,
          },
        ],
      }),
    ]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId: otherCompanyManagerId,
        authorization: 'Bearer invalid-token',
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-MGR-SCOPE' });
  });

  it('rejects reporting cycle', async () => {
    const db = mockDb([
      () => ({
        rows: [{ id: cycleMidId, company_id: 'holding', archived_at: null }],
      }),
      () => ({ rows: [{ id: employeeId }] }),
    ]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId: cycleMidId,
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-MGR-CYCLE' });
  });

  it('happy path returns manager uuid (same company)', async () => {
    const db = mockDb([
      () => ({
        rows: [{ id: managerId, company_id: 'holding', archived_at: null }],
      }),
      () => ({ rows: [] }),
    ]);
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'holding',
        managerId,
      }),
    ).resolves.toBe(managerId);
  });

  it('allows cross-company manager when within list scope (Group CEO)', async () => {
    const db = mockDb([
      () => ({
        rows: [
          {
            id: otherCompanyManagerId,
            company_id: 'trsport',
            archived_at: null,
          },
        ],
      }),
      () => ({ rows: [] }),
    ]);
    // Group CEO creating employee in 'holding' with manager in 'trsport' (member company)
    // Portal JWT uses companyId=main (HRM_PILOT_OPERATING_COMPANY_ID) → resolves to all member slugs including holding/trsport/...
    // resolveHrmListScope(main) returns all GROUP_MEMBER_COMPANY_SLUGS with masterTenantPartition=true
    await expect(
      assertManagerAssignment(db, {
        employeeId,
        companyId: 'main', // Portal JWT bucket for Group CEO
        managerId: otherCompanyManagerId,
        authorization: `Bearer ${groupCeoToken}`,
        scopeContext: { tenantId: 'xevn' },
      }),
    ).resolves.toBe(otherCompanyManagerId);
  });

  it('create path (employeeId null) skips cycle walk when manager valid', async () => {
    const db = mockDb([
      () => ({
        rows: [{ id: managerId, company_id: 'holding', archived_at: null }],
      }),
    ]);
    await expect(
      assertManagerAssignment(db, {
        employeeId: null,
        companyId: 'holding',
        managerId,
      }),
    ).resolves.toBe(managerId);
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});
