import { signServiceJwt } from '../common/jwt-sign';
import { AttendanceRequestsService } from './attendance-requests.service';

describe('AttendanceRequestsService', () => {
  it('listOvertimeRequests uses workforce scope for group CEO on company_id=main', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 'ot-1' }] });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const out = await svc.listOvertimeRequests({ company_id: 'main' }, `Bearer ${token}`);
    const [sql] = queryMock.mock.calls.at(-1) as [string, unknown[]];
    expect(sql).toContain('overtime_requests');
    expect(sql).toContain('employee_id IN');
    expect(out.total).toBe(1);
  });

  it('listBusinessTripRequests filters by company_id text for single-company scope', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    await svc.listBusinessTripRequests({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    const listCall = queryMock.mock.calls.find(
      ([sql]) => String(sql).includes('FROM public.business_trip_requests'),
    );
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toContain('company_id = $1::text');
    expect(params[0]).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });

  it('createLateEarlyRequest persists company_id as text slug', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'le-1', company_id: 'holding', status: 'pending' }],
      });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.createLateEarlyRequest(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV001',
        employee_name: 'Test',
        request_date: '2026-05-29',
        request_type: 'late',
        reason: 'traffic',
      },
      `Bearer ${token}`,
    );
    const insertCall = queryMock.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO public.late_early_requests'));
    expect(insertCall).toBeDefined();
    expect((insertCall as [string, unknown[]])[1][1]).toBe('holding');
    expect(row.company_id).toBe('holding');
  });

  it('listShiftChangeRequests uses shift_change_requests table with scope filter', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    await svc.listShiftChangeRequests({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    const listCall = queryMock.mock.calls.find(
      ([sql]) => String(sql).includes('FROM public.shift_change_requests'),
    );
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toContain('company_id = $1::text');
    expect(params[0]).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });
});
