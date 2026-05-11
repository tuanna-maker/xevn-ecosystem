import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const serviceMock = {
    createRecord: jest.fn().mockResolvedValue({ id: 'r1' }),
    listRecords: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'r1' }] }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'r1', status: 'present' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [{ provide: AttendanceService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('returns deterministic attendance codes', async () => {
    const createRes = await controller.createRecord(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      attendance_date: '2026-04-22',
      status: 'pending',
    });
    const listRes = await controller.listRecords(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const statusRes = await controller.updateStatus(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { status: 'present' },
    );

    expect(createRes.code).toBe('HRM-ATT-201');
    expect(listRes.code).toBe('HRM-ATT-200');
    expect(statusRes.code).toBe('HRM-ATT-202');
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

    expect(serviceMock.createRecord).toHaveBeenCalledWith(body);
    expect(serviceMock.listRecords).toHaveBeenCalledWith(query);
    expect(serviceMock.updateStatus).toHaveBeenCalledWith('r1', patch);
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
});
