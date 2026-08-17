import 'reflect-metadata';
import { HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';
import {
  HRM_LEAVE_VAL_ATT,
  HRM_LEAVE_VAL_BALANCE,
  HRM_LEAVE_VAL_OVERLAP,
  LeaveRequestsService,
  catalogLeaveTypeIndicatesSick,
  isSickLeaveLabel,
  isSickLeaveTypeCode,
} from './leave-requests.service';

function findLeaveListSqlCall(calls: unknown[][]): [string, unknown[]] {
  const hit = calls.find((c) => String(c[0]).includes('SELECT lr.*'));
  if (!hit) {
    throw new Error('expected SELECT lr.* query');
  }
  return hit as [string, unknown[]];
}

function noopBridge() {
  return { startLeaveWorkflowIfConfigured: jest.fn().mockResolvedValue(null) };
}

function bridgeReturning(instanceId: string) {
  return {
    startLeaveWorkflowIfConfigured: jest.fn().mockResolvedValue({ workflowInstanceId: instanceId }),
  };
}

type LeaveInsertRow = Record<string, unknown>;

/**
 * G-AT10-02-aware mock: DDL + empty overlap/balance → INSERT returns leave row.
 * Pass `overlapRow` / `balanceRow` / `employeeCustom` to exercise rejects.
 */
function createLeaveQueryMock(opts: {
  insertRow: LeaveInsertRow;
  overlapRow?: { id: string; status: string } | null;
  balanceRow?: {
    entitled_days: string;
    used_days: string;
    pending_days: string;
    advanced_days?: string;
  } | null;
  employeeCustom?: Record<string, unknown> | null;
}) {
  return jest.fn().mockImplementation((sql: string) => {
    const s = String(sql);
    if (s.includes('CREATE TABLE') || s.includes('ALTER TABLE') || s.includes('CREATE INDEX')) {
      return Promise.resolve({ rows: [] });
    }
    if (s.includes('daterange(start_date, end_date') && s.includes("status IN ('pending', 'approved')")) {
      return Promise.resolve({ rows: opts.overlapRow ? [opts.overlapRow] : [] });
    }
    if (s.includes('FROM public.employee_leave_balances')) {
      return Promise.resolve({ rows: opts.balanceRow ? [opts.balanceRow] : [] });
    }
    if (s.includes('FROM public.employees') && s.includes('custom_fields')) {
      return Promise.resolve({
        rows: [{ custom_fields: opts.employeeCustom ?? null }],
      });
    }
    if (s.includes('INSERT INTO')) {
      return Promise.resolve({ rows: [opts.insertRow] });
    }
    if (s.includes('SELECT * FROM public.leave_requests WHERE id')) {
      return Promise.resolve({ rows: [opts.insertRow] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe('LeaveRequestsService listLeaveRequests SQL', () => {
  it('builds filter clauses when employee_id set', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
    const out = await svc.listLeaveRequests({ company_id: 'main' }, undefined, 'xevn');
    const [sql] = findLeaveListSqlCall(queryMock.mock.calls);
    expect(sql).toContain('employee_id IN');
    expect(out.total).toBe(1);
  });

  it('G-DB-03: ensureSchema emits CREATE TABLE leave_requests before ALTER', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
    await svc.listLeaveRequests({ company_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
    const ddl = queryMock.mock.calls.map((c) => String(c[0])).join('\n');
    const createIdx = ddl.indexOf('CREATE TABLE IF NOT EXISTS public.leave_requests');
    const alterAttachIdx = ddl.indexOf('ADD COLUMN IF NOT EXISTS attachment_url');
    expect(createIdx).toBeGreaterThanOrEqual(0);
    expect(alterAttachIdx).toBeGreaterThan(createIdx);
    expect(ddl).toMatch(/company_id TEXT NOT NULL/);
    expect(ddl).toMatch(/employee_id UUID NOT NULL/);
    expect(ddl).toMatch(/total_days NUMERIC/);
    expect(ddl).toMatch(/workflow_instance_id UUID NULL/);
    expect(ddl).toMatch(/idx_leave_requests_company_status/);
    expect(ddl).toMatch(/ALTER COLUMN company_id TYPE TEXT/);
  });

  it('HRM-AT-10: createLeaveRequest inserts leave row with company scope', async () => {
    const insertRow = {
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
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const bridge = noopBridge();
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      bridge as never,
    );
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
    const createCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('CREATE TABLE IF NOT EXISTS public.leave_requests'),
    );
    expect(createCall).toBeDefined();
    const schemaCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('attachment_url TEXT NULL'),
    );
    expect(schemaCall).toBeDefined();
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [sql, params] = insertCall as [string, unknown[]];
    expect(String(sql)).toContain('public.leave_requests');
    expect(String(sql)).toContain('$2::text');
    expect(String(sql)).not.toMatch(/\$2::uuid/);
    expect(String(sql)).toContain('attachment_url');
    expect(params).toContain(null);
    expect(row.id).toBe('lr-new');
    expect(fanoutMock.onLeaveRequestCreated).toHaveBeenCalled();
    expect(bridge.startLeaveWorkflowIfConfigured).toHaveBeenCalled();
  });

  it('D-HDSD-WF-LEAVE-BIND-01: createLeaveRequest returns workflow_instance_id after bridge spawn', async () => {
    const wfId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const insertRow = {
      id: 'lr-wf-bind',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'PORTAL-GCEO',
      employee_name: 'CEO Tập đoàn',
      leave_type: 'LVT_01',
      start_date: '2027-01-18',
      end_date: '2027-01-18',
      reason: null,
      status: 'pending',
      requested_at: '2026-07-30T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: 'CEO',
      position: 'CEO',
      total_days: '1',
      handover_to: null,
      handover_tasks: 'QA-MARKER',
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
      workflow_instance_id: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const bridge = bridgeReturning(wfId);
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      bridge as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.createLeaveRequest(
      {
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'PORTAL-GCEO',
        employee_name: 'CEO Tập đoàn',
        leave_type: 'LVT_01',
        start_date: '2027-01-18',
        end_date: '2027-01-18',
        total_days: 1,
        handover_tasks: 'QA-MARKER',
      },
      `Bearer ${token}`,
      { submitterUserId: 'ceo@xe.vn', tenantId: 'xevn', companySlug: 'main' },
    );
    expect(row.workflow_instance_id).toBe(wfId);
    expect(bridge.startLeaveWorkflowIfConfigured).toHaveBeenCalledWith(
      expect.objectContaining({
        submitterUserId: 'ceo@xe.vn',
        companySlug: 'main',
        authorization: expect.stringContaining('Bearer'),
      }),
    );
  });

  it('D-HDSD-WF-LEAVE-RESP-01: createLeaveRequest reloads row with workflow_instance_id from DB', async () => {
    const wfId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const insertRow = {
      id: 'lr-wf-resp',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'PORTAL-GCEO',
      employee_name: 'CEO Tập đoàn',
      leave_type: 'LVT_01',
      start_date: '2027-01-21',
      end_date: '2027-01-21',
      reason: null,
      status: 'pending',
      requested_at: '2026-07-30T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: 'CEO',
      position: 'CEO',
      total_days: '1',
      handover_to: null,
      handover_tasks: 'QA-INT03-R3',
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
      workflow_instance_id: null,
    };
    const refreshedRow = { ...insertRow, workflow_instance_id: wfId };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('ALTER TABLE') || s.includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('daterange(start_date, end_date')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('FROM public.employee_leave_balances')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('FROM public.employees') && s.includes('custom_fields')) {
        return Promise.resolve({ rows: [{ custom_fields: null }] });
      }
      if (s.includes('INSERT INTO')) {
        return Promise.resolve({ rows: [insertRow] });
      }
      if (s.includes('SELECT * FROM public.leave_requests WHERE id')) {
        return Promise.resolve({ rows: [refreshedRow] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const bridge = bridgeReturning(wfId);
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      bridge as never,
    );
    const row = await svc.createLeaveRequest({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'PORTAL-GCEO',
      employee_name: 'CEO Tập đoàn',
      leave_type: 'LVT_01',
      start_date: '2027-01-21',
      end_date: '2027-01-21',
      total_days: 1,
      handover_tasks: 'QA-INT03-R3',
    });
    expect(row.workflow_instance_id).toBe(wfId);
    expect(
      queryMock.mock.calls.some((c) => String(c[0]).includes('SELECT * FROM public.leave_requests WHERE id')),
    ).toBe(true);
  });

  it('G-AT10-01: createLeaveRequest accepts company_id=main → persists holding TEXT (no ::uuid)', async () => {
    const insertRow = {
      id: 'lr-slug',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-07-01',
      end_date: '2026-07-02',
      reason: null,
      status: 'pending',
      requested_at: '2026-07-01T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const bridge = noopBridge();
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      bridge as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.createLeaveRequest(
      {
        company_id: 'main',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-07-01',
        end_date: '2026-07-02',
        total_days: 2,
      },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [sql, params] = insertCall as [string, unknown[]];
    expect(String(sql)).toMatch(/\$2::text/);
    expect(String(sql)).not.toMatch(/\$2::uuid/);
    expect(params[1]).toBe('holding');
    expect(row.company_id).toBe('holding');
    expect(bridge.startLeaveWorkflowIfConfigured).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'holding', companySlug: 'holding' }),
    );
  });

  it('G-AT10-01: createLeaveRequest accepts holding slug and INSERT binds TEXT', async () => {
    const insertRow = {
      id: 'lr-hold',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-07-10',
      end_date: '2026-07-11',
      reason: null,
      status: 'pending',
      requested_at: '2026-07-10T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'employee',
    });
    await svc.createLeaveRequest(
      {
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-07-10',
        end_date: '2026-07-11',
        total_days: 2,
      },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [sql, params] = insertCall as [string, unknown[]];
    expect(String(sql)).toMatch(/\$2::text/);
    expect(params[1]).toBe('holding');
  });

  it('PCOMP-W7-BE-LEAVE-DOC: createLeaveRequest persists attachment_url for sick leave', async () => {
    const attachmentUrl =
      '/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf';
    const insertRow = {
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
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
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

  it('G-AT10-02: createLeaveRequest rejects overlapping pending/approved leave (HRM-LEAVE-VAL-OVERLAP)', async () => {
    const queryMock = createLeaveQueryMock({
      insertRow: { id: 'should-not-insert' },
      overlapRow: { id: 'lr-existing', status: 'pending' },
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-08-01',
        end_date: '2026-08-03',
        total_days: 3,
      }),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_LEAVE_VAL_OVERLAP,
    });
    try {
      await svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-08-01',
        end_date: '2026-08-03',
        total_days: 3,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((e as ApiException).details).toMatchObject({
        conflicting_id: 'lr-existing',
        conflicting_status: 'pending',
      });
    }
    const insertCalls = queryMock.mock.calls.filter((c) => String(c[0]).includes('INSERT INTO'));
    expect(insertCalls).toHaveLength(0);
    expect(fanoutMock.onLeaveRequestCreated).not.toHaveBeenCalled();
  });

  it('G-AT10-02: createLeaveRequest rejects insufficient tracked balance (HRM-LEAVE-VAL-BALANCE)', async () => {
    const queryMock = createLeaveQueryMock({
      insertRow: { id: 'should-not-insert' },
      balanceRow: {
        entitled_days: '5',
        used_days: '3',
        pending_days: '1',
      },
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    // available = 5 - 3 - 1 = 1; request 2 → reject
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-09-01',
        end_date: '2026-09-02',
        total_days: 2,
      }),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_LEAVE_VAL_BALANCE,
    });
    try {
      await svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-09-01',
        end_date: '2026-09-02',
        total_days: 2,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect((e as ApiException).details).toMatchObject({
        available_days: 1,
        requested_days: 2,
        leave_type: 'annual',
        balance_year: 2026,
        source: 'employee_leave_balances',
      });
    }
    const insertCalls = queryMock.mock.calls.filter((c) => String(c[0]).includes('INSERT INTO'));
    expect(insertCalls).toHaveLength(0);
    expect(fanoutMock.onLeaveRequestCreated).not.toHaveBeenCalled();
  });

  it('ATT-04b: createLeaveRequest rejects when advanced_days reduces available', async () => {
    const queryMock = createLeaveQueryMock({
      insertRow: { id: 'should-not-insert' },
      balanceRow: {
        entitled_days: '10',
        used_days: '2',
        pending_days: '1',
        advanced_days: '4',
      },
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    // available = 10 - 2 - 1 - 4 = 3; request 4 → reject
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-09-01',
        end_date: '2026-09-04',
        total_days: 4,
      }),
    ).rejects.toMatchObject<ApiException>({
      code: HRM_LEAVE_VAL_BALANCE,
    });
    try {
      await svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'annual',
        start_date: '2026-09-01',
        end_date: '2026-09-04',
        total_days: 4,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).details).toMatchObject({
        available_days: 3,
        requested_days: 4,
      });
    }
  });

  it('G-AT10-02: happy create still inserts when balance is sufficient', async () => {
    const insertRow = {
      id: 'lr-ok-bal',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-10-01',
      end_date: '2026-10-02',
      reason: null,
      status: 'pending',
      requested_at: '2026-10-01T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({
      insertRow,
      balanceRow: {
        entitled_days: '12',
        used_days: '2',
        pending_days: '1',
      },
    });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    // available = 9 ≥ 2
    const row = await svc.createLeaveRequest({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-10-01',
      end_date: '2026-10-02',
      total_days: 2,
    });
    expect(row.id).toBe('lr-ok-bal');
    expect(fanoutMock.onLeaveRequestCreated).toHaveBeenCalled();
    const pendingLock = queryMock.mock.calls.find(
      (c) =>
        String(c[0]).includes('UPDATE public.employee_leave_balances') &&
        String(c[0]).includes('pending_days = pending_days +'),
    );
    expect(pendingLock).toBeDefined();
  });

  it('PCOMP-W7-BE-LEAVE-DOC: VAL-W7-LATT-02 rejects attachment_url outside /api/hrm/files/', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
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

  it('G-AT10-01 / AT-12: approveLeaveRequest allows company_id=main when row.company_id=holding', async () => {
    const requestId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const approvedRow = {
      id: requestId,
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-07-01',
      end_date: '2026-07-02',
      reason: null,
      status: 'approved',
      requested_at: '2026-07-01T00:00:00.000Z',
      reviewed_at: '2026-07-02T00:00:00.000Z',
      reviewed_by: 'CEO',
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('SELECT company_id::text')) {
        return Promise.resolve({ rows: [{ company_id: 'holding' }] });
      }
      if (s.includes("SET status = 'approved'")) {
        return Promise.resolve({ rows: [approvedRow] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = { onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.approveLeaveRequest(
      requestId,
      { reviewer_name: 'CEO' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('approved');
    expect(row.company_id).toBe('holding');
    expect(fanoutMock.onLeaveRequestDecided).toHaveBeenCalledWith(
      'approved',
      expect.objectContaining({ company_id: 'holding' }),
    );
  });

  it('G-AT10-01 / AT-12: approveLeaveRequest normalizes company_uuid → holding slug', async () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const requestId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const approvedRow = {
      id: requestId,
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-07-05',
      end_date: '2026-07-06',
      reason: null,
      status: 'approved',
      requested_at: '2026-07-05T00:00:00.000Z',
      reviewed_at: '2026-07-06T00:00:00.000Z',
      reviewed_by: 'Manager',
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('SELECT company_id::text')) {
        return Promise.resolve({ rows: [{ company_id: 'holding' }] });
      }
      if (s.includes("SET status = 'approved'")) {
        return Promise.resolve({ rows: [approvedRow] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = { onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const token = signServiceJwt({
      sub: 'mgr@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      roleCode: 'manager',
    });
    const row = await svc.approveLeaveRequest(
      requestId,
      { reviewer_name: 'Manager' },
      holdingUuid,
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.company_id).toBe('holding');
    expect(row.status).toBe('approved');
  });
});

describe('D-HRM-LEAVE-REQ-CREATE-BE-01 catalog leave_type + company partition', () => {
  const holdingUuid = '10000000-0000-4000-8000-000000000001';
  const employeeId = '11111111-1111-4111-8111-111111111111';

  function groupCeoToken() {
    return signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
  }

  function baseInsertRow(company_id: string, leave_type: string) {
    return {
      id: 'lr-lvt',
      company_id,
      employee_id: employeeId,
      employee_code: 'PORTAL-GCEO',
      employee_name: 'CEO Tập đoàn',
      leave_type,
      start_date: '2026-11-12',
      end_date: '2026-11-12',
      reason: null,
      status: 'pending',
      requested_at: '2026-11-12T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: 'CEO',
      position: 'CEO',
      total_days: '1',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
  }

  it('holding UUID + LVT_01: assert uses Settings catalog partition holding; INSERT TEXT holding', async () => {
    const insertRow = baseInsertRow('holding', 'LVT_01');
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const assertCode = jest.fn().mockResolvedValue({ code: 'LVT_01', status: 'active' });
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
      { assertCodeInEffectiveCatalog: assertCode } as never,
    );
    const row = await svc.createLeaveRequest(
      {
        company_id: holdingUuid,
        employee_id: employeeId,
        employee_code: 'PORTAL-GCEO',
        employee_name: 'CEO Tập đoàn',
        leave_type: 'LVT_01',
        start_date: '2026-11-12',
        end_date: '2026-11-12',
        total_days: 1,
        department: 'CEO',
        position: 'CEO',
      },
      `Bearer ${groupCeoToken()}`,
      { tenantId: 'xevn' },
    );
    expect(assertCode).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        catalogKey: 'leave_types',
        code: 'LVT_01',
        errorCode: 'HRM-ATT-LEAVE-TYPE',
      }),
    );
    const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
    const [sql, params] = insertCall as [string, unknown[]];
    expect(String(sql)).toMatch(/\$2::text/);
    expect(String(sql)).not.toMatch(/\$2::uuid/);
    expect(params[1]).toBe('holding');
    expect(params).toContain('LVT_01');
    expect(row.company_id).toBe('holding');
    expect(row.leave_type).toBe('LVT_01');
  });

  it('company_id=main|holding + LVT_01: catalog assert holding partition; persist holding TEXT', async () => {
    for (const company_id of ['main', 'holding'] as const) {
      const insertRow = baseInsertRow('holding', 'LVT_01');
      const queryMock = createLeaveQueryMock({ insertRow });
      const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
      const assertCode = jest.fn().mockResolvedValue({ code: 'LVT_01', status: 'active' });
      const svc = new LeaveRequestsService(
        { query: queryMock } as never,
        fanoutMock as never,
        noopBridge() as never,
        { assertCodeInEffectiveCatalog: assertCode } as never,
      );
      await svc.createLeaveRequest(
        {
          company_id,
          employee_id: employeeId,
          employee_code: 'PORTAL-GCEO',
          employee_name: 'CEO Tập đoàn',
          leave_type: 'LVT_01',
          start_date: '2026-11-12',
          end_date: '2026-11-12',
          total_days: 1,
        },
        `Bearer ${groupCeoToken()}`,
        { tenantId: 'xevn' },
      );
      expect(assertCode).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'holding', code: 'LVT_01' }),
      );
      const insertCall = queryMock.mock.calls.find((c) => String(c[0]).includes('INSERT INTO')) ?? [];
      const [, params] = insertCall as [string, unknown[]];
      expect(params[1]).toBe('holding');
    }
  });

  it('D-HDSD-MUTATE-BE-01: lazy pull leave_types from XBOS when effective catalog empty', async () => {
    const insertRow = baseInsertRow('holding', 'LVT_01');
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const getEffectiveItemsForKey = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValue([
        { code: 'LVT_01', label: 'Phép năm', status: 'active', origin: 'xbos' },
      ]);
    const assertCode = jest.fn().mockResolvedValue({ code: 'LVT_01', status: 'active' });
    const pullCatalogFromXbos = jest.fn().mockResolvedValue({ key: 'leave_types' });
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
      {
        getEffectiveItemsForKey,
        assertCodeInEffectiveCatalog: assertCode,
      } as never,
      { pullCatalogFromXbos } as never,
    );
    await svc.createLeaveRequest(
      {
        company_id: holdingUuid,
        employee_id: employeeId,
        employee_code: 'PORTAL-GCEO',
        employee_name: 'CEO Tập đoàn',
        leave_type: 'LVT_01',
        start_date: '2026-11-12',
        end_date: '2026-11-12',
        total_days: 1,
      },
      `Bearer ${groupCeoToken()}`,
      { tenantId: 'xevn' },
    );
    expect(pullCatalogFromXbos).toHaveBeenCalledWith(
      'leave_types',
      'xevn',
      'holding',
      expect.stringContaining('Bearer '),
    );
    // empty check (lazy pull) + re-check after pull path + sick-type classify (BR-LEAVE-ATT-01)
    expect(getEffectiveItemsForKey.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(pullCatalogFromXbos).toHaveBeenCalled();
    expect(assertCode).toHaveBeenCalled();
  });
});

describe('W1-B-01-TC-LEAVE display-ready + balance settle', () => {
  it('create + list return status_label / leave_type_label / employee_display_name', async () => {
    const insertRow = {
      id: 'lr-display',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyễn Văn A',
      leave_type: 'annual',
      start_date: '2026-11-01',
      end_date: '2026-11-02',
      reason: null,
      status: 'pending',
      requested_at: '2026-11-01T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: 'Vận hành',
      position: 'Tài xế',
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = {
      onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined),
      onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const created = await svc.createLeaveRequest({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyễn Văn A',
      leave_type: 'annual',
      start_date: '2026-11-01',
      end_date: '2026-11-02',
      total_days: 2,
      department: 'Vận hành',
      position: 'Tài xế',
    });
    expect(created.status_label).toBe('Chờ duyệt');
    expect(created.leave_type_label).toBe('Phép năm');
    expect(created.employee_display_name).toBe('Nguyễn Văn A');
    expect(created.total_days_number).toBe(2);
    expect(created.department).toBe('Vận hành');
    expect(created.position).toBe('Tài xế');

    queryMock.mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('ALTER TABLE') || s.includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('SELECT lr.*')) {
        return Promise.resolve({ rows: [insertRow] });
      }
      return Promise.resolve({ rows: [] });
    });
    const listed = await svc.listLeaveRequests({ company_id: 'holding' });
    expect(listed.data[0]?.status_label).toBe('Chờ duyệt');
    expect(listed.data[0]?.leave_type_label).toBe('Phép năm');
    expect(listed.data[0]?.employee_display_name).toBe('Nguyễn Văn A');
  });

  it('approve settles pending→used and returns display-ready Đã duyệt', async () => {
    const requestId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const approvedRow = {
      id: requestId,
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyễn Văn A',
      leave_type: 'annual',
      start_date: '2026-11-10',
      end_date: '2026-11-11',
      reason: null,
      status: 'approved',
      requested_at: '2026-11-01T00:00:00.000Z',
      reviewed_at: '2026-11-02T00:00:00.000Z',
      reviewed_by: 'QL',
      department: 'Vận hành',
      position: 'Tài xế',
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('SELECT company_id::text')) {
        return Promise.resolve({ rows: [{ company_id: 'holding', status: 'pending' }] });
      }
      if (s.includes("SET status = 'approved'")) {
        return Promise.resolve({ rows: [approvedRow] });
      }
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('UPDATE public.employee_leave_balances') && s.includes('used_days')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = { onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.approveLeaveRequest(
      requestId,
      { reviewer_name: 'QL' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('approved');
    expect(row.status_label).toBe('Đã duyệt');
    expect(row.leave_type_label).toBe('Phép năm');
    expect(row.employee_display_name).toBe('Nguyễn Văn A');
    const settle = queryMock.mock.calls.find(
      (c) =>
        String(c[0]).includes('UPDATE public.employee_leave_balances') &&
        String(c[0]).includes('used_days = used_days +'),
    );
    expect(settle).toBeDefined();
  });

  it('API_CONTRACT §4.2: sick ≥3 days without attachment_url → HRM-LEAVE-VAL-ATT', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'sick',
        start_date: '2026-06-10',
        end_date: '2026-06-12',
        total_days: 3,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_LEAVE_VAL_ATT });
  });

  it('PO-E2E-SPINE-02 LV-03: LVT_02 ≥3 days without attachment_url → HRM-LEAVE-VAL-ATT', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const svc = new LeaveRequestsService({ query: queryMock } as never, {} as never, noopBridge() as never);
    await expect(
      svc.createLeaveRequest({
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        employee_code: 'UAT-0020',
        employee_name: 'UAT NV 0020',
        leave_type: 'LVT_02',
        start_date: '2027-10-12',
        end_date: '2027-10-16',
        total_days: 5,
        reason: 'QA LV-03 fail_deep',
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_LEAVE_VAL_ATT });
    const insertCalls = queryMock.mock.calls.filter((c) => String(c[0]).includes('INSERT INTO'));
    expect(insertCalls).toHaveLength(0);
  });

  it('PO-E2E-SPINE-02 LV-03: LVT_02 <3 days without attachment_url OK (no VAL-ATT)', async () => {
    const insertRow = {
      id: 'lr-lvt02-short',
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'UAT-0020',
      employee_name: 'UAT NV 0020',
      leave_type: 'LVT_02',
      start_date: '2027-10-12',
      end_date: '2027-10-13',
      reason: 'short sick',
      status: 'pending',
      requested_at: '2027-10-01T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const fanoutMock = { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const row = await svc.createLeaveRequest({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'UAT-0020',
      employee_name: 'UAT NV 0020',
      leave_type: 'LVT_02',
      start_date: '2027-10-12',
      end_date: '2027-10-13',
      total_days: 2,
      reason: 'short sick',
    });
    expect(row.id).toBe('lr-lvt02-short');
    expect(row.leave_type).toBe('LVT_02');
    expect(row.leave_type_label).toBe('Ốm');
  });

  it('PO-E2E-SPINE-02 LV-03: catalog label Ốm / metadata is_sick → VAL-ATT when ≥3 no attach', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const getEffectiveItemsForKey = jest.fn().mockResolvedValue([
      { code: 'LVT_99', label: 'Ốm đặc biệt', status: 'active', metadata: { is_sick: true } },
    ]);
    const assertCode = jest.fn().mockResolvedValue({ code: 'LVT_99', status: 'active' });
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      {} as never,
      noopBridge() as never,
      { getEffectiveItemsForKey, assertCodeInEffectiveCatalog: assertCode } as never,
    );
    await expect(
      svc.createLeaveRequest(
        {
          company_id: 'holding',
          employee_id: '11111111-1111-4111-8111-111111111111',
          employee_code: 'NV0001',
          employee_name: 'Nguyen Van A',
          leave_type: 'LVT_99',
          start_date: '2027-10-12',
          end_date: '2027-10-16',
          total_days: 5,
        },
        undefined,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_LEAVE_VAL_ATT });
    expect(assertCode).toHaveBeenCalled();
    expect(getEffectiveItemsForKey).toHaveBeenCalled();
  });

  it('W1-B-01 reject: returns display-ready Từ chối and releases pending balance', async () => {
    const requestId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const rejectedRow = {
      id: requestId,
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyễn Văn A',
      leave_type: 'annual',
      start_date: '2026-11-12',
      end_date: '2026-11-13',
      reason: null,
      status: 'rejected',
      requested_at: '2026-11-01T00:00:00.000Z',
      reviewed_at: '2026-11-02T00:00:00.000Z',
      reviewed_by: 'QL',
      department: 'Vận hành',
      position: 'Tài xế',
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: 'Lý do cá nhân',
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('SELECT company_id::text')) {
        return Promise.resolve({ rows: [{ company_id: 'holding', status: 'pending' }] });
      }
      if (s.includes("SET status = 'rejected'")) {
        return Promise.resolve({ rows: [rejectedRow] });
      }
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = {
      onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.rejectLeaveRequest(
      requestId,
      { reviewer_name: 'QL', rejected_reason: 'Lý do cá nhân' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('rejected');
    expect(row.status_label).toBe('Từ chối');
    expect(row.leave_type_label).toBe('Phép năm');
    expect(row.employee_display_name).toBe('Nguyễn Văn A');
    expect(row.rejected_reason).toBe('Lý do cá nhân');
    const release = queryMock.mock.calls.find(
      (c) => String(c[0]).includes('UPDATE public.employee_leave_balances') &&
            String(c[0]).includes('pending_days = GREATEST(0, pending_days -'),
    );
    expect(release).toBeDefined();
    expect(fanoutMock.onLeaveRequestDecided).toHaveBeenCalledWith(
      'rejected',
      expect.objectContaining({ company_id: 'holding' }),
    );
  });
});

describe('PO-E2E-SPINE-02 sick leave type helpers', () => {
  it('isSickLeaveTypeCode recognizes sick + LVT_02', () => {
    expect(isSickLeaveTypeCode('sick')).toBe(true);
    expect(isSickLeaveTypeCode('SICK_LEAVE')).toBe(true);
    expect(isSickLeaveTypeCode('LVT_02')).toBe(true);
    expect(isSickLeaveTypeCode('lvt_02')).toBe(true);
    expect(isSickLeaveTypeCode('LVT_01')).toBe(false);
    expect(isSickLeaveTypeCode('annual')).toBe(false);
  });

  it('isSickLeaveLabel / catalogLeaveTypeIndicatesSick for Ốm + metadata', () => {
    expect(isSickLeaveLabel('Ốm')).toBe(true);
    expect(isSickLeaveLabel('Nghỉ ốm')).toBe(true);
    expect(isSickLeaveLabel('Phép năm')).toBe(false);
    expect(
      catalogLeaveTypeIndicatesSick({
        status: 'active',
        code: 'CUSTOM_OM',
        label: 'Ốm',
      }),
    ).toBe(true);
    expect(
      catalogLeaveTypeIndicatesSick({
        status: 'active',
        code: 'X1',
        label: 'Khác',
        metadata: { is_sick: true },
      }),
    ).toBe(true);
    expect(
      catalogLeaveTypeIndicatesSick({
        status: 'active',
        code: 'LVT_01',
        label: 'Phép năm',
        metadata: { requires_l2: true },
      }),
    ).toBe(false);
  });
});

describe('G-AT10-01 CreateLeaveRequestDto / ListLeaveRequestsQueryDto company_id slug', () => {
  const baseCreate = {
    employee_id: '11111111-1111-4111-8111-111111111111',
    employee_code: 'NV0001',
    employee_name: 'Nguyen Van A',
    leave_type: 'annual',
    start_date: '2026-07-21',
    end_date: '2026-07-22',
    total_days: 2,
  };

  it('accepts company_id=holding and company_id=main (not @IsUUID)', async () => {
    for (const company_id of ['holding', 'main', 'du-lich']) {
      const dto = plainToInstance(CreateLeaveRequestDto, { ...baseCreate, company_id });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('list query accepts slug company_id', async () => {
    const dto = plainToInstance(ListLeaveRequestsQueryDto, { company_id: 'holding' });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

describe('R-PLT-ATT-01 wire leave-requests → F-ATT-CAT-EFF-01', () => {
  const employeeId = '11111111-1111-4111-8111-111111111111';

  it('uses AttLeaveTypeService assert — prefers over settings-only path', async () => {
    const insertRow = {
      id: 'lr-eff',
      company_id: 'holding',
      employee_id: employeeId,
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'hr_custom_09',
      start_date: '2026-11-12',
      end_date: '2026-11-12',
      reason: null,
      status: 'pending',
      requested_at: '2026-11-12T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: null,
      position: null,
      total_days: '1',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = createLeaveQueryMock({ insertRow });
    const assertLeaveTypeInEffectiveCatalog = jest.fn().mockResolvedValue({
      leaveTypeKey: 'hr_custom_09',
      source: 'att_native',
    });
    const assertCode = jest.fn();
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      { onLeaveRequestCreated: jest.fn().mockResolvedValue(undefined) } as never,
      noopBridge() as never,
      { assertCodeInEffectiveCatalog: assertCode } as never,
      undefined,
      undefined,
      undefined,
      { assertLeaveTypeInEffectiveCatalog } as never,
    );
    const row = await svc.createLeaveRequest(
      {
        company_id: 'holding',
        employee_id: employeeId,
        employee_code: 'NV0001',
        employee_name: 'Nguyen Van A',
        leave_type: 'hr_custom_09',
        start_date: '2026-11-12',
        end_date: '2026-11-12',
        total_days: 1,
      },
      undefined,
      { tenantId: 'xevn' },
    );
    expect(assertLeaveTypeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'holding',
        leaveType: 'hr_custom_09',
        tenantId: 'xevn',
      }),
    );
    expect(assertCode).not.toHaveBeenCalled();
    expect(row.leave_type).toBe('hr_custom_09');
  });

  it('propagates HRM-LEAVE-TYPE-UNKNOWN from effective catalog', async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const assertLeaveTypeInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException('HRM-LEAVE-TYPE-UNKNOWN', 'not in catalog', HttpStatus.BAD_REQUEST),
      );
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      {} as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      undefined,
      { assertLeaveTypeInEffectiveCatalog } as never,
    );
    await expect(
      svc.createLeaveRequest(
        {
          company_id: 'holding',
          employee_id: employeeId,
          employee_code: 'NV0001',
          employee_name: 'Nguyen Van A',
          leave_type: 'ghost_type',
          start_date: '2026-11-12',
          end_date: '2026-11-12',
          total_days: 1,
        },
        undefined,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: 'HRM-LEAVE-TYPE-UNKNOWN' });
  });
});
