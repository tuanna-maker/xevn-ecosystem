import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { ContractsInsuranceService } from './contracts-insurance.service';

describe('ContractsInsuranceService', () => {
  let service: ContractsInsuranceService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new ContractsInsuranceService(db);
  });

  it('throws deterministic date-range error when contract start_date > end_date', async () => {
    await expect(
      service.createContract({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
        contract_type: 'fixed_term',
        start_date: '2026-05-01',
        end_date: '2026-04-01',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-CON-001' });
  });

  it('lists expiring contracts with deterministic days envelope', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_contracts') && sql.includes('ORDER BY end_date ASC')) {
        return {
          rows: [
            {
              id: 'ct1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
              contract_type: 'fixed_term',
              start_date: '2026-01-01',
              end_date: '2026-04-30',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-04-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listExpiringContracts({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      days: 15,
    });

    expect(result.total).toBe(1);
    expect(result.days).toBe(15);
    expect(result.data[0]).toMatchObject({ id: 'ct1' });
  });

  it('listContracts joins employee name and department', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_contracts ec') && sql.includes('LEFT JOIN public.employees e')) {
        return {
          rows: [
            {
              id: 'ct1',
              company_id: 'holding',
              employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
              contract_type: 'HĐ lao động (fidelity)',
              start_date: '2024-01-01',
              end_date: '2027-12-31',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
              employee_name: 'Nguyen Van A',
              employee_code: 'NV0001',
              department: 'Nhân sự',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listContracts({ company_id: 'main' });
    expect(result.data[0].employee_name).toBe('Nguyen Van A');
    expect(result.data[0].department).toBe('Nhân sự');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('e.archived_at IS NULL'),
      expect.any(Array),
    );
  });

  it('listContracts scopes employee_id to workforce rollup for company_id=main (J-HRM-01)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_contracts ec')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listContracts({ company_id: 'main' }, `Bearer ${token}`);

    const listCall = db.query.mock.calls.find(
      ([sql]) => typeof sql === 'string' && sql.includes('FROM public.employee_contracts ec'),
    );
    expect(listCall?.[0]).toEqual(expect.stringContaining('ec.employee_id IN'));
    expect(listCall?.[0]).toEqual(expect.stringContaining("custom_fields->>'tenant_id'"));
    expect(listCall?.[1]).toEqual(expect.arrayContaining(['xevn', expect.any(Array)]));
  });

  it('getContractById keeps list/detail scope parity for company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const contractId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_contracts ec') && sql.includes('ec.id = $1::uuid')) {
        return {
          rows: [
            {
              id: contractId,
              company_id: 'holding',
              employee_id: '11111111-1111-4111-8111-111111111111',
              contract_type: 'HĐ lao động (fidelity)',
              start_date: '2024-01-01',
              end_date: '2027-12-31',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
              employee_name: 'Nguyen Van A',
              employee_code: 'NV0001',
              department: 'Nhân sự',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getContractById(contractId, 'main', `Bearer ${token}`);

    expect(result.id).toBe(contractId);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([contractId, expect.any(Array)]),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('e.archived_at IS NULL'),
      expect.any(Array),
    );
    const detailCall = db.query.mock.calls.find(
      ([sql]) => typeof sql === 'string' && sql.includes('ec.id = $1::uuid'),
    );
    expect(detailCall?.[0]).toEqual(expect.stringContaining('ec.employee_id IN'));
    expect(detailCall?.[0]).toEqual(expect.stringContaining("custom_fields->>'tenant_id'"));
  });

  it('lists expiring insurance records with default days', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurance_records') && sql.includes('ORDER BY expiry_date ASC')) {
        return {
          rows: [
            {
              id: 'ins1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
              provider: 'Bao Viet',
              policy_number: 'POL-1',
              expiry_date: '2026-04-30',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-04-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listExpiringInsurance({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });

    expect(result.total).toBe(1);
    expect(result.days).toBe(30);
    expect(result.data[0]).toMatchObject({ id: 'ins1' });
  });

  it('deleteContract scopes to group rollup when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const contractId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT company_id::text AS company_id FROM public.employee_contracts')) {
        return { rows: [{ company_id: 'holding' }] } as never;
      }
      if (sql.includes('DELETE FROM public.employee_contracts')) {
        return { rows: [{ id: contractId }] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.deleteContract(contractId, 'main', `Bearer ${token}`);

    expect(result.id).toBe(contractId);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([contractId, expect.any(Array)]),
    );
  });

  it('BR-INS-01: listInsurance rolls up company_id=main and maps BHXH fields', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurance_records ir')) {
        return {
          rows: [
            {
              id: 'ins1',
              company_id: 'holding',
              employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
              provider: 'BHXH',
              policy_number: 'BHXH-2026-0001',
              expiry_date: '2027-12-31',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
              employee_name: 'Nguyen Van A',
              employee_code: 'NV0001',
              department: 'Nhân sự',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listInsurance({ company_id: 'main' }, `Bearer ${token}`);

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      policy_number: 'BHXH-2026-0001',
      social_insurance_number: 'BHXH-2026-0001',
      employee_name: 'Nguyen Van A',
      effective_date: '2026-01-01',
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('e.archived_at IS NULL'),
      expect.any(Array),
    );
  });

  it('listInsurance scopes employee_id to workforce rollup for company_id=main (J-HRM-04)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurance_records ir')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listInsurance({ company_id: 'main' }, `Bearer ${token}`);

    const listCall = db.query.mock.calls.find(
      ([sql]) => typeof sql === 'string' && sql.includes('FROM public.employee_insurance_records ir'),
    );
    expect(listCall?.[0]).toEqual(expect.stringContaining('ir.employee_id IN'));
    expect(listCall?.[0]).toEqual(expect.stringContaining("custom_fields->>'tenant_id'"));
    expect(listCall?.[1]).toEqual(expect.arrayContaining(['xevn', expect.any(Array)]));
  });

  it('BR-INS-01: listInsurance maps created_at Date from pg driver (J-HRM-04)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurance_records ir')) {
        return {
          rows: [
            {
              id: 'ins1',
              company_id: 'holding',
              employee_id: '16f5e2c5-8fbb-4500-8c82-623950f7055e',
              provider: 'BHXH',
              policy_number: 'BHXH-2026-0001',
              expiry_date: '2027-12-31',
              status: 'active',
              created_at: new Date('2026-03-15T10:00:00.000Z'),
              updated_at: new Date('2026-03-15T10:00:00.000Z'),
              employee_name: 'Nguyen Van A',
              employee_code: 'NV0001',
              department: 'Nhân sự',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.listInsurance({ company_id: 'main' }, `Bearer ${token}`);

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      social_insurance_number: 'BHXH-2026-0001',
      effective_date: '2026-03-15',
      created_at: '2026-03-15T10:00:00.000Z',
      updated_at: '2026-03-15T10:00:00.000Z',
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('updateContract rejects cross-scope row before update (P1-02)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT company_id::text AS company_id FROM public.employee_contracts')) {
        return { rows: [{ company_id: 'other-co' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateContract(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        { contract_type: 'permanent' },
        'main',
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-CON-409' });
  });

  it('updateContract scopes to group rollup when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const contractId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT company_id::text AS company_id FROM public.employee_contracts')) {
        return { rows: [{ company_id: 'holding' }] } as never;
      }
      if (sql.includes('UPDATE public.employee_contracts')) {
        return {
          rows: [
            {
              id: contractId,
              company_id: 'holding',
              employee_id: '11111111-1111-4111-8111-111111111111',
              contract_type: 'permanent',
              start_date: '2024-01-01',
              end_date: '2027-12-31',
              status: 'active',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.updateContract(
      contractId,
      { contract_type: 'permanent' },
      'main',
      `Bearer ${token}`,
    );

    expect(result.contract_type).toBe('permanent');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([null, null, null, null, contractId, expect.any(Array)]),
    );
  });
});
