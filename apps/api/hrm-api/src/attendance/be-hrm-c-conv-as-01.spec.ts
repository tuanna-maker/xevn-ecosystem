/**
 * BE-HRM-C-CONV-AS-01 — CreateAttendanceSheetDto / UpdateAttendanceSheetDto at edge.
 * Invalid body → ValidationPipe 400. must_keep AC-ATT-SHEET empty honesty (no auto-seed).
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validateSync } from 'class-validator';
import request from 'supertest';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { AttendanceConfigService } from './attendance-config.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceOverviewService } from './attendance-overview.service';
import { AttendanceRequestsService } from './attendance-requests.service';
import { AttendanceService } from './attendance.service';
import { AttendanceSheetSignService } from './attendance-sheet-sign.service';
import { AttAttendanceCodeService } from './att-attendance-code.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import { AttOtCompTypeService } from './att-ot-comp-type.service';
import { AttOtTypeService } from './att-ot-type.service';
import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from './att-sick-leave-fund-order.service';
import { AttShiftService } from './att-shift.service';
import { AttRuleService } from './att-rule.service';
import { AttScheduleService } from './att-schedule.service';
import { CreateAttendanceSheetDto } from './dto/create-attendance-sheet.dto';
import { UpdateAttendanceSheetDto } from './dto/update-attendance-sheet.dto';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveRequestsService } from './leave-requests.service';
import { AttActivateEnrollService } from './att-activate-enroll.service';
import { AttHolidayCalendarService } from './att-holiday-calendar.service';

const PIPE = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
} as const;

const validCreate = {
  company_id: 'holding',
  name: 'Bảng chấm công 01/07/2026–31/07/2026 (Công chuẩn)',
  start_date: '2026-07-01',
  end_date: '2026-07-31',
  attendance_type: 'daily',
  standard_type: 'fixed',
  department: null,
  positions: null,
  notes: null,
};

describe('BE-HRM-C-CONV-AS-01 CreateAttendanceSheetDto', () => {
  it('accepts TechSpec create body (FE Công chuẩn fixed)', () => {
    const dto = Object.assign(new CreateAttendanceSheetDto(), {
      ...validCreate,
    });
    expect(validateSync(dto, PIPE)).toHaveLength(0);
  });

  it('rejects missing required name / dates', () => {
    const dto = Object.assign(new CreateAttendanceSheetDto(), {
      company_id: 'holding',
    });
    const errors = validateSync(dto, PIPE);
    const props = errors.map((e) => e.property);
    expect(props).toEqual(
      expect.arrayContaining(['name', 'start_date', 'end_date']),
    );
  });

  it('rejects non-ISO start_date', () => {
    const dto = Object.assign(new CreateAttendanceSheetDto(), {
      ...validCreate,
      start_date: '01/07/2026',
    });
    const errors = validateSync(dto, PIPE);
    expect(errors.some((e) => e.property === 'start_date')).toBe(true);
  });

  it('rejects unknown properties (forbidNonWhitelisted)', () => {
    const dto = Object.assign(new CreateAttendanceSheetDto(), {
      ...validCreate,
      auto_seed_roster: true,
      status: 'published',
    });
    const errors = validateSync(dto, PIPE);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('UpdateAttendanceSheetDto accepts partial name only', () => {
    const dto = Object.assign(new UpdateAttendanceSheetDto(), {
      name: 'Kỳ 7/2026',
    });
    expect(validateSync(dto, PIPE)).toHaveLength(0);
  });
});

describe('BE-HRM-C-CONV-AS-01 Nest ValidationPipe HTTP 400', () => {
  let app: INestApplication;
  let createAttendanceSheet: jest.Mock;

  beforeAll(async () => {
    process.env.INTERNAL_API_KEY = 'test-key-c-conv-as-01';
    createAttendanceSheet = jest.fn().mockResolvedValue({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      company_id: 'holding',
      name: validCreate.name,
      start_date: validCreate.start_date,
      end_date: validCreate.end_date,
      status: 'draft',
    });

    const moduleRef = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: {} },
        {
          provide: AttendanceCatalogService,
          useValue: {
            listAttendanceSheets: jest.fn(),
            createAttendanceSheet,
            updateAttendanceSheet: jest.fn(),
            deleteAttendanceSheet: jest.fn(),
            listWorkShifts: jest.fn(),
            createWorkShift: jest.fn(),
            updateWorkShift: jest.fn(),
            deleteWorkShift: jest.fn(),
          },
        },
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
        { provide: AttShiftService, useValue: {} },
        { provide: AttRuleService, useValue: {} },
        { provide: AttScheduleService, useValue: {} },
        { provide: AttendanceRequestsService, useValue: {} },
        { provide: AttendanceOverviewService, useValue: {} },
        { provide: AttendanceSheetSignService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(new ValidationPipe(PIPE));
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    createAttendanceSheet.mockClear();
  });

  it('POST missing body fields → 400; catalog not called', async () => {
    await request(app.getHttpServer())
      .post('/api/hrm/attendance/attendance-sheets')
      .set('x-internal-api-key', 'test-key-c-conv-as-01')
      .send({ company_id: 'holding' })
      .expect(400);
    expect(createAttendanceSheet).not.toHaveBeenCalled();
  });

  it('POST unknown property → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/hrm/attendance/attendance-sheets')
      .set('x-internal-api-key', 'test-key-c-conv-as-01')
      .send({ ...validCreate, auto_seed_roster: true })
      .expect(400);
    expect(createAttendanceSheet).not.toHaveBeenCalled();
  });

  it('POST valid body → 201 HRM-AS-201 (header only contract)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/hrm/attendance/attendance-sheets')
      .set('x-internal-api-key', 'test-key-c-conv-as-01')
      .send(validCreate)
      .expect(201);
    expect(res.body.code).toBe('HRM-AS-201');
    expect(createAttendanceSheet).toHaveBeenCalledTimes(1);
    const [payload] = createAttendanceSheet.mock.calls[0] as [
      CreateAttendanceSheetDto,
    ];
    expect(payload).toMatchObject({
      company_id: 'holding',
      name: validCreate.name,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      standard_type: 'fixed',
    });
    expect(payload).not.toHaveProperty('auto_seed_roster');
  });

  it('PATCH unknown property → 400', async () => {
    await request(app.getHttpServer())
      .patch(
        '/api/hrm/attendance/attendance-sheets/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee?company_id=holding',
      )
      .set('x-internal-api-key', 'test-key-c-conv-as-01')
      .send({ name: 'ok', invent_records: true })
      .expect(400);
  });
});

describe('BE-HRM-C-CONV-AS-01 must_keep no auto-seed on create SQL', () => {
  it('createAttendanceSheet INSERT targets attendance_sheets only', async () => {
    const queries: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (sql.includes('CREATE TABLE')) return { rows: [] };
        return {
          rows: [
            {
              id: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
              company_id: 'holding',
              name: validCreate.name,
              start_date: validCreate.start_date,
              end_date: validCreate.end_date,
              status: 'draft',
            },
          ],
        };
      }),
    };
    const service = new AttendanceCatalogService(db as never);
    await service.createAttendanceSheet(
      Object.assign(new CreateAttendanceSheetDto(), { ...validCreate }),
      undefined,
    );
    const insertSql = queries.find((q) =>
      q.includes('INSERT INTO public.attendance_sheets'),
    );
    expect(insertSql).toBeDefined();
    expect(
      queries.some((q) => /INSERT INTO public\.attendance_records/i.test(q)),
    ).toBe(false);
  });
});
