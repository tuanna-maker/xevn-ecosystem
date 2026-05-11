import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('PayrollController', () => {
  let controller: PayrollController;

  const serviceMock = {
    createPayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1' }),
    listPayrollPeriods: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'p1' }] }),
    processPayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1', status: 'processing' }),
    closePayrollPeriod: jest.fn().mockResolvedValue({ id: 'p1', status: 'closed' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [{ provide: PayrollService, useValue: serviceMock }],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('returns deterministic payroll codes', async () => {
    const createRes = await controller.createPayrollPeriod(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      created_by: 'system',
    });
    const listRes = await controller.listPayrollPeriods(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const processRes = await controller.processPayrollPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    const closeRes = await controller.closePayrollPeriod(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(createRes.code).toBe('HRM-PAY-201');
    expect(listRes.code).toBe('HRM-PAY-200');
    expect(processRes.code).toBe('HRM-PAY-202');
    expect(closeRes.code).toBe('HRM-PAY-203');
  });

  it('accepts internal API key and forwards payroll calls', async () => {
    const body = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      created_by: 'qa',
    };
    const query = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processed' as const,
    };

    await controller.createPayrollPeriod(undefined, 'test-key', 'xevn', undefined, body);
    await controller.listPayrollPeriods(undefined, 'test-key', 'xevn', undefined, query);
    await controller.processPayrollPeriod('p1', undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037');
    await controller.closePayrollPeriod('p1', undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037');

    expect(serviceMock.createPayrollPeriod).toHaveBeenCalledWith(body);
    expect(serviceMock.listPayrollPeriods).toHaveBeenCalledWith(query);
    expect(serviceMock.processPayrollPeriod).toHaveBeenCalledWith('p1');
    expect(serviceMock.closePayrollPeriod).toHaveBeenCalledWith('p1');
  });

  it('blocks unauthorized payroll access', async () => {
    expect(() =>
      controller.listPayrollPeriods(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized payroll access');
    expect(serviceMock.listPayrollPeriods).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope deterministically', async () => {
    expect(() =>
      controller.createPayrollPeriod(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        created_by: 'qa',
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.createPayrollPeriod).not.toHaveBeenCalled();
  });

  it('rejects company scope mismatch against token', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.createPayrollPeriod(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
        created_by: 'qa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.createPayrollPeriod).not.toHaveBeenCalled();
  });
});
