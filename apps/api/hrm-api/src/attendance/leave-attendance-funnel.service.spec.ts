/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-01 · BE-02 FIX date coerce
 * Purpose: Jest — materialize · reverse · conflict · locked · scope · Date/ISO expand
 */
import { ApiException } from '../common/api.exception';
import { HRM_COMPANY_UUID_BY_SLUG } from '../common/hrm-list-scope';
import { signServiceJwt } from '../common/jwt-sign';
import {
  expandLeaveDateRange,
  HRM_ATT_LEAVE_FUNNEL_CONFLICT,
  HRM_ATT_SHEET_LOCKED,
  LeaveAttendanceFunnelService,
  toLeaveDayKey,
} from './leave-attendance-funnel.service';
import { LeaveRequestsService } from './leave-requests.service';
import { AttendanceService } from './attendance.service';

describe('expandLeaveDateRange', () => {
  it('expands inclusive calendar days', () => {
    expect(expandLeaveDateRange('2026-08-10', '2026-08-12')).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
    ]);
  });

  it('returns single day when start=end', () => {
    expect(expandLeaveDateRange('2026-08-10', '2026-08-10')).toEqual([
      '2026-08-10',
    ]);
  });

  it('BE-02: pg Date object → non-empty days (not String(Date).slice)', () => {
    // node-pg DATE → local midnight Date — String(d).slice(0,10) === "Thu Oct 0…"
    const start = new Date(2026, 9, 8); // local Oct 8
    const end = new Date(2026, 9, 9);
    expect(String(start).slice(0, 10)).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toLeaveDayKey(start)).toBe('2026-10-08');
    expect(expandLeaveDateRange(start, end)).toEqual([
      '2026-10-08',
      '2026-10-09',
    ]);
  });

  it('BE-02: ISO datetime → leading calendar day keys', () => {
    expect(
      expandLeaveDateRange(
        '2026-10-07T17:00:00.000Z',
        '2026-10-08T16:59:59.999Z',
      ),
    ).toEqual(['2026-10-07', '2026-10-08']);
  });
});

describe('LeaveAttendanceFunnelService', () => {
  const leave = {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    company_id: 'holding',
    employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
    leave_type: 'annual',
    start_date: '2026-08-10',
    end_date: '2026-08-11',
  };

  function createFunnel(queryMock: jest.Mock) {
    return new LeaveAttendanceFunnelService({ query: queryMock } as never);
  }

  it('materialize: UPSERT leave markers for each day (VAL-FUNNEL-01)', async () => {
    const upsertDays: string[] = [];
    const queryMock = jest
      .fn()
      .mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('FROM public.attendance_sheets')) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes("status = 'present'")) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('INSERT INTO public.attendance_records')) {
          const day = String(params?.[3] ?? '');
          upsertDays.push(day);
          return Promise.resolve({
            rows: [{ id: `rec-${day}`, attendance_date: day }],
          });
        }
        return Promise.resolve({ rows: [] });
      });

    const funnel = createFunnel(queryMock);
    const result = await funnel.materializeApprovedLeave(leave);
    expect(result.materialized_days).toEqual(['2026-08-10', '2026-08-11']);
    expect(result.materialized_record_ids).toHaveLength(2);
    expect(upsertDays).toEqual(['2026-08-10', '2026-08-11']);
    const insertSql = String(
      queryMock.mock.calls.find((c) =>
        String(c[0]).includes('INSERT INTO public.attendance_records'),
      )?.[0],
    );
    expect(insertSql).toContain('leave_request_id');
    expect(insertSql).toContain('leave_type_key');
  });

  it('materialize: present overlap → 409 HRM-ATT-LEAVE-FUNNEL-CONFLICT', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('CREATE UNIQUE')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('FROM public.attendance_sheets')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes("status = 'present'")) {
        return Promise.resolve({
          rows: [{ attendance_date: '2026-08-10', status: 'present' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const funnel = createFunnel(queryMock);
    await expect(
      funnel.materializeApprovedLeave(leave),
    ).rejects.toMatchObject({
      code: HRM_ATT_LEAVE_FUNNEL_CONFLICT,
      status: 409,
    });
  });

  it('materialize: closed/submitted sheet overlap → 409 HRM-ATT-SHEET-LOCKED', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('CREATE UNIQUE')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('FROM public.attendance_sheets')) {
        return Promise.resolve({
          rows: [{ id: 'sheet-1', status: 'closed', day: '2026-08-10' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const funnel = createFunnel(queryMock);
    await expect(
      funnel.materializeApprovedLeave(leave),
    ).rejects.toMatchObject({
      code: HRM_ATT_SHEET_LOCKED,
      status: 409,
    });
  });

  it('BE-02: materialize with pg Date leave row → LOCKED still fires (non-empty days)', async () => {
    const sheetDayParams: unknown[] = [];
    const queryMock = jest
      .fn()
      .mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('FROM public.attendance_sheets')) {
          sheetDayParams.push(params?.[1]);
          return Promise.resolve({
            rows: [{ id: 'sheet-sept', status: 'closed', day: '2026-09-15' }],
          });
        }
        return Promise.resolve({ rows: [] });
      });

    const funnel = createFunnel(queryMock);
    const leaveWithPgDates = {
      ...leave,
      start_date: new Date(2026, 8, 15), // Sep 15 local — String(d).slice ≠ YYYY-MM-DD
      end_date: new Date(2026, 8, 16),
    };
    expect(String(leaveWithPgDates.start_date).slice(0, 10)).not.toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );

    await expect(
      funnel.materializeApprovedLeave(leaveWithPgDates),
    ).rejects.toMatchObject({
      code: HRM_ATT_SHEET_LOCKED,
      status: 409,
    });
    expect(sheetDayParams[0]).toEqual(['2026-09-15', '2026-09-16']);
  });

  it('reverse: clears markers by leave_request_id when sheet open', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('CREATE UNIQUE')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('WHERE leave_request_id') && s.includes('SELECT')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r1',
              company_id: 'holding',
              attendance_date: '2026-08-10',
            },
          ],
        });
      }
      if (s.includes('FROM public.attendance_sheets')) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes('UPDATE public.attendance_records') &&
        s.includes('leave_request_id = NULL')
      ) {
        return Promise.resolve({ rows: [{ id: 'r1' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const funnel = createFunnel(queryMock);
    const result = await funnel.reverseLeaveMarkers(leave.id, 'holding');
    expect(result.cleared).toBe(1);
  });

  it('reverse: closed sheet → 409 HRM-ATT-SHEET-LOCKED', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX') ||
        s.includes('CREATE UNIQUE')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('WHERE leave_request_id') && s.includes('SELECT')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r1',
              company_id: 'holding',
              attendance_date: '2026-08-10',
            },
          ],
        });
      }
      if (s.includes('FROM public.attendance_sheets')) {
        return Promise.resolve({
          rows: [{ id: 'sheet-closed', status: 'closed', day: '2026-08-10' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const funnel = createFunnel(queryMock);
    await expect(
      funnel.reverseLeaveMarkers(leave.id),
    ).rejects.toMatchObject({
      code: HRM_ATT_SHEET_LOCKED,
      status: 409,
    });
  });

  it('scope: company expand includes holding UUID for TEXT ladder (F-ATT-LEAVE-FUNNEL-04)', async () => {
    const companyArrays: string[][] = [];
    const queryMock = jest
      .fn()
      .mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('FROM public.attendance_sheets')) {
          companyArrays.push((params?.[0] as string[]) ?? []);
          return Promise.resolve({ rows: [] });
        }
        if (s.includes("status = 'present'")) {
          companyArrays.push((params?.[0] as string[]) ?? []);
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('INSERT INTO public.attendance_records')) {
          return Promise.resolve({
            rows: [{ id: 'rec-1', attendance_date: String(params?.[3]) }],
          });
        }
        return Promise.resolve({ rows: [] });
      });

    const funnel = createFunnel(queryMock);
    await funnel.materializeApprovedLeave(leave);
    expect(companyArrays.length).toBeGreaterThan(0);
    const keys = companyArrays[0];
    expect(keys).toEqual(
      expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]),
    );
  });
});

describe('LeaveRequestsService approve → funnel hook', () => {
  it('approveLeaveRequest calls materialize and echoes materialized_days', async () => {
    const leaveRow = {
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      company_id: 'holding',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      employee_code: 'NV001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-08-10',
      end_date: '2026-08-10',
      reason: null,
      status: 'approved',
      requested_at: '2026-08-01T00:00:00.000Z',
      reviewed_at: '2026-08-02T00:00:00.000Z',
      reviewed_by: 'mgr',
      department: null,
      position: null,
      total_days: '1',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes(
          'SELECT company_id::text AS company_id, status FROM public.leave_requests',
        )
      ) {
        return Promise.resolve({
          rows: [{ company_id: 'holding', status: 'pending' }],
        });
      }
      if (s.includes("SET status = 'approved'")) {
        return Promise.resolve({ rows: [leaveRow] });
      }
      if (
        s.includes('FROM public.employee_leave_balances') ||
        s.includes('UPDATE public.employee_leave_balances')
      ) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
    const funnel = {
      materializeApprovedLeave: jest.fn().mockResolvedValue({
        materialized_days: ['2026-08-10'],
        materialized_record_ids: ['rec-1'],
      }),
      reverseLeaveMarkers: jest.fn(),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      { onLeaveRequestDecided: jest.fn() } as never,
      { startLeaveWorkflowIfConfigured: jest.fn() } as never,
      undefined,
      undefined,
      undefined,
      funnel as never,
    );
    const auth = `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
    const row = await svc.approveLeaveRequest(
      leaveRow.id,
      { reviewer_name: 'mgr' },
      'main',
      auth,
      'xevn',
    );
    expect(funnel.materializeApprovedLeave).toHaveBeenCalledWith(
      expect.objectContaining({ id: leaveRow.id, leave_type: 'annual' }),
    );
    expect(row.materialized_days).toEqual(['2026-08-10']);
    expect(row.materialized_record_ids).toEqual(['rec-1']);
  });

  it('cancelLeaveRequest after approved calls reverseLeaveMarkers', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes('CREATE TABLE') ||
        s.includes('ALTER TABLE') ||
        s.includes('CREATE INDEX')
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes(
          'SELECT company_id::text AS company_id, status FROM public.leave_requests',
        )
      ) {
        return Promise.resolve({
          rows: [{ company_id: 'holding', status: 'approved' }],
        });
      }
      if (s.includes("SET status = 'cancelled'")) {
        return Promise.resolve({
          rows: [
            {
              id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
              company_id: 'holding',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              employee_code: 'NV001',
              employee_name: 'A',
              leave_type: 'annual',
              start_date: '2026-08-10',
              end_date: '2026-08-10',
              reason: null,
              status: 'cancelled',
              requested_at: '2026-08-01T00:00:00.000Z',
              reviewed_at: '2026-08-02T00:00:00.000Z',
              reviewed_by: 'mgr',
              department: null,
              position: null,
              total_days: '1',
              handover_to: null,
              handover_tasks: null,
              approver_employee_id: null,
              rejected_reason: null,
              attachment_url: null,
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const funnel = {
      materializeApprovedLeave: jest.fn(),
      reverseLeaveMarkers: jest.fn().mockResolvedValue({ cleared: 1 }),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      { onLeaveRequestDecided: jest.fn() } as never,
      { startLeaveWorkflowIfConfigured: jest.fn() } as never,
      undefined,
      undefined,
      undefined,
      funnel as never,
    );
    const auth = `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
    await svc.cancelLeaveRequest(
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      { reviewer_name: 'mgr' },
      'main',
      auth,
      'xevn',
    );
    expect(funnel.reverseLeaveMarkers).toHaveBeenCalledWith(
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      'holding',
    );
  });
});

describe('AttendanceService GET records leave display-ready', () => {
  it('mapRecord exposes leave_request_id + leave_type_label (F-ATT-LEAVE-FUNNEL-03)', async () => {
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('SELECT COUNT(*)::text AS total')) {
          return Promise.resolve({ rows: [{ total: '1' }] });
        }
        if (
          s.includes('FROM public.attendance_records') &&
          s.includes('LIMIT')
        ) {
          return Promise.resolve({
            rows: [
              {
                id: 'r-leave',
                company_id: 'holding',
                employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
                attendance_date: '2026-08-10',
                check_in_at: null,
                check_out_at: null,
                status: 'leave',
                note: 'Nghỉ phép: Phép năm',
                created_by: 'leave-funnel',
                created_at: '2026-08-02T00:00:00.000Z',
                updated_at: '2026-08-02T00:00:00.000Z',
                leave_request_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
                leave_type_key: 'annual',
              },
            ],
          });
        }
        return Promise.resolve({ rows: [] });
      }),
    };
    const config = {
      ensureWorkSitesSchema: jest.fn().mockResolvedValue(undefined),
      isGpsGeofenceEnabled: jest.fn().mockResolvedValue(false),
    };
    const svc = new AttendanceService(
      db as never,
      {} as never,
      config as never,
    );
    const result = await svc.listRecords({
      company_id: 'holding',
      from_date: '2026-08-01',
      to_date: '2026-08-31',
      page: 1,
      page_size: 20,
    });
    expect(result.data[0]).toMatchObject({
      status: 'leave',
      status_label: 'Nghỉ phép',
      leave_request_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      leave_type_key: 'annual',
      leave_type: 'annual',
      leave_type_label: 'Phép năm',
      attendance_date: '2026-08-10',
    });
    const selectSql = String(
      db.query.mock.calls.find(
        (c) =>
          String(c[0]).includes('FROM public.attendance_records') &&
          String(c[0]).includes('LIMIT'),
      )?.[0],
    );
    expect(selectSql).toContain('leave_request_id');
    expect(selectSql).toContain('leave_type_key');
  });
});
