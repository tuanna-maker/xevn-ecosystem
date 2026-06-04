import { signServiceJwt } from '../common/jwt-sign';
import { LeaveRequestsService } from './leave-requests.service';

describe('LeaveRequestsService listLeaveRequests SQL', () => {
  it('builds filter clauses when employee_id set', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    await svc.listLeaveRequests({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      employee_id: '11111111-1111-4111-8111-111111111111',
    });
    const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('lr.company_id = $1::uuid');
    expect(sql).toContain('lr.employee_id = $2::uuid');
    expect(params).toEqual([
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111',
    ]);
  });

  it('uses workforce scope for internal key on company_id=main with tenant xevn', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 'lr-1' }] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const out = await svc.listLeaveRequests({ company_id: 'main' }, undefined, 'xevn');
    const [sql] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('employee_id IN');
    expect(out.total).toBe(1);
  });

  it('HRM-AT-10: createLeaveRequest inserts leave row with company scope', async () => {
    const queryMock = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 'lr-new',
          company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          employee_id: '11111111-1111-4111-8111-111111111111',
          employee_code: 'NV0001',
          employee_name: 'Nguyen Van A',
          leave_type: 'annual',
          start_date: '2026-05-01',
          end_date: '2026-05-03',
          reason: null,
          status: 'pending',
          requested_at: '2026-05-01T00:00:00.000Z',
          reviewed_at: null,
          reviewed_by: null,
          department: null,
          position: null,
          total_days: '3',
          handover_to: null,
          handover_tasks: null,
          approver_employee_id: null,
          rejected_reason: null,
        },
      ],
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService({ query: queryMock } as never, fanoutMock as never);
    const row = await svc.createLeaveRequest({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-05-01',
      end_date: '2026-05-03',
      total_days: 3,
    });
    const [sql] = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    expect(String(sql)).toContain('public.leave_requests');
    expect(row.id).toBe('lr-new');
    expect(fanoutMock.onLeaveRequestCreated).toHaveBeenCalled();
  });

  it('HRM-AT-11: uses workforce scope for group CEO on company_id=main', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 'lr-1' }] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const out = await svc.listLeaveRequests({ company_id: 'main' }, `Bearer ${token}`);
    const [sql] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('employee_id IN');
    expect(sql).not.toContain('lr.company_id = $1::uuid');
    expect(out.total).toBe(1);
  });
});
