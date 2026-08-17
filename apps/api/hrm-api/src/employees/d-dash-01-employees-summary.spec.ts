import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { EmpDocumentChecklistService } from './emp-document-checklist.service';
import { EmpDocumentTypeService } from './emp-document-type.service';
import { EmpEmploymentStatusService } from './emp-employment-status.service';
import { EmpEmploymentTypeService } from './emp-employment-type.service';
import { EmpStatusReasonService } from './emp-status-reason.service';
import { EmployeeDependentsService } from './employee-dependents.service';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeRewardDisciplineService } from './employee-reward-discipline.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

/**
 * D-DASH-01 — GET /employees/summary must not match :employeeId (uuid cast on "summary").
 * spec_ref: UC-HRM-20 · HRM_MENU_DATA_LINKAGE_MATRIX dashboard · P1-HRM-PERF-BE-01
 */
describe('D-DASH-01 employees summary route order', () => {
  const validEmployeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
  const summaryPayload = {
    company_id: 'main',
    total: 1107,
    active_count: 1041,
    inactive_count: 66,
    archived_count: 0,
    payroll: { total: 0, employees_with_salary: 0 },
    by_department: [{ department: 'Vận hành', count: 400, avg_salary: null }],
    salary_ranges: [],
    new_hires: { last_30_days: 0, recent: [] },
  };

  const serviceMock = {
    getEmployeesSummary: jest.fn().mockResolvedValue(summaryPayload),
    getEmployeeById: jest.fn().mockResolvedValue({ id: validEmployeeId, company_id: 'holding' }),
    listEmployees: jest.fn(),
    listEmployeeDirectory: jest.fn(),
    createEmployee: jest.fn(),
    getEmployeeDirectoryById: jest.fn(),
    updateEmployee: jest.fn(),
    archiveEmployee: jest.fn(),
    restoreEmployee: jest.fn(),
  };

  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: serviceMock },
        {
          provide: EmployeeDependentsService,
          useValue: {
            listDependents: jest.fn(),
            createDependent: jest.fn(),
            getDependentById: jest.fn(),
            updateDependent: jest.fn(),
            softDeleteDependent: jest.fn(),
          },
        },
        { provide: EmployeeRewardDisciplineService, useValue: {} },
        { provide: EmpDocumentChecklistService, useValue: {} },
        {
          provide: EmployeeProfileService,
          useValue: {
            listDegrees: jest.fn(),
            listTraining: jest.fn(),
            listAssets: jest.fn(),
          },
        },
        { provide: EmpDocumentTypeService, useValue: {} },
        { provide: EmpEmploymentTypeService, useValue: {} },
        { provide: EmpEmploymentStatusService, useValue: {} },
        { provide: EmpStatusReasonService, useValue: {} },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /employees/summary?company_id=main returns HRM-EMP-SUMMARY-200 aggregates', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/hrm/employees/summary?company_id=main')
      .set('x-internal-api-key', 'test-key')
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .expect(200);

    expect(res.body.code).toBe('HRM-EMP-SUMMARY-200');
    expect(res.body.data).toMatchObject({
      company_id: 'main',
      total: 1107,
      active_count: 1041,
    });
    expect(serviceMock.getEmployeesSummary).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main' }),
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
  });

  it('does not treat literal "summary" as :employeeId (no uuid cast 500)', async () => {
    await request(app.getHttpServer())
      .get('/api/hrm/employees/summary?company_id=main')
      .set('x-internal-api-key', 'test-key')
      .set('x-tenant-id', 'xevn')
      .expect(200);

    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
    expect(serviceMock.getEmployeesSummary).toHaveBeenCalled();
  });

  it('GET /employees/:id still resolves get-by-id for valid UUID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/hrm/employees/${validEmployeeId}?company_id=holding`)
      .set('x-internal-api-key', 'test-key')
      .set('x-tenant-id', 'xevn')
      .expect(200);

    expect(res.body.code).toBe('HRM-EMP-200');
    expect(serviceMock.getEmployeeById).toHaveBeenCalledWith(
      validEmployeeId,
      expect.objectContaining({ company_id: 'holding' }),
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.getEmployeesSummary).not.toHaveBeenCalled();
  });
});
