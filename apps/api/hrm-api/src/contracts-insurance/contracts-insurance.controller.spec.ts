import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ContractsInsuranceController } from './contracts-insurance.controller';
import { ContractsInsuranceService } from './contracts-insurance.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('ContractsInsuranceController', () => {
  let controller: ContractsInsuranceController;

  const serviceMock = {
    createContract: jest.fn().mockResolvedValue({ id: 'con-1' }),
    createInsuranceRecord: jest.fn().mockResolvedValue({ id: 'ins-1' }),
    listExpiringContracts: jest.fn().mockResolvedValue({ total: 1, days: 30, data: [{ id: 'con-1' }] }),
    listExpiringInsurance: jest.fn().mockResolvedValue({ total: 1, days: 30, data: [{ id: 'ins-1' }] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsInsuranceController],
      providers: [{ provide: ContractsInsuranceService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ContractsInsuranceController>(ContractsInsuranceController);
  });

  it('returns deterministic contracts-insurance codes', async () => {
    const createContractRes = await controller.createContract(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      contract_type: 'fixed_term',
      start_date: '2026-04-01',
      end_date: '2026-12-31',
    });
    const createInsuranceRes = await controller.createInsurance(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      provider: 'Bao Viet',
      policy_number: 'BV-001',
      expiry_date: '2026-12-31',
    });
    const expiringContractsRes = await controller.listExpiringContracts(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      days: 60,
    });
    const expiringInsuranceRes = await controller.listExpiringInsurance(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      days: 60,
    });

    expect(createContractRes.code).toBe('HRM-CON-201');
    expect(createInsuranceRes.code).toBe('HRM-CON-202');
    expect(expiringContractsRes.code).toBe('HRM-CON-200');
    expect(expiringInsuranceRes.code).toBe('HRM-CON-200');
  });

  it('accepts internal API key and forwards contracts-insurance payloads', async () => {
    const contractBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      contract_type: 'permanent',
      start_date: '2026-04-01',
      end_date: '2027-04-01',
    };
    const insuranceBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      provider: 'PTI',
      policy_number: 'PTI-2026-01',
      expiry_date: '2027-01-31',
    };
    const expiringQuery = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      days: 45,
    };

    await controller.createContract(undefined, 'test-key', 'xevn', undefined, contractBody);
    await controller.createInsurance(undefined, 'test-key', 'xevn', undefined, insuranceBody);
    await controller.listExpiringContracts(undefined, 'test-key', 'xevn', undefined, expiringQuery);
    await controller.listExpiringInsurance(undefined, 'test-key', 'xevn', undefined, expiringQuery);

    expect(serviceMock.createContract).toHaveBeenCalledWith(contractBody);
    expect(serviceMock.createInsuranceRecord).toHaveBeenCalledWith(insuranceBody);
    expect(serviceMock.listExpiringContracts).toHaveBeenCalledWith(expiringQuery);
    expect(serviceMock.listExpiringInsurance).toHaveBeenCalledWith(expiringQuery);
  });

  it('blocks unauthorized contracts-insurance access', async () => {
    expect(() =>
      controller.listExpiringContracts(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized contracts/insurance access');
    expect(serviceMock.listExpiringContracts).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope deterministically', async () => {
    expect(() =>
      controller.listExpiringContracts(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        days: 30,
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.listExpiringContracts).not.toHaveBeenCalled();
  });

  it('rejects company scope mismatch against token', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.createContract(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        contract_type: 'fixed_term',
        start_date: '2026-04-01',
        end_date: '2026-12-31',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.createContract).not.toHaveBeenCalled();
  });
});
