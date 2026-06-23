import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { LeaveRequestsService } from './leave-requests.service';

function findLeaveListSqlCall(calls: unknown[][]): [string, unknown[]] {
  const hit = calls.find((c) => String(c[0]).includes('SELECT lr.*'));
  if (!hit) {
    throw new Error('expected SELECT lr.* query');
  }
  return hit as [string, unknown[]];
}

describe('LeaveRequestsService listLeaveRequests SQL', () => {
  it('builds filter clauses when employee_id set', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    await svc.listLeaveRequests({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      employee_id: '11111111-1111-4111-8111-111111111111',
    });
    const [sql, params] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(sql).toContain('lr.employee_id IN');
    expect(sql).toContain('lr.employee_id = $');
    expect(sql).not.toMatch(/lr\.company_id\s*=\s*\$\d+::uuid/);
    expect(params).toContain('11111111-1111-4111-8111-111111111111');
  });

  it('uses workforce scope for internal key on company_id=main with tenant xevn', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 'lr-1' }] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const out = await svc.listLeaveRequests({ company_id: 'main' }, undefined, 'xevn');
    const [sql] = findLeaveListSqlCall(queryMock.mock.calls);
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
          attachment_url: null,
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
    const schemaCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('attachment_url TEXT NULL'),
    );
    expect(schemaCall).toBeDefined();
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [sql, params] = insertCall as [string, unknown[]];
    expect(String(sql)).toContain('public.leave_requests');
    expect(String(sql)).toContain('attachment_url');
    expect(params).toContain(null);
    expect(row.id).toBe('lr-new');
    expect(fanoutMock.onLeaveRequestCreated).toHaveBeenCalled();
  });

  it('PCOMP-W7-BE-LEAVE-DOC: createLeaveRequest persists attachment_url for sick leave', async () => {
    const attachmentUrl =
      '/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf';
    const queryMock = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 'lr-sick',
          company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          employee_id: '11111111-1111-4111-8111-111111111111',
          employee_code: 'NV0001',
          employee_name: 'Nguyen Van A',
          leave_type: 'sick',
          start_date: '2026-06-10',
          end_date: '2026-06-12',
          reason: 'Nghi om',
          status: 'pending',
          requested_at: '2026-06-09T00:00:00.000Z',
          reviewed_at: null,
          reviewed_by: null,
          department: null,
          position: null,
          total_days: '3',
          handover_to: null,
          handover_tasks: null,
          approver_employee_id: null,
          rejected_reason: null,
          attachment_url: attachmentUrl,
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
      leave_type: 'sick',
      start_date: '2026-06-10',
      end_date: '2026-06-12',
      total_days: 3,
      attachment_url: attachmentUrl,
    });
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [, params] = insertCall as [string, unknown[]];
    expect(params).toContain(attachmentUrl);
    expect(row.attachment_url).toBe(attachmentUrl);
  });

  it('PCOMP-W7-BE-LEAVE-DOC: VAL-W7-LATT-02 rejects attachment_url outside /api/hrm/files/', async () => {
    const queryMock = jest.fn();
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    await expect(
      svc.createLeaveRequest({
        company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'sick',
        start_date: '2026-06-10',
        end_date: '2026-06-12',
        total_days: 3,
        attachment_url: 'https://evil.example.com/doc.pdf',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-LEAVE-VAL-ATT' });
    const insertCalls = queryMock.mock.calls.filter((c) => String(c[0]).includes('INSERT INTO'));
    expect(insertCalls).toHaveLength(0);
  });

  it('PCOMP-W7-BE-LEAVE-DOC: listLeaveRequests SELECT lr.* includes attachment_url column path', async () => {
    const attachmentUrl =
      '/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf';
    const queryMock = jest.fn().mockResolvedValue({
      rows: [{ id: 'lr-1', attachment_url: attachmentUrl }],
    });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const out = await svc.listLeaveRequests({
      company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      employee_id: '11111111-1111-4111-8111-111111111111',
    });
    const schemaCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('attachment_url TEXT NULL'),
    );
    expect(schemaCall).toBeDefined();
    const [listSql] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(listSql).toContain('lr.*');
    expect(out.data[0]?.attachment_url).toBe(attachmentUrl);
  });

  it('D-MOB-PARITY-LEAVE-SLUG-01: holding slug uses workforce scope (no holding::uuid cast)', async () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 'lr-1' }] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    const out = await svc.listLeaveRequests(
      { company_id: 'holding', employee_id: employeeId },
      `Bearer ${token}`,
      'xevn',
    );
    const [sql] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(sql).toContain('lr.employee_id IN');
    expect(sql).not.toMatch(/lr\.company_id\s*=\s*\$\d+::uuid/);
    expect(sql).not.toContain('holding::uuid');
    expect(out.total).toBe(1);
  });

  it('D-MOB-PARITY-LEAVE-SLUG-01: company_uuid query normalizes to holding slug scope', async () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never);
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'employee',
    });
    await svc.listLeaveRequests({ company_id: holdingUuid }, `Bearer ${token}`, 'xevn');
    const [sql, params] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(sql).toContain('lr.employee_id IN');
    expect(sql).not.toMatch(/lr\.company_id\s*=\s*\$\d+::uuid/);
    expect(params).toContain('holding');
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
    const [sql] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(sql).toContain('employee_id IN');
    expect(sql).not.toContain('lr.company_id = $1::uuid');
    expect(out.total).toBe(1);
  });
});
