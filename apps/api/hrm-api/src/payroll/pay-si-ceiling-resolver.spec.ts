/**
 * WorkItem: PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_SET_SI_412_MISSING } from '../settings/settings-defaults.constants';
import { assertNoPaySiOverrideInBody } from './pay-si-ceiling-guard';
import { HRM_PAY_SI_403 } from './pay-si-ceiling.constants';
import {
  applyPaySiCeilingForEmployee,
  sumMergedInsuranceBaseFromLines,
} from './pay-si-ceiling-resolver';

function mockDb(
  handler: (sql: string, params?: unknown[]) => { rows: unknown[] },
): HrmDbService {
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) =>
      handler(sql, params),
    ),
  } as unknown as HrmDbService;
}

describe('assertNoPaySiOverrideInBody', () => {
  it('throws HRM-PAY-SI-403 on override keys', () => {
    try {
      assertNoPaySiOverrideInBody({ si_employee_amount: 1, ceiling_amount: 2 });
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      const ex = e as ApiException;
      expect(ex.code).toBe(HRM_PAY_SI_403);
    }
  });

  it('allows empty body', () => {
    assertNoPaySiOverrideInBody({});
    assertNoPaySiOverrideInBody(null);
  });
});

describe('sumMergedInsuranceBaseFromLines', () => {
  it('sums only is_insurance_base earning lines (merged once)', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('salary_components')) {
        return {
          rows: [
            { code: 'luong_co_ban', is_insurance_base: true },
            { code: 'phu_cap_an', is_insurance_base: false },
          ],
        };
      }
      return { rows: [] };
    });
    const base = await sumMergedInsuranceBaseFromLines(db, {
      companyId: 'main',
      lines: [
        {
          component_code: 'LUONG_CO_BAN',
          amount: 10_000_000,
          sign: 'earning',
        } as never,
        {
          component_code: 'PHU_CAP_AN',
          amount: 2_000_000,
          sign: 'earning',
        } as never,
        {
          component_code: 'LUONG_CO_BAN',
          amount: 500_000,
          sign: 'deduction',
        } as never,
      ],
    });
    expect(base).toBe(10_000_000);
  });
});

describe('applyPaySiCeilingForEmployee', () => {
  it('applies min(base, ceiling) once per enrolled type — not per segment', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('salary_components')) {
        return { rows: [{ code: 'luong_co_ban', is_insurance_base: true }] };
      }
      if (sql.includes('employee_insurances')) {
        return { rows: [{ type_key: 'bhxh' }] };
      }
      if (sql.includes('pay_insurance_rate_cfg')) {
        return {
          rows: [
            {
              id: 'cfg-1',
              employee_rate_pct: 8,
              employer_rate_pct: 17.5,
              ceiling_amount: 9_000_000,
            },
          ],
        };
      }
      return { rows: [] };
    });
    const r = await applyPaySiCeilingForEmployee(db, {
      periodCompanyId: 'main',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      employeeId: '11111111-1111-4111-8111-111111111111',
      lines: [
        {
          component_code: 'LUONG_CO_BAN',
          amount: 12_000_000,
          sign: 'earning',
        } as never,
      ],
      failOnMissingCfg: false,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.merged_insurance_base_vnd).toBe(12_000_000);
    expect(r.si_employee_amount_vnd).toBe(720_000);
    expect(r.si_employer_amount_vnd).toBe(1_575_000);
  });

  it('returns HRM-SET-SI-412-MISSING when CFG absent for enrolled type', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('salary_components')) {
        return { rows: [{ code: 'luong_co_ban', is_insurance_base: true }] };
      }
      if (sql.includes('employee_insurances')) {
        return { rows: [{ type_key: 'bhxh' }] };
      }
      if (sql.includes('pay_insurance_rate_cfg')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const r = await applyPaySiCeilingForEmployee(db, {
      periodCompanyId: 'main',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-31',
      employeeId: '11111111-1111-4111-8111-111111111111',
      lines: [
        {
          component_code: 'LUONG_CO_BAN',
          amount: 5_000_000,
          sign: 'earning',
        } as never,
      ],
      failOnMissingCfg: false,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe(HRM_SET_SI_412_MISSING);
  });

  it('throws 412 when failOnMissingCfg and CFG missing', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('salary_components')) {
        return { rows: [{ code: 'luong_co_ban', is_insurance_base: true }] };
      }
      if (sql.includes('employee_insurances')) {
        return { rows: [{ type_key: 'bhxh' }] };
      }
      return { rows: [] };
    });
    await expect(
      applyPaySiCeilingForEmployee(db, {
        periodCompanyId: 'main',
        periodStart: '2026-08-01',
        periodEnd: '2026-08-31',
        employeeId: '11111111-1111-4111-8111-111111111111',
        lines: [
          {
            component_code: 'LUONG_CO_BAN',
            amount: 5_000_000,
            sign: 'earning',
          } as never,
        ],
        failOnMissingCfg: true,
      }),
    ).rejects.toMatchObject({ code: HRM_SET_SI_412_MISSING });
  });
});
