import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('PerformanceController', () => {
  let controller: PerformanceController;

  const serviceMock = {
    createCycle: jest.fn().mockResolvedValue({ id: 'cycle-1' }),
    listCycles: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'cycle-1' }] }),
    createEvaluation: jest.fn().mockResolvedValue({ id: 'eval-1' }),
    listEvaluations: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'eval-1' }] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceController],
      providers: [{ provide: PerformanceService, useValue: serviceMock }],
    }).compile();
    controller = module.get<PerformanceController>(PerformanceController);
  });

  it('HRM-PF-01 create HRM-PF-02 list HRM-PF-03 create HRM-PF-04 list evaluation performance codes', async () => {
    const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
    const createCycleRes = await controller.createCycle(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      cycle_name: '2026 H1',
      start_date: '2026-01-01',
      end_date: '2026-06-30',
      created_by: 'hrbp-1',
    });
    const listCyclesRes = await controller.listCycles(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    const createEvalRes = await controller.createEvaluation(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      cycle_id: 'cycle-1',
      score: 88,
      summary: 'Strong delivery',
      reviewer: 'mgr-1',
    });
    const listEvalsRes = await controller.listEvaluations(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
      cycle_id: 'cycle-1',
    });

    expect(createCycleRes.code).toBe('HRM-PERF-201');
    expect(listCyclesRes.code).toBe('HRM-PERF-200');
    expect(createEvalRes.code).toBe('HRM-PERF-202');
    expect(listEvalsRes.code).toBe('HRM-PERF-200');
  });

  it('persists group CEO createCycle under holding when request uses main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await controller.createCycle(`Bearer ${token}`, 'test-key', 'xevn', 'main', {
      company_id: 'main',
      cycle_name: '2026 H2',
      start_date: '2026-07-01',
      end_date: '2026-12-31',
      created_by: 'group-ceo',
    });
    expect(serviceMock.createCycle).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main' }),
      `Bearer ${token}`,
    );
  });

  it('blocks unauthorized performance access', () => {
    expect(() =>
      controller.listCycles(undefined, undefined, 'xevn', undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized performance access');
    expect(serviceMock.listCycles).not.toHaveBeenCalled();
  });

  it('HRM-PF-02 accepts portal slug company_id=main for cycle list', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listCycles(`Bearer ${token}`, 'test-key', 'xevn', 'main', {
      company_id: 'main',
    });
    expect(res.code).toBe('HRM-PERF-200');
    expect(serviceMock.listCycles).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main' }),
      `Bearer ${token}`,
    );
  });

  it('rejects scope mismatch before service mutation', () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.listEvaluations(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.listEvaluations).not.toHaveBeenCalled();
  });
});
