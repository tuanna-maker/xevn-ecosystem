import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ContractsInsuranceController } from './contracts-insurance.controller';
import { ContractsInsuranceService } from './contracts-insurance.service';
import { EmployeeCompensationService } from './employee-compensation.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** UC: HRM-CI-01..07 · embed UC-HRM-25 */
describe('ContractsInsuranceController (HRM-CI-01..07)', () => {
  let controller: ContractsInsuranceController;

  const serviceMock = {
    createContract: jest.fn().mockResolvedValue({ id: 'con-1' }),
    createInsuranceRecord: jest.fn().mockResolvedValue({ id: 'ins-1' }),
    listContracts: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'con-1' }] }),
    getContractById: jest.fn().mockResolvedValue({ id: 'con-1' }),
    listExpiringContracts: jest.fn().mockResolvedValue({ total: 1, days: 30, data: [{ id: 'con-1' }] }),
    updateContract: jest.fn().mockResolvedValue({ id: 'con-1', contract_type: 'permanent' }),
    deleteContract: jest.fn().mockResolvedValue({ id: 'con-1', deleted: true }),
    listInsurance: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'ins-1' }] }),
    listExpiringInsurance: jest.fn().mockResolvedValue({ total: 1, days: 30, data: [{ id: 'ins-1' }] }),
  };

  const compensationMock = {
    createPackage: jest.fn().mockResolvedValue({ id: 'pkg-1', version: 1, lines: [] }),
    listPackages: jest.fn().mockResolvedValue({ total: 0, page: 1, page_size: 20, data: [] }),
    getPackageById: jest.fn().mockResolvedValue({ id: 'pkg-1', lines: [] }),
    getActivePackage: jest.fn().mockResolvedValue(null),
    revisePackage: jest.fn().mockResolvedValue({ id: 'pkg-2', version: 2, lines: [] }),
    listHistory: jest.fn().mockResolvedValue({ total: 0, page: 1, page_size: 20, data: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractsInsuranceController],
      providers: [
        { provide: ContractsInsuranceService, useValue: serviceMock },
        { provide: EmployeeCompensationService, useValue: compensationMock },
      ],
    }).compile();

    controller = module.get<ContractsInsuranceController>(ContractsInsuranceController);
  });

  it('HRM-CI-02 create insurance HRM-CI-04 HRM-CI-07 expiring alerts return deterministic codes', async () => {
    const createContractRes = await controller.createContract(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      position_key: 'NV_KD',
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

  it('keeps GET insurance route metadata registered', () => {
    const routePath = Reflect.getMetadata(PATH_METADATA, controller.listInsurance);
    expect(routePath).toBe('insurance');
  });

  it('HRM-CI-03 list HRM-CI-05 update HRM-CI-06 delete contract paths', async () => {
    const companyId = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';
    const listRes = await controller.listContracts(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });
    const detailRes = await controller.getContractById(
      undefined,
      'test-key',
      'xevn',
      undefined,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      { company_id: companyId },
    );
    const updateRes = await controller.updateContract(undefined, 'test-key', 'xevn', companyId, 'con-1', {
      contract_type: 'permanent',
    });
    const deleteRes = await controller.deleteContract(undefined, 'test-key', 'xevn', companyId, 'con-1');
    const listInsRes = await controller.listInsurance(undefined, 'test-key', 'xevn', undefined, {
      company_id: companyId,
    });

    expect(listRes.code).toBe('HRM-CON-200');
    expect(detailRes.code).toBe('HRM-CON-200');
    expect(updateRes.code).toBe('HRM-CON-200');
    expect(deleteRes.code).toBe('HRM-CON-200');
    expect(listInsRes.code).toBe('HRM-CON-200');
    expect(serviceMock.listContracts).toHaveBeenCalled();
    expect(serviceMock.getContractById).toHaveBeenCalledWith(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      companyId,
      undefined,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.updateContract).toHaveBeenCalledWith('con-1', { contract_type: 'permanent' }, companyId, undefined);
    expect(serviceMock.deleteContract).toHaveBeenCalledWith('con-1', companyId, undefined);
  });

  it('accepts internal API key and forwards contracts-insurance payloads', async () => {
    const contractBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      position_key: 'NV_KD',
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

    expect(serviceMock.createContract).toHaveBeenCalledWith(contractBody, undefined);
    expect(serviceMock.createInsuranceRecord).toHaveBeenCalledWith(insuranceBody, undefined);
    expect(serviceMock.listExpiringContracts).toHaveBeenCalledWith(expiringQuery, undefined);
    expect(serviceMock.listExpiringInsurance).toHaveBeenCalledWith(expiringQuery, undefined);
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

  it('BR-INS-01: lists insurance for embed with company_id=main (group CEO)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.listInsurance(`Bearer ${token}`, undefined, 'xevn', 'main', {
      company_id: 'main',
    });
    expect(result.code).toBe('HRM-CON-200');
    expect(serviceMock.listInsurance).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
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
        position_key: 'NV_KD',
        contract_type: 'fixed_term',
        start_date: '2026-04-01',
        end_date: '2026-12-31',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.createContract).not.toHaveBeenCalled();
  });

  it('accepts x-access-token fallback header for contracts and insurance lists', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const contractsRes = await controller.listContracts(
      undefined,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { 'x-access-token': token },
    );
    const insuranceRes = await controller.listInsurance(
      undefined,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { 'x-access-token': token },
    );

    expect(contractsRes.code).toBe('HRM-CON-200');
    expect(insuranceRes.code).toBe('HRM-CON-200');
    expect(serviceMock.listContracts).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
    expect(serviceMock.listInsurance).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });
});
