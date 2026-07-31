import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRequestsService } from './attendance-requests.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalanceService } from './leave-balance.service';
import { AttendanceOverviewService } from './attendance-overview.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** UC: HRM-AT-01..13 · embed UC-HRM-23 */
describe('AttendanceController (HRM-AT-01..13)', () => {
  let controller: AttendanceController;

  const serviceMock = {
    createRecord: jest.fn().mockResolvedValue({ id: 'r1' }),
    listRecords: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'r1' }] }),
    getRecordById: jest.fn().mockResolvedValue({ id: 'r1', status: 'present' }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'r1', status: 'present' }),
    createUpdateRequest: jest.fn().mockResolvedValue({ id: 'ur-1' }),
    listUpdateRequests: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'ur-1' }] }),
    updateUpdateRequest: jest.fn().mockResolvedValue({ id: 'ur-1', status: 'pending' }),
    approveUpdateRequest: jest.fn().mockResolvedValue({ id: 'ur-1', status: 'approved' }),
    rejectUpdateRequest: jest.fn().mockResolvedValue({ id: 'ur-1', status: 'rejected' }),
    deleteUpdateRequest: jest.fn().mockResolvedValue({ id: 'ur-1', deleted: true }),
  };

  const leaveMock = {
    createLeaveRequest: jest.fn().mockResolvedValue({ id: 'lr-1' }),
    listLeaveRequests: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'lr-1' }] }),
    approveLeaveRequest: jest.fn().mockResolvedValue({ id: 'lr-1', status: 'approved' }),
    rejectLeaveRequest: jest.fn().mockResolvedValue({ id: 'lr-1', status: 'rejected' }),
  };

  const leaveBalanceMock = {
    getLeaveBalance: jest.fn().mockResolvedValue({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      leave_type: 'annual',
      balance_year: 2026,
      year: 2026,
      period: 2026,
      entitled_days: 12,
      used_days: 3,
      pending_days: 1,
      remaining_days: 8,
      available_days: 8,
      as_of: '2026-06-07T04:00:00.000Z',
      source: 'employee_leave_balances',
    }),
  };

  const attendanceCatalogMock = {
    listWorkShifts: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1' }),
    updateWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1' }),
    deleteWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1' }),
    listAttendanceSheets: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createAttendanceSheet: jest.fn().mockResolvedValue({ id: 'as-1' }),
    updateAttendanceSheet: jest.fn().mockResolvedValue({ id: 'as-1' }),
    deleteAttendanceSheet: jest.fn().mockResolvedValue({ id: 'as-1' }),
  };

  const attendanceRequestsMock = {
    listOvertimeRequests: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createOvertimeRequest: jest.fn().mockResolvedValue({ id: 'ot-1' }),
    approveOvertimeRequest: jest.fn().mockResolvedValue({ id: 'ot-1', status: 'approved' }),
    rejectOvertimeRequest: jest.fn().mockResolvedValue({ id: 'ot-1', status: 'rejected' }),
    deleteOvertimeRequest: jest.fn().mockResolvedValue({ id: 'ot-1', deleted: true }),
    listBusinessTripRequests: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createBusinessTripRequest: jest.fn().mockResolvedValue({ id: 'bt-1' }),
    approveBusinessTripRequest: jest.fn().mockResolvedValue({ id: 'bt-1', status: 'approved' }),
    rejectBusinessTripRequest: jest.fn().mockResolvedValue({ id: 'bt-1', status: 'rejected' }),
    deleteBusinessTripRequest: jest.fn().mockResolvedValue({ id: 'bt-1', deleted: true }),
    listLateEarlyRequests: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createLateEarlyRequest: jest.fn().mockResolvedValue({ id: 'le-1' }),
    approveLateEarlyRequest: jest.fn().mockResolvedValue({ id: 'le-1', status: 'approved' }),
    rejectLateEarlyRequest: jest.fn().mockResolvedValue({ id: 'le-1', status: 'rejected' }),
    deleteLateEarlyRequest: jest.fn().mockResolvedValue({ id: 'le-1', deleted: true }),
  };

  const attendanceOverviewMock = {
    getOverview: jest.fn().mockResolvedValue({ summary: { total_employees: 0 } }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: serviceMock },
        { provide: AttendanceCatalogService, useValue: attendanceCatalogMock },
        { provide: LeaveRequestsService, useValue: leaveMock },
        { provide: LeaveBalanceService, useValue: leaveBalanceMock },
        { provide: AttendanceRequestsService, useValue: attendanceRequestsMock },
        { provide: AttendanceOverviewService, useValue: attendanceOverviewMock },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
  const employeeId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';

  it('HRM-AT-01: create attendance record returns HRM-ATT-201', async () => {
    const createRes = await controller.createRecord(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      employee_id: employeeId,
      attendance_date: '2026-04-22',
      status: 'pending',
    });
    expect(createRes.code).toBe('HRM-ATT-201');
  });

  it('HRM-AT-02: list attendance records returns HRM-ATT-200', async () => {
    const listRes = await controller.listRecords(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    expect(listRes.code).toBe('HRM-ATT-200');
  });

  it('loads attendance record by id with scope context (J-HRM-06)', async () => {
    const recordId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const res = await controller.getRecord(recordId, undefined, 'test-key', 'xevn', undefined, {
      company_id: 'main',
    });
    expect(res.code).toBe('HRM-ATT-200');
    expect(serviceMock.getRecordById).toHaveBeenCalledWith(
      recordId,
      { company_id: 'main' },
      undefined,
      { tenantId: 'xevn' },
    );
  });

  it('HRM-AT-03: update attendance record status returns HRM-ATT-202', async () => {
    const statusRes = await controller.updateStatus(
      employeeId,
      undefined,
      'test-key',
      'xevn',
      companyId,
      { status: 'present' },
    );
    expect(statusRes.code).toBe('HRM-ATT-202');
  });

  it('HRM-AT-04: create attendance update request returns HRM-ATT-REQ-201', async () => {
    const createUr = await controller.createUpdateRequest(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      employee_id: employeeId,
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      attendance_date: '2026-04-22',
      update_type: 'check_in',
      reason: 'correction',
    });
    expect(createUr.code).toBe('HRM-ATT-REQ-201');
  });

  it('HRM-AT-05: list attendance update requests returns HRM-ATT-REQ-200', async () => {
    const listUr = await controller.listUpdateRequests(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    expect(listUr.code).toBe('HRM-ATT-REQ-200');
  });

  it('HRM-AT-06: patch attendance update request returns HRM-ATT-REQ-202', async () => {
    const patchUr = await controller.updateUpdateRequest('ur-1', undefined, 'test-key', 'xevn', companyId, {
      reason: 'updated note',
    });
    expect(patchUr.code).toBe('HRM-ATT-REQ-202');
  });

  it('HRM-AT-07: approve attendance update request returns HRM-ATT-REQ-203', async () => {
    const approveUr = await controller.approveUpdateRequest('ur-1', undefined, 'test-key', 'xevn', companyId, {
      approver_name: 'mgr-1',
    });
    expect(approveUr.code).toBe('HRM-ATT-REQ-203');
  });

  it('HRM-AT-08: reject attendance update request returns HRM-ATT-REQ-204', async () => {
    const rejectUr = await controller.rejectUpdateRequest('ur-2', undefined, 'test-key', 'xevn', companyId, {
      approver_name: 'mgr-1',
      rejected_reason: 'invalid',
    });
    expect(rejectUr.code).toBe('HRM-ATT-REQ-204');
  });

  it('HRM-AT-09: delete attendance update request returns HRM-ATT-REQ-205', async () => {
    const deleteUr = await controller.deleteUpdateRequest('ur-3', undefined, 'test-key', 'xevn', companyId);
    expect(deleteUr.code).toBe('HRM-ATT-REQ-205');
  });

  it('HRM-AT-10: create leave request returns HRM-LEAVE-201', async () => {
    const createLeave = await controller.createLeaveRequest(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      employee_id: employeeId,
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-05-01',
      end_date: '2026-05-03',
      total_days: 3,
    });
    expect(createLeave.code).toBe('HRM-LEAVE-201');
    expect(leaveMock.createLeaveRequest).toHaveBeenCalledWith(
      expect.objectContaining({ leave_type: 'annual' }),
      undefined,
      expect.objectContaining({ tenantId: 'xevn' }),
    );
  });

  it('HRM-AT-11: list leave requests returns HRM-LEAVE-200', async () => {
    const listLeave = await controller.listLeaveRequests(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    expect(listLeave.code).toBe('HRM-LEAVE-200');
  });

  it('W7-4: get leave balance returns HRM-LEAVE-BAL-200', async () => {
    const res = await controller.getLeaveBalance(undefined, 'test-key', 'xevn', undefined, {
      company_id: 'holding',
      employee_id: employeeId,
      leave_type: 'annual',
      year: 2026,
    });
    expect(res.code).toBe('HRM-LEAVE-BAL-200');
    expect(res.data.available_days).toBe(8);
    expect(res.data.used_days).toBe(3);
    expect(leaveBalanceMock.getLeaveBalance).toHaveBeenCalled();
  });

  it('HRM-AT-12: approve leave request returns HRM-LEAVE-203', async () => {
    const approveLeave = await controller.approveLeaveRequest('lr-1', undefined, 'test-key', 'xevn', companyId, {
      reviewer_name: 'mgr-1',
    });
    expect(approveLeave.code).toBe('HRM-LEAVE-203');
  });

  it('UC-HRM-MOB-08: mobile manager approves pending leave (HRM-LEAVE-203)', async () => {
    const approveLeave = await controller.approveLeaveRequest('lr-mob-1', undefined, 'test-key', 'xevn', companyId, {
      reviewer_name: 'mobile-mgr',
    });
    expect(approveLeave.code).toBe('HRM-LEAVE-203');
    expect(leaveMock.approveLeaveRequest).toHaveBeenCalledWith(
      'lr-mob-1',
      { reviewer_name: 'mobile-mgr' },
      companyId,
      undefined,
      'xevn',
    );
  });

  it('HRM-AT-13: reject leave request returns HRM-LEAVE-204', async () => {
    const rejectLeave = await controller.rejectLeaveRequest('lr-2', undefined, 'test-key', 'xevn', companyId, {
      reviewer_name: 'mgr-1',
      rejected_reason: 'overlap',
    });
    expect(rejectLeave.code).toBe('HRM-LEAVE-204');
  });

  it('accepts internal API key and forwards payloads to service', async () => {
    const body = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      attendance_date: '2026-04-22',
      status: 'pending' as const,
    };
    const query = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'present' as const,
      page: 2,
      page_size: 5,
    };
    const patch = { status: 'present' as const, note: 'Approved' };

    await controller.createRecord(undefined, 'test-key', 'xevn', undefined, body);
    await controller.listRecords(undefined, 'test-key', 'xevn', undefined, query);
    await controller.updateStatus('r1', undefined, 'test-key', 'xevn', body.company_id, patch);

    expect(serviceMock.createRecord).toHaveBeenCalledWith(body, undefined, 'xevn');
    expect(serviceMock.listRecords).toHaveBeenCalledWith(query, undefined, { tenantId: 'xevn' });
    expect(serviceMock.updateStatus).toHaveBeenCalledWith('r1', patch, body.company_id, undefined, 'xevn');
  });

  it('blocks unauthorized attendance access', async () => {
    expect(() =>
      controller.listRecords(undefined, undefined, {
        // tenant/company checks run after auth; this test validates auth branch.
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      } as any),
    ).toThrow('Unauthorized attendance access');
    expect(serviceMock.listRecords).not.toHaveBeenCalled();
  });

  it('rejects missing scope before service mutation', async () => {
    expect(() =>
      controller.createRecord(undefined, 'test-key', 'xevn', undefined, {
        company_id: '',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        attendance_date: '2026-04-22',
        status: 'pending',
      }),
    ).toThrow('companyId is required');
    expect(serviceMock.createRecord).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.listRecords(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.listRecords).not.toHaveBeenCalled();
  });

  it('accepts x-access-token fallback header for list records', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const res = await controller.listRecords(
      undefined,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { 'x-access-token': token },
    );
    expect(res.code).toBe('HRM-ATT-200');
    expect(serviceMock.listRecords).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });
});
