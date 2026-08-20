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
      ([sql]) =>
        String(sql).includes('hrm_inbox_notifications') &&
        String(sql).includes('SELECT'),
    );
    expect(listCall).toBeDefined();
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toMatch(/company_id = \$|company_id = ANY/);
    expect(sql).not.toContain('holding::uuid');
    const companyParam = params[0];
    expect(Array.isArray(companyParam) ? companyParam : [companyParam]).toEqual(
      expect.arrayContaining([
        holdingUuid,
        '10000000-0000-4000-8000-000000000001',
      ]),
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
    const out = await svc.listInbox(
      holdingUuid,
      employeeId,
      40,
      `Bearer ${token}`,
      'xevn',
    );

    const listCall = queryMock.mock.calls.find(
      ([sql]) =>
        String(sql).includes('hrm_inbox_notifications') &&
        String(sql).includes('SELECT'),
    );
    expect(listCall).toBeDefined();
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toMatch(/company_id = \$|company_id = ANY/);
    const companyParam = params[0];
    expect(Array.isArray(companyParam) ? companyParam : [companyParam]).toEqual(
      expect.arrayContaining([
        holdingUuid,
        '10000000-0000-4000-8000-000000000001',
      ]),
    );
    expect(out.total).toBe(1);
  });

  it('D-HRM-LEAVE-REQ-CREATE-BE-01: persistAttendanceEnvelope maps holding slug → pilot UUID (no slug::uuid)', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new HrmInboxService({ query: queryMock } as never);
    await svc.persistAttendanceEnvelope({
      type: 'leave_request.created',
      at: '2026-07-27T00:00:00.000Z',
      request: {
        id: 'lr-1',
        company_id: 'holding',
        employee_id: employeeId,
        employee_code: 'NV0001',
        employee_name: 'A',
        leave_type: 'LVT_01',
        start_date: '2026-11-12',
        end_date: '2026-11-12',
        total_days: 1,
        reason: null,
        status: 'pending',
        requested_at: '2026-11-12T00:00:00.000Z',
        reviewed_at: null,
        reviewed_by: null,
        rejected_reason: null,
      },
    });
    const insertCall = queryMock.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.hrm_inbox_notifications'),
    );
    expect(insertCall).toBeDefined();
    const [, params] = insertCall as [string, unknown[]];
    expect(params[1]).toBe('10000000-0000-4000-8000-000000000001');
    expect(params[1]).not.toBe('holding');
  });
});
