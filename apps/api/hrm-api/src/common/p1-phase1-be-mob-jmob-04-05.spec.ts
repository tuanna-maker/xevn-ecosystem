import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AttendanceController } from '../attendance/attendance.controller';
import { AttendanceCatalogService } from '../attendance/attendance-catalog.service';
import { AttendanceConfigService } from '../attendance/attendance-config.service';
import { AttendanceOverviewService } from '../attendance/attendance-overview.service';
import { AttendanceRequestsService } from '../attendance/attendance-requests.service';
import { AttendanceService } from '../attendance/attendance.service';
import { AttendanceSheetSignService } from '../attendance/attendance-sheet-sign.service';
import { AttAttendanceCodeService } from '../attendance/att-attendance-code.service';
import { AttLeaveAccrualPolicyService } from '../attendance/att-leave-accrual-policy.service';
import { AttLeaveTypeService } from '../attendance/att-leave-type.service';
import { AttOtTypeService } from '../attendance/att-ot-type.service';
import { AttOtCompTypeService } from '../attendance/att-ot-comp-type.service';
import { AttOtCompLeavePolicyService } from '../attendance/att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from '../attendance/att-sick-leave-fund-order.service';
import { LeaveBalanceService } from '../attendance/leave-balance.service';
import { LeaveRequestsService } from '../attendance/leave-requests.service';
import { AttActivateEnrollService } from '../attendance/att-activate-enroll.service';
import { AttHolidayCalendarService } from '../attendance/att-holiday-calendar.service';
import { PayrollCatalogService } from '../payroll/payroll-catalog.service';
import { PayrollController } from '../payroll/payroll.controller';
import { PayrollService } from '../payroll/payroll.service';
import { PayFormulaService } from '../payroll/pay-formula.service';
import { PaySheetTemplateService } from '../payroll/pay-sheet-template.service';
import { PayPeriodInputPackService } from '../payroll/pay-period-input-pack.service';
import { PayPayrollGroupService } from '../payroll/pay-payroll-group.service';
import { PayCnttSetupService } from '../payroll/pay-cntt-setup.service';
import { GlobalHttpExceptionFilter } from './http-exception.filter';
import { signServiceJwt } from './jwt-sign';

describe('P1-PHASE1-BE-MOB-JMOB-04-05-01 (mobile HTTPS scope parity)', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
  const managerId = 'ea430f27-74f3-4f03-99ee-1e44cb407bd9';
  const employeeId = '11111111-1111-4111-8111-111111111111';

  const uatToken = signServiceJwt({
    sub: 'uat.nv0001@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    company_uuid: holdingUuid,
    employee_id: managerId,
    roleCode: 'employee',
  });

  beforeAll(() => {
    process.env.INTERNAL_API_KEY = 'test-key';
  });

  it('GET /payroll/payslips?company_id=<uuid> lists holding-slug rows (J-MOB-04)', async () => {
    const payrollMock = {
      listPayslips: jest.fn().mockResolvedValue({
        total: 1,
        data: [{ id: 'ps-1', company_id: 'holding', employee_id: employeeId }],
      }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: payrollMock },
        { provide: PayrollCatalogService, useValue: {} },
        { provide: PayFormulaService, useValue: {} },
        { provide: PaySheetTemplateService, useValue: {} },
        { provide: PayPeriodInputPackService, useValue: {} },
        { provide: PayPayrollGroupService, useValue: {} },
        { provide: PayCnttSetupService, useValue: {} },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();

    await request(app.getHttpServer())
      .get(
        `/api/hrm/payroll/payslips?${new URLSearchParams({
          company_id: holdingUuid,
          employee_id: employeeId,
        }).toString()}`,
      )
      .set('Authorization', `Bearer ${uatToken}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', holdingUuid)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe('HRM-PAY-200');
        expect(res.body.data.total).toBe(1);
      });

    expect(payrollMock.listPayslips).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: holdingUuid,
        employee_id: employeeId,
      }),
      expect.stringContaining('Bearer'),
      expect.objectContaining({ tenantId: 'xevn' }),
    );
    await app.close();
  });

  it('GET /attendance/update-requests?company_id=holding returns manager pending (J-MOB-05)', async () => {
    const attendanceMock = {
      listUpdateRequests: jest.fn().mockResolvedValue({
        total: 1,
        data: [{ id: 'ur-1', company_id: holdingUuid, status: 'pending' }],
      }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: attendanceMock },
        { provide: AttendanceCatalogService, useValue: {} },
        { provide: AttendanceConfigService, useValue: {} },
        { provide: AttLeaveTypeService, useValue: {} },
        { provide: AttLeaveAccrualPolicyService, useValue: {} },
        { provide: AttAttendanceCodeService, useValue: {} },
        { provide: AttOtTypeService, useValue: {} },
        { provide: AttOtCompTypeService, useValue: {} },
        { provide: AttOtCompLeavePolicyService, useValue: {} },
        { provide: AttSickLeaveFundOrderService, useValue: {} },
        { provide: AttendanceOverviewService, useValue: {} },
        { provide: AttendanceRequestsService, useValue: {} },
        { provide: LeaveRequestsService, useValue: {} },
        { provide: LeaveBalanceService, useValue: {} },
        { provide: AttActivateEnrollService, useValue: {} },
        { provide: AttHolidayCalendarService, useValue: {} },
        { provide: AttendanceSheetSignService, useValue: {} },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();

    await request(app.getHttpServer())
      .get(
        `/api/hrm/attendance/update-requests?${new URLSearchParams({
          company_id: 'holding',
          status: 'pending',
          manager_employee_id: managerId,
        }).toString()}`,
      )
      .set('Authorization', `Bearer ${uatToken}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', holdingUuid)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe('HRM-ATT-REQ-200');
        expect(res.body.data.total).toBe(1);
      });

    expect(attendanceMock.listUpdateRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'holding',
        status: 'pending',
        manager_employee_id: managerId,
      }),
      expect.stringContaining('Bearer'),
      'xevn',
    );
    await app.close();
  });
});
