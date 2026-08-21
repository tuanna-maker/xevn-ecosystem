import { signServiceJwt } from '../common/jwt-sign';
import { AttendanceService } from '../attendance/attendance.service';
import { HrmDbService } from '../db/hrm-db.service';
import { HomeService } from './home.service';

describe('HomeService (PCOMP-W4-BE-HUB-04a)', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
  const managerId = 'ea430f27-74f3-4f03-99ee-1e44cb407bd9';
  const employeeId = '11111111-1111-4111-8111-111111111111';

  const db = { query: jest.fn() };
  const attendance = { listUpdateRequests: jest.fn(), listRecords: jest.fn() };

  const service = new HomeService(
    db as unknown as HrmDbService,
    attendance as unknown as AttendanceService,
  );

  const managerToken = () =>
    `Bearer ${signServiceJwt({
      sub: 'uat.manager@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: managerId,
      roles: ['employee', 'manager'],
    })}`;

  const employeeToken = () =>
    `Bearer ${signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: employeeId,
      roles: ['employee'],
    })}`;

  beforeEach(() => {
    jest.clearAllMocks();
    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('hrm_inbox_notifications')) {
        return {
          rows: [
            {
              id: 'inbox-1',
              event_type: 'leave_request.created',
              payload: {
                type: 'leave_request.created',
                request: { employee_name: 'Trần B', id: 'lr-1' },
              },
              read_at: null,
              created_at: '2026-06-07T08:00:00Z',
            },
          ],
        };
      }
      if (
        text.includes('substring(e.custom_fields') &&
        text.includes('FROM public.employees e')
      ) {
        return { rows: [] };
      }
      if (text.includes('FROM public.leave_requests')) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            id: managerId,
            full_name: 'UAT Manager',
            company_id: 'holding',
            custom_fields: { date_of_birth: '1990-06-07' },
          },
        ],
      };
    });
    attendance.listUpdateRequests.mockResolvedValue({ total: 0, data: [] });
    attendance.listRecords.mockResolvedValue({
      total: 1,
      page: 1,
      page_size: 1,
      data: [{ check_in_at: '2026-06-07T08:02:00+07:00', status: 'present' }],
    });
  });

  it('BR-MGR-TASK-03: manager_pending total_count = leave_count + update_count (direct reports only)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('hrm_inbox_notifications')) {
        return { rows: [] };
      }
      if (
        text.includes('FROM public.leave_requests') &&
        text.includes('manager_id')
      ) {
        return {
          rows: [
            {
              id: 'lr-m1',
              employee_name: 'Trần B',
              employee_code: 'NV001',
              leave_type: 'LVT_ANNUAL',
              start_date: '2026-07-01',
              end_date: '2026-07-03',
              requested_at: '2026-06-07T07:00:00Z',
            },
            {
              id: 'lr-m2',
              employee_name: 'Lê C',
              employee_code: 'NV002',
              leave_type: 'LVT_ANNUAL',
              start_date: '2026-07-05',
              end_date: '2026-07-06',
              requested_at: '2026-06-07T06:00:00Z',
            },
          ],
        };
      }
      if (text.includes('FROM public.leave_requests')) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            id: managerId,
            full_name: 'UAT Manager',
            company_id: 'holding',
            custom_fields: { date_of_birth: '1990-06-07' },
          },
        ],
      };
    });
    attendance.listUpdateRequests.mockImplementation(async (query) => {
      if (query.manager_employee_id) {
        return {
          total: 1,
          data: [
            {
              id: 'ur-m1',
              employee_name: 'Phạm D',
              employee_code: 'NV003',
              attendance_date: '2026-06-06',
              created_at: '2026-06-07T05:00:00Z',
            },
          ],
        };
      }
      return { total: 0, data: [] };
    });

    const summary = await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );

    expect(summary.manager_pending.leave_count).toBe(2);
    expect(summary.manager_pending.update_count).toBe(1);
    expect(summary.manager_pending.total_count).toBe(3);
    expect(summary.manager_pending.preview).toHaveLength(3);

    const managerLeaveCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        String(sql).includes('manager_id'),
    );
    expect(managerLeaveCall).toBeDefined();
    expect(String(managerLeaveCall?.[0])).toContain('lr.employee_id IN');
    expect(attendance.listUpdateRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'holding',
        status: 'pending',
        manager_employee_id: managerId,
      }),
      expect.stringContaining('Bearer'),
      'xevn',
    );
  });

  it('BR-MGR-TASK-02: manager filter uses manager_employee_id (direct reports via employees.manager_id)', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );
    const managerLeaveCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        String(sql).includes('manager_id'),
    );
    expect(managerLeaveCall).toBeDefined();
    const managerUpdateCall = attendance.listUpdateRequests.mock.calls.find(
      ([q]) => q.manager_employee_id === managerId,
    );
    expect(managerUpdateCall).toBeDefined();
  });

  it('non-manager JWT skips manager_pending aggregation (BR-MGR-TASK-05)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (
        text.includes('hrm_inbox_notifications') ||
        text.includes('substring(e.custom_fields') ||
        text.includes('FROM public.leave_requests')
      ) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            id: employeeId,
            full_name: 'UAT NV',
            company_id: 'holding',
            custom_fields: {},
          },
        ],
      };
    });
    const summary = await service.getSummary(
      { company_id: 'holding', employee_id: employeeId },
      employeeToken(),
      'xevn',
    );
    expect(summary.viewer.is_manager).toBe(false);
    expect(summary.manager_pending.total_count).toBe(0);
    const managerLeaveCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        String(sql).includes('manager_id'),
    );
    expect(managerLeaveCall).toBeUndefined();
  });

  it('tasks include inbox + own pending; own queries use employee_id not manager_employee_id (BR-MGR-TASK-07)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('hrm_inbox_notifications')) {
        return {
          rows: [
            {
              id: 'inbox-1',
              event_type: 'leave_request.created',
              payload: {
                type: 'leave_request.created',
                request: { employee_name: 'Trần B', id: 'lr-1' },
              },
              read_at: null,
              created_at: '2026-06-07T08:00:00Z',
            },
          ],
        };
      }
      if (
        text.includes('FROM public.leave_requests') &&
        !text.includes('manager_id')
      ) {
        return {
          rows: [
            {
              id: 'lr-own',
              start_date: '2026-07-01',
              end_date: '2026-07-02',
              requested_at: '2026-06-06T10:00:00Z',
              employee_name: null,
              employee_code: null,
              leave_type: 'LVT_ANNUAL',
            },
          ],
        };
      }
      if (text.includes('FROM public.leave_requests')) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            id: managerId,
            full_name: 'UAT Manager',
            company_id: 'holding',
            custom_fields: { date_of_birth: '1990-06-07' },
          },
        ],
      };
    });

    const summary = await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );

    expect(summary.tasks.unread_inbox_count).toBe(1);
    expect(summary.tasks.own_pending_count).toBe(1);
    expect(summary.tasks.items.some((item) => item.kind === 'inbox')).toBe(
      true,
    );
    expect(
      summary.tasks.items.some((item) => item.kind === 'own_pending_leave'),
    ).toBe(true);
  });

  it('04a response must not contain birth_year anywhere (BR-BDAY-01 / BR-BDAY-02)', async () => {
    const summary = await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );
    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain('birth_year');
    expect(serialized).not.toMatch(/"date_of_birth"/);
    expect(summary.viewer).not.toHaveProperty('date_of_birth');
    expect(summary.celebrations.items).toEqual([]);
  });

  it('resolveHrmListScope enforced on viewer load — workforce filter in employee SQL', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );
    const [sql] = db.query.mock.calls[0] ?? [];
    expect(String(sql)).toContain('FROM public.employees');
    expect(String(sql)).toContain('e.id = $1::uuid');
  });

  it('include=tasks only omits manager_pending queries', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId, include: 'tasks' },
      managerToken(),
      'xevn',
    );
    const managerLeaveCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        String(sql).includes('manager_id'),
    );
    expect(managerLeaveCall).toBeUndefined();
  });

  it('D-W7-HOME-TASKS-SLUG-01: holding slug scopes tasks leave via lr.employee_id IN (no ::uuid cast)', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId, include: 'tasks' },
      managerToken(),
      'xevn',
    );

    const ownLeaveCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        !String(sql).includes('manager_id'),
    );
    expect(ownLeaveCall).toBeDefined();
    expect(String(ownLeaveCall?.[0])).toContain('lr.employee_id IN');
    expect(String(ownLeaveCall?.[0])).not.toMatch(
      /lr\.company_id\s*=\s*\$\d+::uuid/,
    );
  });

  it('D-W7-HOME-TASKS-SLUG-01: holding slug inbox uses expanded UUID filter (no holding::uuid cast)', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId, include: 'tasks' },
      managerToken(),
      'xevn',
    );

    const inboxCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('hrm_inbox_notifications'),
    );
    expect(inboxCall).toBeDefined();
    expect(String(inboxCall?.[0])).toMatch(/company_id = \$|company_id = ANY/);
    expect(String(inboxCall?.[0])).not.toContain('holding::uuid');
  });

  it('holding slug full include tasks+manager_pending+celebrations+whos_out uses workforce scope on leave blocks', async () => {
    await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'tasks,manager_pending,celebrations,whos_out',
      },
      managerToken(),
      'xevn',
    );

    const leaveCalls = db.query.mock.calls.filter(([sql]) =>
      String(sql).includes('leave_requests'),
    );
    expect(leaveCalls.length).toBeGreaterThanOrEqual(2);
    for (const [sql] of leaveCalls) {
      expect(String(sql)).toContain('lr.employee_id IN');
      expect(String(sql)).not.toMatch(/lr\.company_id\s*=\s*\$\d+::uuid/);
    }
  });
});

describe('HomeService (PCOMP-W7-BE-04b-01 — celebrations + whos_out)', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
  const managerId = 'ea430f27-74f3-4f03-99ee-1e44cb407bd9';
  const birthdayEmployeeId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const outEmployeeId = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

  const db = { query: jest.fn() };
  const attendance = { listUpdateRequests: jest.fn(), listRecords: jest.fn() };

  const service = new HomeService(
    db as unknown as HrmDbService,
    attendance as unknown as AttendanceService,
  );

  const managerToken = () =>
    `Bearer ${signServiceJwt({
      sub: 'uat.manager@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: managerId,
      roles: ['employee', 'manager'],
    })}`;

  const todayMonthDay = () => {
    const iso = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date());
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? `${match[2]}-${match[3]}` : '06-07';
  };

  const todayIso = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(
      new Date(),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    const mmdd = todayMonthDay();
    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('e.id = $1::uuid')) {
        return {
          rows: [
            {
              id: managerId,
              full_name: 'UAT Manager',
              company_id: 'holding',
              custom_fields: { date_of_birth: `1990-${mmdd}` },
            },
          ],
        };
      }
      if (
        text.includes('substring(e.custom_fields') &&
        text.includes('FROM public.employees e')
      ) {
        return {
          rows: [
            {
              id: birthdayEmployeeId,
              full_name: 'Trần Thị B',
              avatar_url: '/api/hrm/files/holding/avatar-tran.jpg',
              custom_fields: {
                date_of_birth: `1992-${mmdd}`,
                tenant_id: 'xevn',
              },
            },
          ],
        };
      }
      if (text.includes('FROM public.leave_requests')) {
        return {
          rows: [
            {
              id: 'lr-out-1',
              employee_id: outEmployeeId,
              employee_name: 'Lê Văn C',
              leave_type: 'LVT_ANNUAL',
              full_name: 'Lê Văn C',
              avatar_url: null,
            },
          ],
        };
      }
      return { rows: [] };
    });
    attendance.listUpdateRequests.mockResolvedValue({ total: 0, data: [] });
    attendance.listRecords.mockResolvedValue({ total: 0, data: [] });
  });

  it('BR-BDAY-02: include=celebrations populates MM-DD only — no date_of_birth or birth_year', async () => {
    const summary = await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'celebrations',
      },
      managerToken(),
      'xevn',
    );

    expect(summary.celebrations.total_count).toBe(1);
    expect(summary.celebrations.items[0]).toMatchObject({
      employee_id: birthdayEmployeeId,
      display_name: 'Trần Thị B',
      month_day: todayMonthDay(),
      display_date: expect.stringMatching(/^\d{2}\/\d{2}$/),
      avatar_url: '/api/hrm/files/holding/avatar-tran.jpg',
      avatar_initials: 'TB',
    });
    const serialized = JSON.stringify(summary.celebrations);
    expect(serialized).not.toContain('birth_year');
    expect(serialized).not.toMatch(/"date_of_birth"/);
    expect(serialized).not.toMatch(/1992-/);
  });

  it('BR-BDAY-06: celebrations SQL uses pushWorkforceEmployeeScopeFilter (same as loadViewer)', async () => {
    await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'celebrations',
      },
      managerToken(),
      'xevn',
    );
    const celebrationCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('substring(e.custom_fields'),
    );
    expect(celebrationCall).toBeDefined();
    const [sql] = celebrationCall ?? [];
    expect(String(sql)).toContain("e.status = 'active'");
    expect(String(sql)).toContain('e.archived_at IS NULL');
    expect(String(sql)).toMatch(/e\.id IN|company_id = \$/);
  });

  it('celebrations SQL uses workforce scope filter for group CEO rollup', async () => {
    const groupCeoToken = () =>
      `Bearer ${signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        company_uuid: holdingUuid,
        employee_id: managerId,
        roleCode: 'group_ceo',
        roles: ['employee', 'manager'],
      })}`;

    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('e.id = $1::uuid')) {
        return {
          rows: [
            {
              id: managerId,
              full_name: 'Group CEO',
              company_id: 'holding',
              custom_fields: { tenant_id: 'xevn' },
            },
          ],
        };
      }
      if (
        text.includes('substring(e.custom_fields') &&
        text.includes('FROM public.employees e')
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    await service.getSummary(
      { company_id: 'main', employee_id: managerId, include: 'celebrations' },
      groupCeoToken(),
      'xevn',
    );
    const celebrationCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('substring(e.custom_fields'),
    );
    expect(celebrationCall).toBeDefined();
    const [sql] = celebrationCall ?? [];
    expect(String(sql)).toContain('e.id IN');
  });

  it('D-W7-HOME-WHOS-SLUG-01: holding slug scopes whos_out via lr.employee_id IN (no ::uuid cast)', async () => {
    await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'whos_out',
      },
      managerToken(),
      'xevn',
    );

    const whosOutCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('leave_requests'),
    );
    expect(whosOutCall).toBeDefined();
    const [sql] = whosOutCall ?? [];
    expect(String(sql)).toContain('lr.employee_id IN');
    expect(String(sql)).toContain('FROM public.employees');
    expect(String(sql)).not.toMatch(/lr\.company_id\s*=\s*\$\d+::uuid/);
  });

  it('BR-WHO-01/02: include=whos_out returns approved leaves covering today only', async () => {
    const summary = await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'whos_out',
      },
      managerToken(),
      'xevn',
    );

    expect(summary.whos_out.total_count).toBe(1);
    expect(summary.whos_out.items[0]).toEqual({
      employee_id: outEmployeeId,
      display_name: 'Lê Văn C',
      leave_type: 'LVT_ANNUAL',
      leave_request_id: 'lr-out-1',
      avatar_url: null,
    });

    const whosOutCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('leave_requests'),
    );
    expect(whosOutCall).toBeDefined();
    const [sql, params] = whosOutCall ?? [];
    expect(String(sql)).toContain("lr.status = 'approved'");
    expect(String(sql)).toContain('BETWEEN lr.start_date AND lr.end_date');
    expect(params?.[0]).toBe(todayIso());
  });

  it('holding slug include=celebrations,whos_out uses workforce scope on both blocks', async () => {
    const summary = await service.getSummary(
      {
        company_id: 'holding',
        employee_id: managerId,
        include: 'celebrations,whos_out',
      },
      managerToken(),
      'xevn',
    );

    expect(summary.celebrations.total_count).toBe(1);
    expect(summary.whos_out.total_count).toBe(1);

    const celebrationCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('substring(e.custom_fields'),
    );
    const whosOutCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('leave_requests'),
    );
    expect(celebrationCall).toBeDefined();
    expect(whosOutCall).toBeDefined();
    expect(String(celebrationCall?.[0])).toMatch(
      /e\.id IN|FROM public\.employees/,
    );
    expect(String(whosOutCall?.[0])).toContain('lr.employee_id IN');
    expect(String(whosOutCall?.[0])).not.toMatch(
      /lr\.company_id\s*=\s*\$\d+::uuid/,
    );
  });

  it('default include omits celebrations/whos_out DB queries', async () => {
    await service.getSummary(
      { company_id: 'holding', employee_id: managerId },
      managerToken(),
      'xevn',
    );
    const celebrationCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('substring(e.custom_fields'),
    );
    const whosOutCall = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('leave_requests') &&
        String(sql).includes('BETWEEN'),
    );
    expect(celebrationCall).toBeUndefined();
    expect(whosOutCall).toBeUndefined();
  });

  it('whos_out SQL uses workforce scope filter for group CEO rollup', async () => {
    const groupCeoToken = () =>
      `Bearer ${signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        company_uuid: holdingUuid,
        employee_id: managerId,
        roleCode: 'group_ceo',
        roles: ['employee', 'manager'],
      })}`;

    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('e.id = $1::uuid')) {
        return {
          rows: [
            {
              id: managerId,
              full_name: 'Group CEO',
              company_id: 'holding',
              custom_fields: { tenant_id: 'xevn' },
            },
          ],
        };
      }
      if (text.includes('FROM public.leave_requests')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    await service.getSummary(
      { company_id: 'main', employee_id: managerId, include: 'whos_out' },
      groupCeoToken(),
      'xevn',
    );
    const whosOutCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('leave_requests'),
    );
    expect(whosOutCall).toBeDefined();
    const [sql] = whosOutCall ?? [];
    expect(String(sql)).toContain('lr.employee_id IN');
  });

  it('D-MOB-HOME-SUMMARY-400-01: company_uuid query normalizes to trsport for member COO viewer', async () => {
    const trsportUuid = '32a3cdcb-c534-4e47-80f9-d2f156e65094';
    const cooId = '293b5900-8f99-4a97-878b-26270fb01827';
    const trsportToken = () =>
      `Bearer ${signServiceJwt({
        sub: 'uat.nv0002@xe.vn',
        tenantId: 'xevn',
        companyId: 'trsport',
        company_uuid: trsportUuid,
        employee_id: cooId,
        roles: ['employee', 'manager'],
      })}`;

    db.query.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (text.includes('e.id = $1::uuid')) {
        return {
          rows: [
            {
              id: cooId,
              full_name: 'Trần Văn An',
              company_id: 'trsport',
              custom_fields: {},
            },
          ],
        };
      }
      return { rows: [] };
    });

    const summary = await service.getSummary(
      { company_id: trsportUuid, employee_id: cooId, include: 'tasks' },
      trsportToken(),
      'xevn',
    );

    expect(summary.viewer.employee_id).toBe(cooId);
    expect(summary.viewer.is_manager).toBe(true);
    const [viewerSql] = db.query.mock.calls[0] ?? [];
    expect(String(viewerSql)).toContain('company_id = $');
    expect(String(viewerSql)).not.toContain(trsportUuid);
  });
});
