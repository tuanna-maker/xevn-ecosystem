import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
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

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const serviceMock = {
    createEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
    listEmployees: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getEmployeesSummary: jest.fn().mockResolvedValue({
      company_id: 'main',
      total: 0,
      active_count: 0,
      inactive_count: 0,
      archived_count: 0,
      payroll: { total: 0, employees_with_salary: 0 },
      by_department: [],
      salary_ranges: [],
      new_hires: { last_30_days: 0, recent: [] },
    }),
    listEmployeeDirectory: jest
      .fn()
      .mockResolvedValue({ total: 1, page: 1, page_size: 30, data: [] }),
    getEmployeeById: jest
      .fn()
      .mockResolvedValue({ id: 'e1', company_id: 'holding' }),
    getEmployeeDirectoryById: jest
      .fn()
      .mockResolvedValue({ id: 'e1', full_name: 'Directory User' }),
    updateEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
    activateEmployee: jest
      .fn()
      .mockResolvedValue({ id: 'e1', status: 'active' }),
    archiveEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
    restoreEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
  };

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
            listDependents: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getDependentById: jest.fn(),
            createDependent: jest.fn(),
            updateDependent: jest.fn(),
            softDeleteDependent: jest.fn(),
          },
        },
        {
          provide: EmployeeRewardDisciplineService,
          useValue: {
            listRewards: jest.fn(),
            listDiscipline: jest.fn(),
            createReward: jest.fn(),
            createDiscipline: jest.fn(),
          },
        },
        {
          provide: EmpDocumentChecklistService,
          useValue: {
            listChecklist: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getChecklistItemById: jest.fn(),
            createChecklistItem: jest.fn(),
            updateChecklistItem: jest.fn(),
            softArchiveChecklistItem: jest.fn(),
          },
        },
        {
          provide: EmployeeProfileService,
          useValue: {
            listDegrees: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            listTraining: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            listAssets: jest.fn().mockResolvedValue({ total: 0, data: [] }),
          },
        },
        {
          provide: EmpDocumentTypeService,
          useValue: {
            listDocumentTypes: jest
              .fn()
              .mockResolvedValue({ total: 0, data: [] }),
            listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getDocumentTypeById: jest.fn(),
            upsertDocumentType: jest.fn(),
            patchDocumentType: jest.fn(),
            retireDocumentType: jest.fn(),
          },
        },
        {
          provide: EmpEmploymentTypeService,
          useValue: {
            listEmploymentTypes: jest
              .fn()
              .mockResolvedValue({ total: 0, data: [] }),
            listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getEmploymentTypeById: jest.fn(),
            upsertEmploymentType: jest.fn(),
            patchEmploymentType: jest.fn(),
            retireEmploymentType: jest.fn(),
          },
        },
        {
          provide: EmpEmploymentStatusService,
          useValue: {
            listEmploymentStatuses: jest
              .fn()
              .mockResolvedValue({ total: 0, data: [] }),
            listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getEmploymentStatusById: jest.fn(),
            upsertEmploymentStatus: jest.fn(),
            patchEmploymentStatus: jest.fn(),
            retireEmploymentStatus: jest.fn(),
          },
        },
        {
          provide: EmpStatusReasonService,
          useValue: {
            listStatusReasons: jest
              .fn()
              .mockResolvedValue({ total: 0, data: [] }),
            listEffective: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            getStatusReasonById: jest.fn(),
            upsertStatusReason: jest.fn(),
            patchStatusReason: jest.fn(),
            retireStatusReason: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('HRM-EM-01 create HRM-EM-02 list returns deterministic codes', async () => {
    const created = await controller.createEmployee(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_code: 'E001',
        email: 'e1@xe.vn',
        full_name: 'Employee 1',
      },
    );
    const listed = await controller.listEmployees(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      },
    );
    expect(created.code).toBe('HRM-EMP-201');
    expect(serviceMock.createEmployee).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
      undefined,
      { tenantId: 'xevn' },
    );
    expect(listed.code).toBe('HRM-EMP-200');
  });

  it('returns deterministic get-by-id code', async () => {
    const got = await controller.getEmployeeById(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      undefined,
      'test-key',
      'xevn',
      undefined,
      { company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037' },
    );
    expect(got.code).toBe('HRM-EMP-200');
    expect(serviceMock.getEmployeeById).toHaveBeenCalledWith(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      { company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037' },
      undefined,
      { tenantId: 'xevn' },
    );
  });

  it('J-HRM-06: group CEO get-by-id accepts x-tenant-id main alias with company_id=main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const employeeId = '00000000-0000-4000-8000-000000000002';
    const got = await controller.getEmployeeById(
      employeeId,
      `Bearer ${token}`,
      undefined,
      'main',
      'main',
      { company_id: 'main' },
    );
    expect(got.code).toBe('HRM-EMP-200');
    expect(serviceMock.getEmployeeById).toHaveBeenCalledWith(
      employeeId,
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'main' },
    );
  });

  it('HRM-EM-03 update HRM-EM-04 archive HRM-EM-05 restore returns deterministic codes', async () => {
    const updated = await controller.updateEmployee(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { full_name: 'Employee Updated' },
    );
    const archived = await controller.archiveEmployee(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    const restored = await controller.restoreEmployee(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(updated.code).toBe('HRM-EMP-202');
    expect(archived.code).toBe('HRM-EMP-203');
    expect(restored.code).toBe('HRM-EMP-204');
    // W1-B-02-EMP — PATCH passes scopeContext like list/get (FR-UC-HRM-21 parity).
    expect(serviceMock.updateEmployee).toHaveBeenCalledWith(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      { full_name: 'Employee Updated' },
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.restoreEmployee).toHaveBeenCalledWith(
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
      { tenantId: 'xevn' },
    );
  });

  it('MOB-W7-5: list view=directory returns HRM-EMP-DIR-200', async () => {
    const listed = await controller.listEmployees(
      undefined,
      'test-key',
      'xevn',
      undefined,
      {
        company_id: 'holding',
        view: 'directory',
        q: 'nguyen',
      },
    );
    expect(listed.code).toBe('HRM-EMP-DIR-200');
    expect(serviceMock.listEmployeeDirectory).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'holding',
        view: 'directory',
        q: 'nguyen',
      }),
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.listEmployees).not.toHaveBeenCalled();
  });

  it('MOB-W7-5: get-by-id view=directory uses directory service', async () => {
    const got = await controller.getEmployeeById(
      '11111111-1111-4111-8111-111111111111',
      undefined,
      'test-key',
      'xevn',
      undefined,
      { company_id: 'holding', view: 'directory' },
    );
    expect(got.code).toBe('HRM-EMP-200');
    expect(serviceMock.getEmployeeDirectoryById).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      { company_id: 'holding', view: 'directory' },
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
  });

  it('D-DASH-01: getEmployeesSummary returns HRM-EMP-SUMMARY-200 without hitting get-by-id', async () => {
    const summary = await controller.getEmployeesSummary(
      undefined,
      'test-key',
      'xevn',
      'main',
      {
        company_id: 'main',
      },
    );
    expect(summary.code).toBe('HRM-EMP-SUMMARY-200');
    expect(serviceMock.getEmployeesSummary).toHaveBeenCalledWith(
      { company_id: 'main' },
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
  });

  it('blocks unauthorized access', async () => {
    expect(() =>
      controller.listEmployees(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized employee access');
    expect(serviceMock.listEmployees).not.toHaveBeenCalled();
  });

  it('rejects missing scope before service mutation', async () => {
    expect(() =>
      controller.createEmployee(undefined, 'test-key', '', undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_code: 'E001',
        email: 'e1@xe.vn',
        full_name: 'Employee 1',
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.createEmployee).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch before service mutation', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.createEmployee(
        `Bearer ${token}`,
        undefined,
        'xevn',
        undefined,
        {
          company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          employee_code: 'E001',
          email: 'e1@xe.vn',
          full_name: 'Employee 1',
        },
      ),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.createEmployee).not.toHaveBeenCalled();
  });

  it('rejects get-by-id scope mismatch before service read', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    expect(() =>
      controller.getEmployeeById(
        '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        `Bearer ${token}`,
        undefined,
        'xevn',
        undefined,
        { company_id: 'trsport' },
      ),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
  });

  it('blocks unauthorized get-by-id', async () => {
    expect(() =>
      controller.getEmployeeById(
        '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        undefined,
        undefined,
        'xevn',
        undefined,
        { company_id: 'holding' },
      ),
    ).toThrow('Unauthorized employee access');
    expect(serviceMock.getEmployeeById).not.toHaveBeenCalled();
  });
});
