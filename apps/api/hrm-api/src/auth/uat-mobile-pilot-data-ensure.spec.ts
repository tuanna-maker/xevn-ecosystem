import { ensureUatMobilePilotTransactionData } from './uat-mobile-pilot-data-ensure';

/**
 * Test health — align with restored lazy pilot ensure (payslip + manager pending leave).
 * WorkItem: PO-HRM-MVP-GD1-TEST-HEALTH-BE-01
 */
describe('uat-mobile-pilot-data-ensure', () => {
  it('ensureUatMobilePilotTransactionData inserts payslip for nv0001 when missing', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        sqlLog.push(sql);
        if (sql.includes('FROM public.payroll_payslips') && sql.includes('employee_id')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    };

    await ensureUatMobilePilotTransactionData(db as never, 1, 'xevn-uat-2026', {
      id: empId,
      company_id: 'holding',
      employee_code: 'HLD-0001',
      full_name: 'Nguyễn Văn An',
    });

    expect(sqlLog.some((s) => s.includes('INSERT INTO public.payroll_payslips'))).toBe(true);
    expect(sqlLog.some((s) => s.includes('INSERT INTO public.payroll_periods'))).toBe(true);
  });

  it('ensureUatMobilePilotTransactionData skips payslip when row exists', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (sql.includes('FROM public.payroll_payslips') && sql.includes('employee_id')) {
          return { rows: [{ id: 'ps-existing' }] };
        }
        return { rows: [] };
      }),
    };

    await ensureUatMobilePilotTransactionData(db as never, 1, 'xevn-uat-2026', {
      id: '11111111-1111-4111-8111-111111111111',
      company_id: 'holding',
      employee_code: 'HLD-0001',
      full_name: 'Nguyễn Văn An',
    });

    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.payroll_payslips'),
      expect.anything(),
    );
  });

  it('ensureUatMobilePilotTransactionData ensures manager pending leave for nv0002', async () => {
    const managerId = '22222222-2222-4222-8222-222222222222';
    const subId = '77777777-7777-4777-8777-777777777777';
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        sqlLog.push(sql);
        if (sql.includes('FROM public.payroll_payslips') && sql.includes('employee_id')) {
          return { rows: [{ id: 'ps-ok' }] };
        }
        if (sql.includes('FROM public.leave_requests') && sql.includes("status = 'pending'")) {
          return { rows: [] };
        }
        if (sql.includes('FROM public.employees') && sql.includes('id <>')) {
          return {
            rows: [{ id: subId, employee_code: 'TRS-0007', full_name: 'Sub NV' }],
          };
        }
        return { rows: [] };
      }),
    };

    await ensureUatMobilePilotTransactionData(db as never, 2, 'xevn-uat-2026', {
      id: managerId,
      company_id: 'trsport',
      employee_code: 'TRS-0002',
      full_name: 'Manager NV',
    });

    expect(sqlLog.some((s) => s.includes('INSERT INTO public.leave_requests'))).toBe(true);
  });

  it('ensureUatMobilePilotTransactionData no-op for seq outside pilot lane', async () => {
    const db = { query: jest.fn(async () => ({ rows: [] })) };
    await ensureUatMobilePilotTransactionData(db as never, 42, 'xevn-uat-2026', {
      id: '42424242-4242-4242-8242-424242424242',
      company_id: 'holding',
      employee_code: 'HLD-0042',
      full_name: 'Other',
    });
    expect(db.query).not.toHaveBeenCalled();
  });
});
