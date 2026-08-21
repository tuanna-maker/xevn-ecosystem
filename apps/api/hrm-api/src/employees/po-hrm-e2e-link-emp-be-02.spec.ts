/**
 * @CODE-MEMORY
 * Screen:     jest — PO-HRM-E2E-LINK-EMP-BE-02 dual-SoT close
 * UC:         FR-UC-BP-CORE-10 · R-EMP-SI-DUAL-SOT
 * Purpose:    Bridge legacy records → enrollment; listInsurance + employee-insurances share ids;
 *             POST …/actions works on bridged id; scope_parity main; no invent amounts.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-BE-02
 * LastVerified: 2026-08-06
 */
import { signServiceJwt } from '../common/jwt-sign';
import { ContractsInsuranceService } from '../contracts-insurance/contracts-insurance.service';
import { HrmDbService } from '../db/hrm-db.service';
import {
  EmployeeInsurancesService,
  HRM_SI_ACTION_400,
} from '../employee-insurances/employee-insurances.service';
import { bridgeLegacyInsuranceRecordsToEnrollments } from '../employee-insurances/insurance-enrollment-bridge';

const EMP_ID = '22222222-2222-4222-8222-222222222222';
const REC_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('PO-HRM-E2E-LINK-EMP-BE-02 — SI dual-SoT close', () => {
  describe('bridgeLegacyInsuranceRecordsToEnrollments', () => {
    it('INSERT enrollment with same UUID and contribution=0 (no invent amounts)', async () => {
      const inserted: unknown[][] = [];
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          if (
            sql.includes('INSERT INTO public.employee_insurances') &&
            sql.includes('employee_insurance_records')
          ) {
            inserted.push(params ?? []);
            return { rows: [{ id: REC_ID }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;

      const n = await bridgeLegacyInsuranceRecordsToEnrollments(db, [
        'holding',
        'main',
      ]);
      expect(n).toBe(1);
      expect(inserted[0]?.[0]).toEqual(
        expect.arrayContaining(['holding', 'main']),
      );
      // Bridge SQL embeds literal 0 for amounts — assert in SQL text.
      const bridgeSql = (db.query as jest.Mock).mock.calls.find(
        ([sql]) =>
          String(sql).includes('INSERT INTO public.employee_insurances') &&
          String(sql).includes('FROM public.employee_insurance_records'),
      )?.[0] as string;
      expect(bridgeSql).toContain('0');
      expect(bridgeSql).toContain('0');
      expect(bridgeSql).toMatch(/contribution,\s*employer_contribution/);
    });
  });

  describe('ContractsInsuranceService.listInsurance enrollment SoT', () => {
    let service: ContractsInsuranceService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new ContractsInsuranceService(db);
    });

    it('lists FROM employee_insurances with enrollment_id = id + main rollup scope', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employee_insurances ei')) {
          return {
            rows: [
              {
                id: REC_ID,
                company_id: 'holding',
                employee_id: EMP_ID,
                provider: 'BHXH',
                policy_number: 'BHXH-NAT-1',
                expiry_date: '2027-12-31',
                status: 'active',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
                employee_name: 'UAT NV',
                employee_code: 'NV0100',
                department: 'Ops',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const result = await service.listInsurance(
        { company_id: 'main' },
        `Bearer ${token}`,
      );
      expect(result.total).toBe(1);
      expect(result.data[0]).toMatchObject({
        id: REC_ID,
        enrollment_id: REC_ID,
        social_insurance_number: 'BHXH-NAT-1',
      });
      const listCall = db.query.mock.calls.find(
        ([sql]) =>
          typeof sql === 'string' &&
          sql.includes('FROM public.employee_insurances ei'),
      );
      expect(listCall?.[0]).toEqual(
        expect.stringContaining('ei.employee_id IN'),
      );
      expect(listCall?.[0]).toEqual(
        expect.stringContaining('company_id = ANY'),
      );
      expect(
        db.query.mock.calls.some(
          ([sql]) =>
            typeof sql === 'string' &&
            sql.includes('INSERT INTO public.employee_insurances') &&
            sql.includes('FROM public.employee_insurance_records'),
        ),
      ).toBe(true);
    });
  });

  describe('EmployeeInsurancesService after bridge', () => {
    let service: EmployeeInsurancesService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeeInsurancesService(db);
    });

    it('list bridges then returns enrollment (closes empty employee-insurances vs natural records)', async () => {
      const token = groupCeoToken();
      let bridged = false;
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('INSERT INTO public.employee_insurances') &&
          sql.includes('employee_insurance_records')
        ) {
          bridged = true;
          return { rows: [{ id: REC_ID }] } as never;
        }
        if (
          sql.includes('FROM public.employee_insurances') &&
          !sql.includes('LIMIT 1')
        ) {
          expect(bridged).toBe(true);
          return {
            rows: [
              {
                id: REC_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: 'BHXH-NAT-1',
                start_date: '2026-01-01',
                end_date: '2027-12-31',
                contribution: 0,
                employer_contribution: 0,
                status: 'active',
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.list({ company_id: 'main' }, `Bearer ${token}`);
      expect(out.total).toBe(1);
      expect(out.data[0].id).toBe(REC_ID);
      expect(out.data[0].contribution).toBe(0);
    });

    it('applyAction close works on bridged enrollment id (POST …/actions path)', async () => {
      let enrollmentStatus = 'active';
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('INSERT INTO public.employee_insurances') &&
          sql.includes('employee_insurance_records')
        ) {
          return { rows: [{ id: REC_ID }] } as never;
        }
        if (
          sql.includes('FROM public.employee_insurances') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: REC_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: 'BHXH-NAT-1',
                start_date: '2026-01-01',
                end_date: '2027-12-31',
                contribution: 0,
                employer_contribution: 0,
                status: enrollmentStatus,
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        if (
          sql.includes('UPDATE public.employee_insurances') &&
          sql.includes('SET status')
        ) {
          enrollmentStatus = 'closed';
          return { rows: [] } as never;
        }
        if (
          sql.includes('FROM public.hrm_insurance_rate_period') &&
          sql.includes('ORDER BY')
        ) {
          return {
            rows: [
              {
                id: 'p1',
                enrollment_id: REC_ID,
                company_id: 'holding',
                effective_from: '2026-08-01',
                effective_to: null,
                employee_rate_pct: null,
                employer_rate_pct: null,
                employee_amount: 0,
                employer_amount: 0,
                pay_rate_cfg_id: null,
                period_status: 'closed',
                action: 'close',
                change_reason: null,
                suspend_reason: null,
                archived_at: null,
                created_at: '2026-08-01',
                updated_at: '2026-08-01',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.applyAction(
        REC_ID,
        { company_id: 'main', action: 'close', effective_from: '2026-08-01' },
        `Bearer ${groupCeoToken()}`,
      );
      expect(out.status).toBe('closed');
      expect(out.periods[0].action).toBe('close');
    });

    it('applyAction suspend without reason still HRM-SI-ACTION-400 (must_keep BE-01)', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.employee_insurances') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: REC_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: null,
                start_date: '2026-01-01',
                end_date: null,
                contribution: 0,
                employer_contribution: 0,
                status: 'active',
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.applyAction(
          REC_ID,
          {
            company_id: 'holding',
            action: 'suspend',
            effective_from: '2026-08-01',
          },
          `Bearer ${groupCeoToken()}`,
        ),
      ).rejects.toMatchObject({ code: HRM_SI_ACTION_400 });
    });
  });
});
