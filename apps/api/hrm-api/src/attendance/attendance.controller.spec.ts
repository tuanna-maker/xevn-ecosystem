import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRequestsService } from './attendance-requests.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalanceService } from './leave-balance.service';
import { AttActivateEnrollService } from './att-activate-enroll.service';
import { AttHolidayCalendarService } from './att-holiday-calendar.service';
import { AttendanceConfigService } from './attendance-config.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttAttendanceCodeService } from './att-attendance-code.service';
import { AttOtTypeService } from './att-ot-type.service';
import { AttOtCompTypeService } from './att-ot-comp-type.service';
import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from './att-sick-leave-fund-order.service';
import { AttendanceOverviewService } from './attendance-overview.service';
import { AttendanceSheetSignService } from './attendance-sheet-sign.service';
import { ApiException } from '../common/api.exception';
import { HRM_ATT_LVRULE_KEY } from './att-leave-accrual-policy.constants';
import { HttpStatus } from '@nestjs/common';

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
      leave_type_label: 'Phép năm',
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
    getLeaveBalancePanel: jest.fn().mockResolvedValue({
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      balance_year: 2026,
      year: 2026,
      as_of: '2026-06-07T04:00:00.000Z',
      items: [
        {
          leave_type: 'annual',
          leave_type_label: 'Phép năm',
          available_days: 8,
          source: 'employee_leave_balances',
        },
      ],
    }),
  };

  const attendanceConfigMock = {
    listWorkSites: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createWorkSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    updateWorkSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    deleteWorkSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    getRules: jest.fn().mockResolvedValue({ company_id: 'holding' }),
    patchRules: jest.fn().mockResolvedValue({ company_id: 'holding' }),
  };

  const attLeaveTypeMock = {
    listLeaveTypes: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getLeaveTypeById: jest.fn().mockResolvedValue({ id: 'lvt-1' }),
    upsertLeaveType: jest.fn().mockResolvedValue({ id: 'lvt-1' }),
    patchLeaveType: jest.fn().mockResolvedValue({ id: 'lvt-1' }),
    retireLeaveType: jest.fn().mockResolvedValue({ id: 'lvt-1', status: 'retired' }),
  };

  const attLeaveAccrualPolicyMock = {
    listPolicies: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    resolveEffective: jest.fn().mockResolvedValue({ total: 0, data: null }),
    getPolicyById: jest.fn().mockResolvedValue({ id: 'pol-1' }),
    createPolicy: jest.fn().mockResolvedValue({ id: 'pol-1' }),
    patchPolicy: jest.fn().mockResolvedValue({ id: 'pol-1' }),
    retirePolicy: jest.fn().mockResolvedValue({ id: 'pol-1', status: 'retired' }),
    assertLeaveAccrualPolicyForConsumer: jest.fn().mockResolvedValue(null),
  };

  const attAttendanceCodeMock = {
    listAttendanceCodes: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getAttendanceCodeById: jest.fn().mockResolvedValue({ id: 'ac-1' }),
    upsertAttendanceCode: jest.fn().mockResolvedValue({ id: 'ac-1' }),
    patchAttendanceCode: jest.fn().mockResolvedValue({ id: 'ac-1' }),
    retireAttendanceCode: jest.fn().mockResolvedValue({ id: 'ac-1', status: 'retired' }),
  };

  const attOtTypeMock = {
    listOtTypes: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getOtTypeById: jest.fn().mockResolvedValue({ id: 'ot-type-1' }),
    upsertOtType: jest.fn().mockResolvedValue({ id: 'ot-type-1' }),
    patchOtType: jest.fn().mockResolvedValue({ id: 'ot-type-1' }),
    retireOtType: jest.fn().mockResolvedValue({ id: 'ot-type-1', status: 'inactive' }),
  };

  const attOtCompTypeMock = {
    listOtCompTypes: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getOtCompTypeById: jest.fn().mockResolvedValue({ id: 'ot-comp-1' }),
    upsertOtCompType: jest.fn().mockResolvedValue({ id: 'ot-comp-1' }),
    patchOtCompType: jest.fn().mockResolvedValue({ id: 'ot-comp-1' }),
    retireOtCompType: jest.fn().mockResolvedValue({ id: 'ot-comp-1', status: 'inactive' }),
  };

  const attOtCompLeavePolicyMock = {
    getPolicy: jest.fn().mockResolvedValue({ modeEnabled: false, compBalanceKey: 'compensatory' }),
    putPolicy: jest.fn().mockResolvedValue({ modeEnabled: true, compBalanceKey: 'compensatory' }),
  };

  const attSickLeaveFundOrderMock = {
    getFundOrder: jest.fn().mockResolvedValue({ order: [] }),
    putFundOrder: jest.fn().mockResolvedValue({ order: [] }),
  };

  const attendanceCatalogMock = {
    listWorkShifts: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listEffectiveWorkShifts: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getWorkShiftById: jest.fn().mockResolvedValue({ id: 'ws-1', code: 'morning', name: 'Ca sáng' }),
    createWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1' }),
    updateWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1' }),
    deleteWorkShift: jest.fn().mockResolvedValue({ id: 'ws-1', retired: true }),
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

  const attendanceSheetSignMock = {
    getAttendanceSheetById: jest.fn().mockResolvedValue({ id: 'as-1', status: 'draft' }),
    listSignatures: jest.fn().mockResolvedValue({ header_id: 'as-1', steps: [], can_close: false }),
    createSignature: jest.fn().mockResolvedValue({ header_id: 'as-1', outcome: 'approved' }),
    closeAttendanceSheet: jest.fn().mockResolvedValue({ sheet_id: 'as-1', status: 'closed' }),
    aggregateAttendanceSheet: jest
      .fn()
      .mockResolvedValue({ sheet_id: 'as-1', status: 'draft', line_count: 0, warnings: [] }),
    submitAttendanceSheetForSign: jest.fn().mockResolvedValue({ sheet_id: 'as-1', status: 'submitted', line_count: 0 }),
    reopenAttendanceSheet: jest.fn().mockResolvedValue({ sheet_id: 'as-1', status: 'submitted' }),
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
        { provide: AttendanceConfigService, useValue: attendanceConfigMock },
        { provide: AttLeaveTypeService, useValue: attLeaveTypeMock },
        { provide: AttLeaveAccrualPolicyService, useValue: attLeaveAccrualPolicyMock },
        { provide: AttAttendanceCodeService, useValue: attAttendanceCodeMock },
        { provide: AttOtTypeService, useValue: attOtTypeMock },
        { provide: AttOtCompTypeService, useValue: attOtCompTypeMock },
        { provide: AttOtCompLeavePolicyService, useValue: attOtCompLeavePolicyMock },
        { provide: AttSickLeaveFundOrderService, useValue: attSickLeaveFundOrderMock },
        { provide: LeaveRequestsService, useValue: leaveMock },
        { provide: LeaveBalanceService, useValue: leaveBalanceMock },
        { provide: AttActivateEnrollService, useValue: {} },
        { provide: AttHolidayCalendarService, useValue: {} },
        { provide: AttendanceRequestsService, useValue: attendanceRequestsMock },
        { provide: AttendanceOverviewService, useValue: attendanceOverviewMock },
        { provide: AttendanceSheetSignService, useValue: attendanceSheetSignMock },
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

  it('ATT-05b: get leave balance panel returns HRM-LEAVE-BAL-PANEL-200', async () => {
    const res = await controller.getLeaveBalancePanel(undefined, 'test-key', 'xevn', undefined, {
      company_id: 'holding',
      employee_id: employeeId,
      year: 2026,
    });
    expect(res.code).toBe('HRM-LEAVE-BAL-PANEL-200');
    expect(leaveBalanceMock.getLeaveBalancePanel).toHaveBeenCalled();
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
      controller.listRecords(
        undefined,
        undefined,
        'xevn',
        undefined,
        {
          // tenant/company checks run after auth; this test validates auth branch.
          company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        } as any,
      ),
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

  // R-PLT-ATT-LVRULE-CNS-WIRE — Network-class: assert-consumer surface emits HRM-ATT-LVRULE-KEY.
  it('assert-consumer forwards invent params → service assert (AC-PLT-ATT-LEAVE-BAL-01b)', async () => {
    attLeaveAccrualPolicyMock.assertLeaveAccrualPolicyForConsumer.mockResolvedValueOnce({
      id: 'pol-1',
    });
    const res = await controller.assertConsumerLeaveAccrualPolicy('Bearer x', 'test-key', 'xevn', {
      companyId: 'main',
      leaveTypeKey: 'annual',
      policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      accrualMode: 'year_start_grant',
      annualDays: 999,
    });
    expect(res.code).toBe('HRM-ATT-LVRULE-200');
    expect(res.data).toMatchObject({ skipped: false });
    expect(
      attLeaveAccrualPolicyMock.assertLeaveAccrualPolicyForConsumer,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'main',
        leaveTypeKey: 'annual',
        policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        accrualMode: 'year_start_grant',
        annualDays: 999,
      }),
    );
  });

  it('assert-consumer invent when active>0 → rejects HRM-ATT-LVRULE-KEY 4xx (AC-01b)', async () => {
    attLeaveAccrualPolicyMock.assertLeaveAccrualPolicyForConsumer.mockRejectedValueOnce(
      new ApiException(HRM_ATT_LVRULE_KEY, 'invent forbidden', HttpStatus.BAD_REQUEST),
    );
    const err = await controller
      .assertConsumerLeaveAccrualPolicy('Bearer x', 'test-key', 'xevn', {
        companyId: 'main',
        leaveTypeKey: 'annual',
        policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      })
      .then(
        () => null,
        (e: unknown) => e as ApiException,
      );
    expect(err).toBeInstanceOf(ApiException);
    expect(err?.code).toBe(HRM_ATT_LVRULE_KEY);
    expect(err?.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('assert-consumer empty active → skipped soft (U65, AC-01c)', async () => {
    attLeaveAccrualPolicyMock.assertLeaveAccrualPolicyForConsumer.mockResolvedValueOnce(null);
    const res = await controller.assertConsumerLeaveAccrualPolicy('Bearer x', 'test-key', 'xevn', {
      companyId: 'main',
      leaveTypeKey: 'annual',
      policyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    });
    expect(res.code).toBe('HRM-ATT-LVRULE-200');
    expect(res.data).toMatchObject({ skipped: true });
  });
});
