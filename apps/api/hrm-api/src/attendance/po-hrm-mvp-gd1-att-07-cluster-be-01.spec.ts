import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  allocateSickDayBranches,
  AttSickLeaveFundOrderService,
  normalizeFundSequence,
} from './att-sick-leave-fund-order.service';
import { MVP_LEAVE_BALANCE_TYPES } from './leave-balance.service';

describe('PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01', () => {
  it('ensureSchema ADD att_sick_leave_fund_order + att_sick_leave_day_branch; DENY att_leave_hold', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        sqlLog.push(String(sql));
        return Promise.resolve({ rows: [] });
      }),
    };
    const svc = new AttSickLeaveFundOrderService(db as never);
    await svc.ensureSchema();
    const blob = sqlLog.join('\n');
    expect(blob).toContain('att_sick_leave_fund_order');
    expect(blob).toContain('att_sick_leave_day_branch');
    expect(blob).toContain('uq_att_sick_leave_day_branch_request_date');
    expect(blob).not.toContain('att_leave_hold');
  });

  it('normalizeFundSequence rejects duplicate token', () => {
    expect(() => normalizeFundSequence(['insurance', 'insurance'])).toThrow(
      ApiException,
    );
    try {
      normalizeFundSequence(['insurance', 'insurance']);
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).code).toBe('HRM-ATT-SICK-FUND-ORDER-INVALID');
      expect((e as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('over-BH cap routes post-cap days to company_topup per policy', () => {
    const branches = allocateSickDayBranches({
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      fundSequence: ['insurance', 'unpaid'],
      annualFirstEnabled: false,
      insuranceDayCap: 2,
      overInsuranceAction: 'company_topup',
      typeFlags: { insuranceRegimeFlag: true, companyTopupFlag: true },
    });
    expect(branches).toHaveLength(5);
    expect(branches[0]?.branchCode).toBe('insurance');
    expect(branches[1]?.branchCode).toBe('insurance');
    expect(branches[2]?.branchCode).toBe('company_topup');
    expect(branches[3]?.branchCode).toBe('company_topup');
    expect(branches[4]?.branchCode).toBe('company_topup');
  });

  it('annual-first order assigns annual branch per day', () => {
    const branches = allocateSickDayBranches({
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      fundSequence: ['annual', 'insurance', 'unpaid'],
      annualFirstEnabled: true,
      insuranceDayCap: null,
      overInsuranceAction: 'unpaid',
      typeFlags: { insuranceRegimeFlag: true, companyTopupFlag: false },
    });
    expect(branches.every((b) => b.branchCode === 'annual')).toBe(true);
  });

  it('J-HRM-ATT-06-04 regression — compensatory remains separate MVP panel key', () => {
    AttSickLeaveFundOrderService.assertMvpPanelKeysUnmerged();
    expect(MVP_LEAVE_BALANCE_TYPES).toContain('compensatory');
    expect(MVP_LEAVE_BALANCE_TYPES).not.toContain('sick' as never);
    expect(MVP_LEAVE_BALANCE_TYPES).not.toContain('sick_leave' as never);
  });

  it('putFundOrder requires over_insurance_action when cap set', async () => {
    const svc = new AttSickLeaveFundOrderService({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as never);
    await expect(
      svc.putFundOrder(
        {
          fund_sequence: ['insurance', 'unpaid'],
          insurance_day_cap: 3,
        },
        undefined,
        undefined,
      ),
    ).rejects.toMatchObject({
      code: 'HRM-ATT-SICK-FUND-ORDER-INVALID',
    });
  });

  it('getFundOrder returns program default when no row', async () => {
    const svc = new AttSickLeaveFundOrderService({
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as never);
    const out = await svc.getFundOrder('holding', undefined, 'xevn');
    expect(out.isProgramDefault).toBe(true);
    expect(out.fundSequence).toEqual(['insurance', 'company', 'unpaid']);
  });
});
