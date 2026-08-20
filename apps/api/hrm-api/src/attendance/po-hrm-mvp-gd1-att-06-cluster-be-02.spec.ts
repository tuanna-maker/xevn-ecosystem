import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';

const EMPLOYEE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-02', () => {
  it('accrueOnApprovedOvertime upserts employee_leave_balances on employee.company_id partition', async () => {
    let balanceUpsertCompanyId: string | undefined;
    const queryMock = jest
      .fn()
      .mockImplementation((sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (s.includes('CREATE TABLE')) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('att_ot_comp_leave_policy')) {
          return Promise.resolve({
            rows: [
              {
                id: 'p1',
                company_id: 'holding',
                mode_enabled: true,
                hours_per_leave_day: 8,
                comp_balance_key: 'compensatory',
                maps_comp_codes: null,
                status: 'active',
                effective_from: null,
                archived_at: null,
                created_at: '',
                updated_at: '',
              },
            ],
          });
        }
        if (
          s.includes('att_ot_comp_accrual_ledger') &&
          s.includes('ledger_status')
        ) {
          return Promise.resolve({ rows: [] });
        }
        if (s.includes('FROM public.employees') && s.includes('company_id')) {
          return Promise.resolve({ rows: [{ company_id: HOLDING_UUID }] });
        }
        return Promise.resolve({ rows: [] });
      });

    const withTransaction = jest
      .fn()
      .mockImplementation(
        async (fn: (q: typeof queryMock) => Promise<unknown>) => {
          const txQuery = jest
            .fn()
            .mockImplementation((sql: string, params?: unknown[]) => {
              const s = String(sql);
              if (s.includes('INSERT INTO public.att_ot_comp_accrual_ledger')) {
                return Promise.resolve({ rows: [] });
              }
              if (s.includes('INSERT INTO public.employee_leave_balances')) {
                balanceUpsertCompanyId = params?.[0] as string;
                return Promise.resolve({ rows: [] });
              }
              return Promise.resolve({ rows: [] });
            });
          return fn(txQuery);
        },
      );

    const policySvc = new AttOtCompLeavePolicyService({
      query: queryMock,
      withTransaction,
    } as never);
    await policySvc.ensureSchema();

    const out = await policySvc.accrueOnApprovedOvertime({
      id: OT_ID,
      company_id: 'holding',
      employee_id: EMPLOYEE_ID,
      status: 'approved',
      total_hours: 4,
      compensation_type: 'compensatory_leave',
      overtime_date: '2026-08-01',
    });

    expect(out?.credited_days).toBe(0.5);
    expect(balanceUpsertCompanyId).toBe(HOLDING_UUID);
    expect(balanceUpsertCompanyId).not.toBe('holding');
  });
});
