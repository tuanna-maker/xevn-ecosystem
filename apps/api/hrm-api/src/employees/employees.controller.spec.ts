import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const serviceMock = {
    createEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
    listEmployees: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getEmployeeById: jest.fn().mockResolvedValue({ id: 'e1', company_id: 'holding' }),
    updateEmployee: jest.fn().mockResolvedValue({ id: 'e1' }),
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
          provide: EmployeeProfileService,
          useValue: {
            listDegrees: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            listTraining: jest.fn().mockResolvedValue({ total: 0, data: [] }),
            listAssets: jest.fn().mockResolvedValue({ total: 0, data: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('HRM-EM-01 create HRM-EM-02 list returns deterministic codes', async () => {
    const created = await controller.createEmployee(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_code: 'E001',
      email: 'e1@xe.vn',
      full_name: 'Employee 1',
    });
    const listed = await controller.listEmployees(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(created.code).toBe('HRM-EMP-201');
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
      controller.createEmployee(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
        employee_code: 'E001',
        email: 'e1@xe.vn',
        full_name: 'Employee 1',
      }),
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
