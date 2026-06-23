import { signServiceJwt } from '../common/jwt-sign';
import { HrmInboxService } from './hrm-inbox.service';

describe('HrmInboxService listInbox SQL', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
  const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';

  function uatNv1Token() {
    return signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
  }

  it('D-MOB-PARITY-LEAVE-SLUG-01: holding slug inbox expands slug + JWT uuid (no holding::uuid cast)', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValue({ rows: [] });
    const svc = new HrmInboxService({ query: queryMock } as never);
    const token = uatNv1Token();
    await svc.listInbox('holding', employeeId, 40, `Bearer ${token}`, 'xevn');

    const listCall = queryMock.mock.calls.find(
      ([sql]) => String(sql).includes('hrm_inbox_notifications') && String(sql).includes('SELECT'),
    );
    expect(listCall).toBeDefined();
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toMatch(/company_id = \$|company_id = ANY/);
    expect(sql).not.toContain('holding::uuid');
    const companyParam = params[0];
    expect(Array.isArray(companyParam) ? companyParam : [companyParam]).toEqual(
      expect.arrayContaining([holdingUuid, '10000000-0000-4000-8000-000000000001']),
    );
  });

  it('D-MOB-PARITY-LEAVE-SLUG-01: company_uuid query still lists inbox with expanded filter', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValue({ rows: [{ id: 'inbox-1' }] });
    const svc = new HrmInboxService({ query: queryMock } as never);
    const token = uatNv1Token();
    const out = await svc.listInbox(holdingUuid, employeeId, 40, `Bearer ${token}`, 'xevn');

    const listCall = queryMock.mock.calls.find(
      ([sql]) => String(sql).includes('hrm_inbox_notifications') && String(sql).includes('SELECT'),
    );
    expect(listCall).toBeDefined();
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toMatch(/company_id = \$|company_id = ANY/);
    const companyParam = params[0];
    expect(Array.isArray(companyParam) ? companyParam : [companyParam]).toEqual(
      expect.arrayContaining([holdingUuid, '10000000-0000-4000-8000-000000000001']),
    );
    expect(out.total).toBe(1);
  });
});
