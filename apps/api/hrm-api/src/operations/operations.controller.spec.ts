import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('OperationsController', () => {
  let controller: OperationsController;

  const serviceMock = {
    createTask: jest.fn().mockResolvedValue({ id: 'task-1' }),
    listTasks: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'task-1' }] }),
    updateTaskStatus: jest.fn().mockResolvedValue({ id: 'task-1', status: 'done' }),
    getSummary: jest
      .fn()
      .mockResolvedValue({ attendance_records: 1, payroll_periods: 2, job_requisitions: 3, tasks: 4 }),
    createServiceRequest: jest.fn().mockResolvedValue({ id: 'svc-1' }),
    listServiceRequests: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'svc-1' }] }),
    updateServiceRequest: jest.fn().mockResolvedValue({ id: 'svc-1', status: 'approved' }),
    deleteServiceRequest: jest.fn().mockResolvedValue({ id: 'svc-1' }),
    approveServiceRequest: jest.fn().mockResolvedValue({ id: 'svc-1', status: 'approved' }),
    rejectServiceRequest: jest.fn().mockResolvedValue({ id: 'svc-1', status: 'rejected' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationsController],
      providers: [{ provide: OperationsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<OperationsController>(OperationsController);
  });

  it('HRM-OP-01 create HRM-OP-02 list HRM-OP-03 update HRM-OP-04 summary operations codes', async () => {
    const createRes = await controller.createTask(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      title: 'Follow up recruiting pipeline',
      description: 'Review candidates',
      priority: 'high',
      due_date: '2026-04-28',
    });
    const listRes = await controller.listTasks(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const updateRes = await controller.updateTaskStatus(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { status: 'done' },
    );
    const summaryRes = await controller.getSummary(
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );

    expect(createRes.code).toBe('HRM-OPS-201');
    expect(listRes.code).toBe('HRM-OPS-200');
    expect(updateRes.code).toBe('HRM-OPS-202');
    expect(summaryRes.code).toBe('HRM-OPS-200');
  });

  it('accepts internal API key and forwards operations payloads', async () => {
    const createBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      title: 'Prepare monthly report',
      description: 'Collect summary metrics',
      priority: 'medium' as const,
      due_date: '2026-04-30',
    };
    const listQuery = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      page: 1,
      page_size: 10,
    };
    const statusBody = { status: 'blocked' as const };

    await controller.createTask(undefined, 'test-key', 'xevn', undefined, createBody);
    await controller.listTasks(undefined, 'test-key', 'xevn', undefined, listQuery);
    await controller.updateTaskStatus('task-1', undefined, 'test-key', 'xevn', createBody.company_id, statusBody);
    await controller.getSummary(undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037');

    expect(serviceMock.createTask).toHaveBeenCalledWith(createBody, undefined, 'xevn');
    expect(serviceMock.listTasks).toHaveBeenCalledWith(listQuery, undefined, 'xevn');
    expect(serviceMock.updateTaskStatus).toHaveBeenCalledWith(
      'task-1',
      statusBody,
      createBody.company_id,
      undefined,
      'xevn',
    );
    expect(serviceMock.getSummary).toHaveBeenCalledWith('78b8a663-f5e5-4f4d-a020-b8f950ec2037', undefined, 'xevn');
  });

  it('HRM-OP-02 accepts portal slug company_id=main for task list', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listTasks(`Bearer ${token}`, 'test-key', 'xevn', 'main', {
      company_id: 'main',
    });
    expect(res.code).toBe('HRM-OPS-200');
    expect(serviceMock.listTasks).toHaveBeenCalledWith({ company_id: 'main' }, `Bearer ${token}`, 'xevn');
  });

  const svcBody = {
    company_id: '10000000-0000-4000-8000-000000000001',
    service_type: 'meal' as const,
    employee_name: 'Nguyen Van A',
    request_date: '2026-04-28',
  };
  const svcId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';

  it('HRM-SV-01: create service request returns HRM-SVC-201', async () => {
    const createRes = await controller.createServiceRequest(undefined, 'test-key', 'xevn', undefined, svcBody);
    expect(createRes.code).toBe('HRM-SVC-201');
  });

  it('HRM-SV-03: update service request returns HRM-SVC-202', async () => {
    const updateRes = await controller.updateServiceRequest(
      svcId,
      undefined,
      'test-key',
      'xevn',
      svcBody.company_id,
      { status: 'pending' },
    );
    expect(updateRes.code).toBe('HRM-SVC-202');
  });

  it('HRM-SV-04: delete service request returns HRM-SVC-205', async () => {
    const deleteRes = await controller.deleteServiceRequest(
      svcId,
      undefined,
      'test-key',
      'xevn',
      svcBody.company_id,
    );
    expect(deleteRes.code).toBe('HRM-SVC-205');
  });

  it('HRM-SV-05: approve service request returns HRM-SVC-203', async () => {
    const approveRes = await controller.approveServiceRequest(
      svcId,
      undefined,
      'test-key',
      'xevn',
      svcBody.company_id,
      { approved_by: 'hr-1' },
    );
    expect(approveRes.code).toBe('HRM-SVC-203');
  });

  it('HRM-SV-06: reject service request returns HRM-SVC-204', async () => {
    const rejectRes = await controller.rejectServiceRequest(
      svcId,
      undefined,
      'test-key',
      'xevn',
      svcBody.company_id,
      { rejected_reason: 'no budget' },
    );
    expect(rejectRes.code).toBe('HRM-SVC-204');
  });

  it('HRM-SV-02 accepts portal slug company_id=main for service request list', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listServiceRequests(`Bearer ${token}`, 'test-key', 'xevn', 'main', {
      company_id: 'main',
    });
    expect(res.code).toBe('HRM-SVC-200');
    expect(serviceMock.listServiceRequests).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      'xevn',
    );
  });

  it('MP-14: list service requests exposes request_type alias in API envelope', async () => {
    serviceMock.listServiceRequests.mockResolvedValueOnce([
      {
        id: 'sr-1',
        service_type: 'meal',
        request_type: 'meal',
        status: 'pending',
      },
    ]);
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
      roleCode: 'employee',
    });
    const res = await controller.listServiceRequests(`Bearer ${token}`, 'test-key', 'xevn', undefined, {
      company_id: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
    });
    expect(res.code).toBe('HRM-SVC-200');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data[0]).toMatchObject({ service_type: 'meal', request_type: 'meal', status: 'pending' });
  });

  it('HRM-SV-02 accepts page_size on service request list (P1-CLOSE-BE-W5)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listServiceRequests(`Bearer ${token}`, 'test-key', 'xevn', 'main', {
      company_id: 'main',
      page_size: 10,
    });
    expect(res.code).toBe('HRM-SVC-200');
    expect(serviceMock.listServiceRequests).toHaveBeenCalledWith(
      { company_id: 'main', page_size: 10 },
      `Bearer ${token}`,
      'xevn',
    );
  });

  it('UC-HRM-20 accepts portal slug company_id=main for operations summary', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.getSummary(`Bearer ${token}`, 'test-key', 'xevn', 'main');
    expect(res.code).toBe('HRM-OPS-200');
    expect(serviceMock.getSummary).toHaveBeenCalledWith('main', `Bearer ${token}`, 'xevn');
  });

  it('validates required scope for summary', async () => {
    expect(() => controller.getSummary(undefined, 'test-key', '', '')).toThrow('tenantId is required');
  });

  it('blocks unauthorized operations access', async () => {
    expect(() =>
      controller.listTasks(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized operations access');
    expect(serviceMock.listTasks).not.toHaveBeenCalled();
  });

  it('rejects missing scope before service mutation', async () => {
    expect(() =>
      controller.updateTaskStatus(
        '16f5e2c5-8fbb-4500-8c82-623950f7055e',
        undefined,
        'test-key',
        'xevn',
        '',
        { status: 'done' },
      ),
    ).toThrow('companyId is required');
    expect(serviceMock.updateTaskStatus).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope for service requests', async () => {
    expect(() =>
      controller.createServiceRequest(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        service_type: 'meal',
        employee_name: 'Nguyen Van A',
        request_date: '2026-04-28',
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.createServiceRequest).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch for service request listing', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.listServiceRequests(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.listServiceRequests).not.toHaveBeenCalled();
  });
});
