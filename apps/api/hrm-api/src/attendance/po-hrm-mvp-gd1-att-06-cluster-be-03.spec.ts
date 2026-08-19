import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';

const EMPLOYEE_ID = '0f6e1369-4170-42e3-ad6b-3d04b3ec2edd';
const OT_ID = 'a7925db0-b6d1-4ea8-96c5-74ce9cfe86bc';
const LEDGER_ID = 'f3282edd-9fce-45b6-abc3-636eee6f5da9';

describe('PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-03', () => {
  it('idempotent replay syncs employee_leave_balances from credited ledger SUM', async () => {
    let balanceUpsertDelta: number | undefined;
    const queryMock = jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX') || s.includes('ALTER TABLE')) {
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
      if (s.includes('SUM(credited_days)')) {
        return Promise.resolve({ rows: [{ total: '0.5' }] });
      }
      if (s.includes('att_ot_comp_accrual_ledger') && s.includes('overtime_request_id')) {
        return Promise.resolve({
          rows: [
            {
              id: LEDGER_ID,
              company_id: 'holding',
              overtime_request_id: OT_ID,
              employee_id: EMPLOYEE_ID,
              balance_year: 2026,
              compensation_type: 'compensatory_leave',
              ot_hours: 4,
              hours_per_leave_day: 8,
              credited_days: '0.5',
              ledger_status: 'credited',
              created_at: '',
            },
          ],
        });
      }
      if (s.includes('FROM public.employees') && s.includes('company_id')) {
        return Promise.resolve({ rows: [{ company_id: 'holding' }] });
      }
      if (s.includes('FROM public.employee_leave_balances') && s.includes('entitled_days')) {
        return Promise.resolve({ rows: [] });
      }
      if (s.includes('INSERT INTO public.employee_leave_balances')) {
        balanceUpsertDelta = params?.[4] as number;
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const policySvc = new AttOtCompLeavePolicyService({
      query: queryMock,
      withTransaction: jest.fn(),
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

    expect(out?.idempotent_replay).toBe(true);
    expect(out?.credited_days).toBe(0.5);
    expect(balanceUpsertDelta).toBe(0.5);
  });
});
