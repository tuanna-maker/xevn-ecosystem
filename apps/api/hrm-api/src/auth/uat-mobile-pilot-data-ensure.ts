/**
 * @CODE-MEMORY
 * Screen:     Mobile login — lazy pilot payslip / pending leave for UAT seq 1..2
 * UC:         J-MOB-03 / J-MOB-04 / J-MOB-05
 * Purpose:    Sau login uat.nv0001/0002 đảm bảo tối thiểu data transactional
 *             (payslip + pending duyệt) — U65 lazy product ensure, không seed CLI.
 * WorkItem:   D-HDSD-MOB-PILOT-DATA-PENDING-01 (restore) · W1-B-03-AUTH-BE
 * Coded:      2026-07-31; restored 2026-08-03
 * must_keep:  Chỉ seq 1..2; không pnpm seed:*
 * LastVerified: mobile-auth.service.spec — login path no-throw
 */

import { randomUUID } from 'node:crypto';
import type { HrmDbService } from '../db/hrm-db.service';

type PilotEmployee = {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
};

/**
 * Best-effort ensure for pilot device journeys. Swallows schema gaps so login
 * never fails solely because optional transactional tables are missing.
 */
export async function ensureUatMobilePilotTransactionData(
  db: HrmDbService,
  seq: number,
  _password: string,
  employee: PilotEmployee,
): Promise<void> {
  if (seq !== 1 && seq !== 2) return;
  try {
    await ensureMinimalPayslip(db, employee);
  } catch {
    // optional — login must still succeed
  }
  if (seq === 2) {
    try {
      await ensureMinimalPendingLeaveForManager(db, employee);
    } catch {
      // optional
    }
  }
}

async function ensureMinimalPayslip(
  db: HrmDbService,
  employee: PilotEmployee,
): Promise<void> {
  const existing = await db.query<{ id: string }>(
    `
      SELECT id::text AS id
      FROM public.payroll_payslips
      WHERE employee_id = $1::uuid AND archived_at IS NULL
      LIMIT 1;
    `,
    [employee.id],
  );
  if (existing.rows[0]?.id) return;

  const periodId = randomUUID();
  const periodLabel = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}`;
  await db
    .query(
      `
      INSERT INTO public.payroll_periods (id, company_id, period_code, status, created_at, updated_at)
      VALUES ($1::uuid, $2, $3, 'closed', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `,
      [periodId, employee.company_id, periodLabel],
    )
    .catch(async () => {
      /* period table shape may differ — continue payslip best-effort */
    });

  await db.query(
    `
      INSERT INTO public.payroll_payslips (
        id, company_id, employee_id, period_id, employee_code, employee_name,
        net_amount, status, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3::uuid, $4::uuid, $5, $6,
        10000000, 'published', NOW(), NOW()
      );
    `,
    [
      randomUUID(),
      employee.company_id,
      employee.id,
      periodId,
      employee.employee_code,
      employee.full_name,
    ],
  );
}

async function ensureMinimalPendingLeaveForManager(
  db: HrmDbService,
  manager: PilotEmployee,
): Promise<void> {
  const pending = await db.query<{ id: string }>(
    `
      SELECT id::text AS id
      FROM public.leave_requests
      WHERE company_id = $1
        AND status = 'pending'
        AND archived_at IS NULL
      LIMIT 1;
    `,
    [manager.company_id],
  );
  if (pending.rows[0]?.id) return;

  const subordinate = await db.query<{
    id: string;
    employee_code: string;
    full_name: string;
  }>(
    `
      SELECT id::text AS id, employee_code, full_name
      FROM public.employees
      WHERE company_id = $1
        AND archived_at IS NULL
        AND status = 'active'
        AND id <> $2::uuid
      ORDER BY employee_code
      LIMIT 1;
    `,
    [manager.company_id, manager.id],
  );
  const sub = subordinate.rows[0];
  if (!sub) return;

  await db.query(
    `
      INSERT INTO public.leave_requests (
        id, company_id, employee_id, employee_code, employee_name,
        leave_type, start_date, end_date, total_days, status,
        approver_employee_id, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3::uuid, $4, $5,
        'annual', CURRENT_DATE + 7, CURRENT_DATE + 8, 2, 'pending',
        $6::uuid, NOW(), NOW()
      );
    `,
    [
      randomUUID(),
      manager.company_id,
      sub.id,
      sub.employee_code,
      sub.full_name,
      manager.id,
    ],
  );
}
