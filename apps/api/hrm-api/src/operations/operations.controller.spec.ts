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

  it('returns deterministic operations codes', async () => {
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

    expect(serviceMock.createTask).toHaveBeenCalledWith(createBody);
    expect(serviceMock.listTasks).toHaveBeenCalledWith(listQuery);
    expect(serviceMock.updateTaskStatus).toHaveBeenCalledWith('task-1', statusBody);
    expect(serviceMock.getSummary).toHaveBeenCalledWith('78b8a663-f5e5-4f4d-a020-b8f950ec2037');
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
