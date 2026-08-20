/**
 * WorkItem: PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { assertNoPayGtgcOverrideInBody } from './pay-gtgc-guard';
import { HRM_PAY_GTCG_403, HRM_PAY_GTCG_412 } from './pay-gtgc.constants';
import {
  countEligibleTaxDependents,
  resolvePayGtgcForEmployee,
} from './pay-gtgc-resolver';
import { pickPayGtgcStatutoryCfgAtAsOf } from './pay-gtgc-statutory-cfg';

function mockDb(
  handler: (sql: string, params?: unknown[]) => { rows: unknown[] },
): HrmDbService {
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) =>
      handler(sql, params),
    ),
  } as unknown as HrmDbService;
}

describe('assertNoPayGtgcOverrideInBody', () => {
  it('throws HRM-PAY-GTCG-403 on override keys', () => {
    try {
      assertNoPayGtgcOverrideInBody({ gtgc_amount: 1, dependents_count: 2 });
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      const ex = e as ApiException;
      expect(ex.code).toBe(HRM_PAY_GTCG_403);
    }
  });

  it('allows empty body', () => {
    assertNoPayGtgcOverrideInBody({});
    assertNoPayGtgcOverrideInBody(null);
  });
});

describe('countEligibleTaxDependents', () => {
  it('counts only tax-eligible active window rows', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: '2' }] };
      }
      return { rows: [] };
    });
    const n = await countEligibleTaxDependents(db, {
      employeeId: '11111111-1111-4111-8111-111111111111',
      employeeCompanyId: 'main',
      asOf: '2026-08-31',
    });
    expect(n).toBe(2);
    const sql = (db.query as jest.Mock).mock.calls[0][0] as string;
    expect(sql).toContain('is_tax_dependent = TRUE');
    expect(sql).toContain('archived_at IS NULL');
  });
});

describe('resolvePayGtgcForEmployee', () => {
  const empId = '11111111-1111-4111-8111-111111111111';
  const cfgId = '22222222-2222-4222-8222-222222222222';

  it('returns 412 blocked when no statutory CFG', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'main' }] };
      }
      if (sql.includes('pay_gtgc_statutory_cfg')) {
        return { rows: [] };
      }
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: '0' }] };
      }
      return { rows: [] };
    });
    const r = await resolvePayGtgcForEmployee(db, {
      periodCompanyId: 'main',
      employeeId: empId,
      asOf: '2026-08-31',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe(HRM_PAY_GTCG_412);
    }
  });

  it('computes gtgc_amount_vnd from CFG + eligible count', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM public.employees')) {
        return { rows: [{ company_id: 'main' }] };
      }
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: '1' }] };
      }
      if (sql.includes('pay_gtgc_statutory_cfg') && sql.includes('SELECT')) {
        return {
          rows: [
            {
              id: cfgId,
              company_id: 'main',
              gtgc_self_amount: '11000000',
              gtgc_per_dependent_amount: '4400000',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const r = await resolvePayGtgcForEmployee(db, {
      periodCompanyId: 'main',
      employeeId: empId,
      asOf: '2026-08-31',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dependents_count).toBe(1);
      expect(r.gtgc_amount_vnd).toBe(15_400_000);
    }
  });
});

describe('pickPayGtgcStatutoryCfgAtAsOf', () => {
  it('picks active row at as_of', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('pay_gtgc_statutory_cfg') && sql.includes('SELECT')) {
        return {
          rows: [
            {
              id: 'cfg-1',
              company_id: 'main',
              gtgc_self_amount: '11000000',
              gtgc_per_dependent_amount: '4400000',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const row = await pickPayGtgcStatutoryCfgAtAsOf(db, {
      companyId: 'main',
      asOf: '2026-08-31',
    });
    expect(row?.id).toBe('cfg-1');
  });
});
