import { AttActivateEnrollService } from './att-activate-enroll.service';
import {
  buildActivateEnrollIdempotencyKey,
  computeActivateEnrollEntitledDays,
  isLastDayOfMonthInHcm,
  parseViEffectiveDateToIso,
} from './att-activate-enroll.util';

describe('PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01', () => {
  it('ensureSchema ADD att_activate_enroll_ledger + att_shift_assignment; DENY att_leave_hold', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        sqlLog.push(String(sql));
        return Promise.resolve({ rows: [] });
      }),
      withTransaction: jest.fn(),
    };
    const svc = new AttActivateEnrollService(
      db as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await svc.ensureSchema();
    const blob = sqlLog.join('\n');
    expect(blob).toContain('att_activate_enroll_ledger');
    expect(blob).toContain('uq_att_activate_enroll_ledger_idempotency');
    expect(blob).toContain('att_shift_assignment');
    expect(blob).toContain('uq_att_shift_assignment_open_activate_default');
    expect(blob).not.toContain('att_leave_hold');
  });

  it('half-month branch — last day of month floors annual/2', () => {
    expect(isLastDayOfMonthInHcm('2026-08-31')).toBe(true);
    expect(computeActivateEnrollEntitledDays(12, '2026-08-31')).toBe(6);
    expect(computeActivateEnrollEntitledDays(12, '2026-08-15')).toBe(12);
  });

  it('idempotency key stable for same activate triple', () => {
    const a = buildActivateEnrollIdempotencyKey(
      'holding',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '2026-08-31',
    );
    const b = buildActivateEnrollIdempotencyKey(
      'holding',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '2026-08-31',
    );
    expect(a).toBe(b);
    expect(a.length).toBe(64);
  });

  it('parseViEffectiveDateToIso — dd/MM/yyyy', () => {
    expect(parseViEffectiveDateToIso('31/08/2026')).toBe('2026-08-31');
  });

  it('enrollOnActivate skips when ledger idempotency_key exists', async () => {
    const employeeId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (
        s.includes(
          'FROM public.att_activate_enroll_ledger WHERE idempotency_key',
        )
      ) {
        return Promise.resolve({ rows: [{ id: 'ledger-1' }] });
      }
      if (s.includes('FROM public.employees')) {
        return Promise.resolve({
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              custom_fields: {},
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    const db = {
      query: queryMock,
      withTransaction: jest.fn(),
    };
    const svc = new AttActivateEnrollService(
      db as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const out = await svc.enrollOnActivate({
      employeeId,
      companyId: 'holding',
      effectiveDateDisplay: '31/08/2026',
    });
    expect(out.skipped).toBe(true);
    expect(out.enrolled).toBe(false);
    expect(db.withTransaction).not.toHaveBeenCalled();
  });
});
