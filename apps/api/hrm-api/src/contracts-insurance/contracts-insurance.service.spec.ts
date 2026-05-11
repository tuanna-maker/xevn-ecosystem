import { ApiException } from '../common/api.exception';
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
});
