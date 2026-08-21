import { signServiceJwt } from '../common/jwt-sign';
import { ApiException } from '../common/api.exception';
import { AttendanceRequestsService } from './attendance-requests.service';
import { HttpStatus } from '@nestjs/common';

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
    const out = await svc.listOvertimeRequests(
      { company_id: 'main' },
      `Bearer ${token}`,
    );
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
    const listCall = queryMock.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.business_trip_requests'),
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
    const insertCall = queryMock.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.late_early_requests'),
    );
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
    const listCall = queryMock.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.shift_change_requests'),
    );
    const [sql, params] = listCall as [string, unknown[]];
    expect(sql).toContain('company_id = $1::text');
    expect(params[0]).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  });

  it('PO-MFD-M2: approveOvertimeRequest allows trsport row when resolved scope is trsport (member mgr)', async () => {
    const requestId = '22222222-2222-4222-8222-222222222222';
    const otRow = {
      id: requestId,
      company_id: 'trsport',
      employee_id: '11111111-1111-4111-8111-111111111111',
      status: 'pending',
      total_hours: 4,
      compensation_type: 'salary',
      overtime_date: '2026-08-01',
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes('FROM public.overtime_requests') &&
        s.includes('SELECT id')
      ) {
        return Promise.resolve({ rows: [otRow] });
      }
      if (s.includes('SELECT company_id FROM public.overtime_requests')) {
        return Promise.resolve({ rows: [{ company_id: 'trsport' }] });
      }
      if (s.includes('UPDATE public.overtime_requests')) {
        return Promise.resolve({
          rows: [{ ...otRow, status: 'approved' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'trsport.mgr@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      roleCode: 'manager',
    });
    const row = await svc.approveOvertimeRequest(
      requestId,
      { reviewer_name: 'Mgr' },
      'trsport',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('approved');
  });

  it('PO-MFD-M2: approveOvertimeRequest rejects raw main scope for member mgr trsport row', async () => {
    const requestId = '33333333-3333-4333-8333-333333333333';
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes('FROM public.overtime_requests') &&
        s.includes('SELECT id')
      ) {
        return Promise.resolve({
          rows: [
            {
              id: requestId,
              company_id: 'trsport',
              employee_id: '11111111-1111-4111-8111-111111111111',
              status: 'pending',
              total_hours: 4,
              compensation_type: 'salary',
              overtime_date: '2026-08-01',
            },
          ],
        });
      }
      if (s.includes('SELECT company_id FROM public.overtime_requests')) {
        return Promise.resolve({ rows: [{ company_id: 'trsport' }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'trsport.mgr@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      roleCode: 'manager',
    });
    await expect(
      svc.approveOvertimeRequest(
        requestId,
        { reviewer_name: 'Mgr' },
        'main',
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('PO-MFD-M2: createOvertimeRequest uses resolvedCompanyId when body.company_id omitted', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'ot-new', company_id: 'trsport', status: 'pending' }],
      });
    const svc = new AttendanceRequestsService({ query: queryMock } as never);
    const token = signServiceJwt({
      sub: 'nv@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      roleCode: 'employee',
    });
    const row = await svc.createOvertimeRequest(
      {
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV001',
        employee_name: 'Test',
        overtime_date: '2026-08-04',
        start_time: '18:00',
        end_time: '20:00',
        total_hours: 2,
        overtime_type: 'weekday',
        reason: 'deadline',
      },
      `Bearer ${token}`,
      'trsport',
    );
    expect(row.company_id).toBe('trsport');
  });

  it('VAL-ATT-SHIFT-CNS-01 wire: createShiftChangeRequest invent → HRM-ATT-SHIFT-KEY', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const assertShiftKeysForConsumer = jest.fn().mockRejectedValue(
      new ApiException('HRM-ATT-SHIFT-KEY', 'invent', HttpStatus.BAD_REQUEST, {
        field: 'requested_shift',
      }),
    );
    const catalog = { assertShiftKeysForConsumer } as never;
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      catalog,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await expect(
      svc.createShiftChangeRequest(
        {
          company_id: 'main',
          employee_id: '11111111-1111-4111-8111-111111111111',
          employee_code: 'NV001',
          employee_name: 'Test',
          change_date: '2026-08-08',
          change_type: 'permanent',
          current_shift: 'morning',
          requested_shift: 'ghost-shift-xyz',
          reason: 'need later start',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-ATT-SHIFT-KEY' });

    expect(assertShiftKeysForConsumer).toHaveBeenCalled();
    expect(
      queryMock.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO public.shift_change_requests'),
      ),
    ).toBe(false);
  });

  it('VAL-ATT-SHIFT-CNS-01 wire: createShiftChangeRequest passes Nest keys when catalog OK', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('INSERT INTO public.shift_change_requests')) {
        return Promise.resolve({
          rows: [
            {
              id: 'sc-1',
              company_id: 'holding',
              current_shift: 'morning',
              requested_shift: 'afternoon',
              status: 'pending',
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const assertShiftKeysForConsumer = jest.fn().mockResolvedValue(undefined);
    const catalog = { assertShiftKeysForConsumer } as never;
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      catalog,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const row = await svc.createShiftChangeRequest(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV001',
        employee_name: 'Test',
        change_date: '2026-08-08',
        change_type: 'temporary',
        current_shift: 'morning',
        requested_shift: 'afternoon',
        reason: 'meeting',
      },
      `Bearer ${token}`,
    );

    expect(row.status).toBe('pending');
    expect(assertShiftKeysForConsumer).toHaveBeenCalledWith(
      expect.objectContaining({
        currentShift: 'morning',
        requestedShift: 'afternoon',
      }),
    );
  });

  it('VAL-ATT-OT-CNS-01 wire: createOvertimeRequest invent → HRM-ATT-OT-TYPE-KEY', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const assertOtTypeInEffectiveCatalog = jest.fn().mockRejectedValue(
      new ApiException(
        'HRM-ATT-OT-TYPE-KEY',
        'invent',
        HttpStatus.BAD_REQUEST,
        {
          overtime_type: 'ghost_ot',
        },
      ),
    );
    const otCatalog = { assertOtTypeInEffectiveCatalog } as never;
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      undefined,
      otCatalog,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await expect(
      svc.createOvertimeRequest(
        {
          company_id: 'main',
          employee_id: '11111111-1111-4111-8111-111111111111',
          employee_code: 'NV001',
          employee_name: 'Test',
          overtime_date: '2026-08-08',
          start_time: '18:00',
          end_time: '20:00',
          total_hours: 2,
          overtime_type: 'ghost_ot',
          reason: 'deadline',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-ATT-OT-TYPE-KEY' });

    expect(assertOtTypeInEffectiveCatalog).toHaveBeenCalled();
    expect(
      queryMock.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO public.overtime_requests'),
      ),
    ).toBe(false);
  });

  it('VAL-ATT-OT-CNS-05 wire: createOvertimeRequest soft-skip when EFF empty', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('INSERT INTO public.overtime_requests')) {
        return Promise.resolve({
          rows: [
            {
              id: 'ot-1',
              company_id: 'holding',
              overtime_type: 'weekday',
              status: 'pending',
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const assertOtTypeInEffectiveCatalog = jest.fn().mockResolvedValue(null);
    const otCatalog = { assertOtTypeInEffectiveCatalog } as never;
    const svc = new AttendanceRequestsService(
      { query: queryMock } as never,
      undefined,
      otCatalog,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const row = await svc.createOvertimeRequest(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV001',
        employee_name: 'Test',
        overtime_date: '2026-08-08',
        start_time: '18:00',
        end_time: '20:00',
        total_hours: 2,
        overtime_type: 'weekday',
        reason: 'deadline',
      },
      `Bearer ${token}`,
    );

    expect(row.status).toBe('pending');
    expect(assertOtTypeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ overtimeType: 'weekday' }),
    );
  });
});
