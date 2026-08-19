/**
 * TR-CM-16 · UC-BP-ATT-11 scope parity — list ↔ GET sheet ↔ GET/POST signatures
 * WorkItem: PO-HRM-BP-ATT-SIGN-BE-01
 */
import { Test, TestingModule } from '@nestjs/testing';
import { signServiceJwt } from '../common/jwt-sign';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { AttendanceRequestsService } from './attendance-requests.service';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalanceService } from './leave-balance.service';
import { AttActivateEnrollService } from './att-activate-enroll.service';
import { AttHolidayCalendarService } from './att-holiday-calendar.service';
import { AttendanceConfigService } from './attendance-config.service';
import { AttendanceOverviewService } from './attendance-overview.service';
import { AttendanceSheetSignService } from './attendance-sheet-sign.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttAttendanceCodeService } from './att-attendance-code.service';
import { AttOtTypeService } from './att-ot-type.service';
import { AttOtCompTypeService } from './att-ot-comp-type.service';
import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from './att-sick-leave-fund-order.service';

const SHEET_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

function trsportMgrToken() {
  return signServiceJwt({
    sub: 'trsport.mgr@xe.vn',
    tenantId: 'xevn',
    companyId: 'trsport',
    roleCode: 'manager',
  });
}

function memberCeoToken() {
  return signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  });
}

describe('ATT sheet scope parity (SP-ATT-SIGN-01..04)', () => {
  let signService: AttendanceSheetSignService;
  let controller: AttendanceController;
  let signSpy: jest.SpyInstance;

  beforeEach(async () => {
    process.env.INTERNAL_API_KEY = 'test-key';
    signService = new AttendanceSheetSignService({ query: jest.fn() } as never);
    signSpy = jest.spyOn(signService, 'listSignatures');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: {} },
        { provide: AttendanceCatalogService, useValue: {} },
        { provide: AttendanceConfigService, useValue: {} },
        { provide: AttLeaveTypeService, useValue: {} },
        { provide: AttLeaveAccrualPolicyService, useValue: {} },
        { provide: AttAttendanceCodeService, useValue: {} },
        { provide: AttOtTypeService, useValue: {} },
        { provide: AttOtCompTypeService, useValue: {} },
        { provide: AttOtCompLeavePolicyService, useValue: {} },
        { provide: AttSickLeaveFundOrderService, useValue: {} },
        { provide: LeaveRequestsService, useValue: {} },
        { provide: LeaveBalanceService, useValue: {} },
        { provide: AttActivateEnrollService, useValue: {} },
        { provide: AttHolidayCalendarService, useValue: {} },
        { provide: AttendanceRequestsService, useValue: {} },
        { provide: AttendanceOverviewService, useValue: {} },
        { provide: AttendanceSheetSignService, useValue: signService },
      ],
    }).compile();
    controller = module.get(AttendanceController);
  });

  afterEach(() => {
    signSpy.mockRestore();
  });

  function mockHeaderRow(companyId: string, status = 'submitted') {
    jest.spyOn(signService, 'assertHeaderInScope').mockResolvedValue({
      id: SHEET_ID,
      company_id: companyId,
      status,
    });
  }

  it('SP-ATT-SIGN-01: id in list scope → GET sheet + GET signatures 200 same header_id', async () => {
    mockHeaderRow('holding');
    signSpy.mockResolvedValue({
      header_id: SHEET_ID,
      status: 'submitted',
      steps: [],
      missing_mandatory_roles: ['employee', 'direct_manager', 'hr_admin'],
      can_close: false,
    });

    const token = groupCeoToken();
    const auth = `Bearer ${token}`;

    const getRes = await controller.getAttendanceSheet(
      SHEET_ID,
      auth,
      'test-key',
      'xevn',
      undefined,
      'main',
    );
    const sigRes = await controller.listAttendanceSheetSignatures(
      SHEET_ID,
      auth,
      'test-key',
      'xevn',
      undefined,
      'main',
    );

    expect(getRes.code).toBe('HRM-AS-200');
    expect(getRes.data.id).toBe(SHEET_ID);
    expect(sigRes.code).toBe('HRM-ATT-SIGN-200');
    expect(sigRes.data.header_id).toBe(SHEET_ID);
  });

  it('SP-ATT-SIGN-02: row outside member scope → assertHeader throws (never 200 leak)', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({
        rows: [{ id: SHEET_ID, company_id: 'holding', status: 'submitted' }],
      });
    });
    const svc = new AttendanceSheetSignService({ query: queryMock } as never);
    const token = memberCeoToken();
    const auth = `Bearer ${token}`;

    await expect(svc.getAttendanceSheetById(SHEET_ID, 'main', auth)).rejects.toMatchObject({
      code: 'HRM-AS-409',
    });
  });

  it('SP-ATT-SIGN-03: member mgr resolved trsport scope matches stored slug (PO-MFD-M2 parity)', async () => {
    mockHeaderRow('trsport');
    signSpy.mockResolvedValue({
      header_id: SHEET_ID,
      status: 'submitted',
      steps: [],
      missing_mandatory_roles: [],
      can_close: false,
    });

    const auth = `Bearer ${trsportMgrToken()}`;
    const ok = await controller.listAttendanceSheetSignatures(
      SHEET_ID,
      auth,
      'test-key',
      'xevn',
      'main',
      'trsport',
    );
    expect(ok.code).toBe('HRM-ATT-SIGN-200');
    expect(signSpy).toHaveBeenCalledWith(SHEET_ID, 'trsport', auth);

    const queryMock = jest.fn().mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({
        rows: [{ id: SHEET_ID, company_id: 'trsport', status: 'submitted' }],
      });
    });
    const svc = new AttendanceSheetSignService({ query: queryMock } as never);
    await expect(svc.listSignatures(SHEET_ID, 'main', auth)).rejects.toMatchObject({
      code: 'HRM-AS-409',
    });
  });

  it('SP-ATT-SIGN-04: company_id=xevn + JWT main → 409 before sign service (resolveScopeContext)', async () => {
    const auth = `Bearer ${groupCeoToken()}`;
    signSpy.mockImplementation(() => {
      throw new Error('sign service must not run when scope mismatches');
    });

    await expect(
      (async () => {
        await controller.listAttendanceSheetSignatures(
          SHEET_ID,
          auth,
          'test-key',
          'xevn',
          undefined,
          'xevn',
        );
      })(),
    ).rejects.toMatchObject({ code: 'SCOPE_CONTEXT_MISMATCH' });

    expect(signSpy).not.toHaveBeenCalled();
  });
});

describe('assertAttendanceSheetHeaderInScope (unit)', () => {
  it('returns row when company_id matches group CEO rollup on holding', async () => {
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({
        rows: [{ id: SHEET_ID, company_id: 'holding', status: 'submitted' }],
      });
    });
    const catalog = new AttendanceCatalogService({ query: queryMock } as never);
    const token = groupCeoToken();
    const row = await catalog.assertAttendanceSheetHeaderInScope(SHEET_ID, 'main', `Bearer ${token}`);
    expect(row.company_id).toBe('holding');
  });
});
