import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { PayrollService } from './payroll.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('FROM public.payroll_periods') && sql.includes('status =')) {
        return {
          rows: [
            {
              id: 'p1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              period_label: '2026-04',
              start_date: '2026-04-01',
              end_date: '2026-04-30',
              status: 'processing',
              created_by: 'qa',
              processed_at: '2026-04-30T10:00:00.000Z',
              closed_at: null,
              created_at: '2026-04-01T00:00:00.000Z',
              updated_at: '2026-04-30T10:00:00.000Z',
            },
          ],
        } as never;
      }
      if (typeof sql === 'string' && sql.includes('FROM public.payroll_payslips')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    service = new PayrollService(db);
  });

  it('throws deterministic overlap error when period overlaps', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('daterange(start_date, end_date')) {
        return { rows: [{ id: 'existing' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPayrollPeriod({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        period_label: '2026-04',
        start_date: '2026-04-01',
        end_date: '2026-04-30',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-PAY-002' });
  });

  it('throws deterministic process error when not found', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);

    await expect(
      service.processPayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e', '78b8a663-f5e5-4f4d-a020-b8f950ec2037'),
    ).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-404' });
  });

  it('throws deterministic close transition error when period is not processing', async () => {
    const draftRow = {
      id: 'p1',
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      period_label: '2026-04',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      status: 'draft',
      created_by: null,
      processed_at: null,
      closed_at: null,
      created_at: '2026-04-01T00:00:00.000Z',
      updated_at: '2026-04-01T00:00:00.000Z',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.payroll_periods') && sql.includes('WHERE id = $1')) {
        return { rows: [draftRow] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.closePayrollPeriod('f76f23f7-3683-4120-81b7-5126ee997b8e', '78b8a663-f5e5-4f4d-a020-b8f950ec2037'),
    ).rejects.toMatchObject<
      ApiException
    >({ code: 'HRM-PAY-004' });
  });

  it('lists payroll periods with status filter', async () => {
    const result = await service.listPayrollPeriods({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      status: 'processing',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({ id: 'p1', status: 'processing' });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('status = $2'), [
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      'processing',
    ]);
  });

  it('lists payslips with employee_id filter (MOB-BE-05)', async () => {
    await service.listPayslips({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: '11111111-1111-4111-8111-111111111111',
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.employee_id = $2::uuid'),
      expect.arrayContaining(['78b8a663-f5e5-4f4d-a020-b8f950ec2037', '11111111-1111-4111-8111-111111111111']),
    );
  });

  it('lists payslips via workforce scope when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.listPayslips({ company_id: 'main' }, `Bearer ${token}`);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('p.employee_id IN'),
      expect.any(Array),
    );
  });

  it('reconciliation summary uses group rollup for company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockResolvedValue({ rows: [] } as never);
    await service.getPayrollReconciliationSummary('main', `Bearer ${token}`);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  describe('advance request mutations (P1-BND-BE-01)', () => {
    const requestId = '11111111-1111-4111-8111-111111111111';
    const decideBody = { reviewer_name: 'HR Manager' };

    it('approveAdvanceRequest transitions pending to approved with scope parity on holding', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id FROM public.advance_requests')) {
          return { rows: [{ company_id: 'holding' }] } as never;
        }
        if (sql.includes("SET status = 'approved'")) {
          return { rows: [{ id: requestId, company_id: 'holding', status: 'approved' }] } as never;
        }
        return { rows: [] } as never;
      });

      const row = await service.approveAdvanceRequest(
        requestId,
        decideBody,
        'main',
        `Bearer ${token}`,
        'xevn',
      );
      expect(row.status).toBe('approved');
      const updateCall = db.query.mock.calls.find(([sql]) =>
        String(sql).includes("SET status = 'approved'"),
      );
      expect(updateCall).toBeDefined();
    });

    it('rejectAdvanceRequest throws HRM-ADV-404 when request is not pending', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id FROM public.advance_requests')) {
          return { rows: [{ company_id: 'holding' }] } as never;
        }
        if (sql.includes("SET status = 'rejected'")) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.rejectAdvanceRequest(requestId, { ...decideBody, rejected_reason: 'no budget' }, 'main', undefined, 'xevn'),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-ADV-404' });
    });

    it('markAdvanceRequestPaid transitions approved to paid', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id FROM public.advance_requests')) {
          return { rows: [{ company_id: 'holding' }] } as never;
        }
        if (sql.includes("SET status = 'paid'")) {
          return { rows: [{ id: requestId, company_id: 'holding', status: 'paid' }] } as never;
        }
        return { rows: [] } as never;
      });

      const row = await service.markAdvanceRequestPaid(requestId, decideBody, 'main', undefined, 'xevn');
      expect(row.status).toBe('paid');
      const updateCall = db.query.mock.calls.find(([sql]) => String(sql).includes("SET status = 'paid'"));
      expect(updateCall?.[1]).toEqual([requestId]);
    });

    it('markAdvanceRequestPaid throws HRM-ADV-404 when request is not approved', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('CREATE TABLE')) return { rows: [] } as never;
        if (sql.includes('SELECT company_id FROM public.advance_requests')) {
          return { rows: [{ company_id: 'holding' }] } as never;
        }
        if (sql.includes("SET status = 'paid'")) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.markAdvanceRequestPaid(requestId, decideBody, 'main', undefined, 'xevn'),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-ADV-404' });
    });
  });
});
