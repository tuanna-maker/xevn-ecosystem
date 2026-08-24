#!/usr/bin/env node
/**
 * Sửa pay_period_input_lines kỳ VP HN 05/2026:
 * - BHXH chuẩn hóa (Excel cột ×10)
 * - Xóa LUONG_CO_BAN / LUONG_KPI giả (1đ)
 * - Reset payslip đã process sai (gross ~34M)
 *
 * @CODE-MEMORY-CHANGE 2026-08-24
 * WorkItem: PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01
 * change_mode: FIX
 * What: Idempotent repair — normalize BHXH · drop junk LUONG_CO_BAN/KPI inputs · reset payslips draft
 * Why: Seed Excel + stale process header; pairs with FE per-employee input-lines fetch
 * must_keep: PERIOD_ID a4e896b6-… · VP_HANOI_SEED_TAG · excel_seed source_kind
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';
import { stableUuid } from '../lib/stable-uuid.mjs';
import {
  VP_SHEET_COLUMN_ORDER,
  amountForComponentFromPayrollRow,
  shouldSeedPeriodInput,
} from '../lib/vp-hanoi-payroll-config.mjs';
import { VP_HANOI_COMPANY_ID, VP_HANOI_SEED_TAG } from '../lib/vp-hanoi-seed-constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERIOD_ID = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const PAYROLL_JSON = resolve(
  __dirname,
  '../seed-reports/payroll-vp-hanoi-2026-05/01-employees-payroll.json',
);

loadDeployEnv();
const payrollRows = JSON.parse(readFileSync(PAYROLL_JSON, 'utf8'));
const byCode = new Map(payrollRows.map((r) => [r.employee_code.toUpperCase(), r]));

const client = createHrmClient();
await client.connect();

try {
  await client.query('BEGIN');

  const employees = await client.query(
    `SELECT id::text, employee_code
     FROM public.employees
     WHERE custom_fields->>'seed_tag' = $1
       AND archived_at IS NULL`,
    [VP_HANOI_SEED_TAG],
  );

  let upserts = 0;

  for (const emp of employees.rows) {
    const row = byCode.get(emp.employee_code.toUpperCase());
    if (!row) continue;

    await client.query(
      `DELETE FROM public.pay_period_input_lines
       WHERE period_id = $1::uuid AND employee_id = $2::uuid
         AND component_code = ANY($3::text[])`,
      [PERIOD_ID, emp.id, ['LUONG_CO_BAN', 'LUONG_KPI']],
    );

    for (const code of VP_SHEET_COLUMN_ORDER) {
      const amount = amountForComponentFromPayrollRow(code, row);
      if (!shouldSeedPeriodInput(code, amount)) continue;

      await client.query(
        `DELETE FROM public.pay_period_input_lines
         WHERE period_id = $1::uuid AND employee_id = $2::uuid
           AND component_code = $3 AND source_kind = 'excel_seed'`,
        [PERIOD_ID, emp.id, code],
      );

      const lineId = stableUuid(`${VP_HANOI_SEED_TAG}:period-input:${emp.employee_code}:${code}`);
      await client.query(
        `INSERT INTO public.pay_period_input_lines (
           id, company_id, period_id, employee_id, component_code,
           amount, source_kind, note, updated_at
         ) VALUES (
           $1::uuid, $2, $3::uuid, $4::uuid, $5,
           $6, 'excel_seed', $7, NOW()
         )`,
        [
          lineId,
          VP_HANOI_COMPANY_ID,
          PERIOD_ID,
          emp.id,
          code,
          amount,
          `${VP_HANOI_SEED_TAG}:repair`,
        ],
      );
      upserts++;
    }
  }

  const payslipReset = await client.query(
    `UPDATE public.payroll_payslips
     SET status = 'draft',
         gross_amount = 0,
         deduction_amount = 0,
         net_amount = 0,
         si_employee_amount = NULL,
         si_employer_amount = NULL,
         updated_at = NOW()
     WHERE period_id = $1::uuid
     RETURNING id::text`,
    [PERIOD_ID],
  );

  await client.query(
    `DELETE FROM public.payroll_payslip_lines
     WHERE payslip_id = ANY(
       SELECT id FROM public.payroll_payslips WHERE period_id = $1::uuid
     )`,
    [PERIOD_ID],
  );

  await client.query('COMMIT');

  console.log(
    JSON.stringify(
      {
        ok: true,
        period_id: PERIOD_ID,
        employees_repaired: employees.rowCount,
        input_lines_upserted: upserts,
        payslips_reset: payslipReset.rowCount,
        sample: {
          XE00236_BHXH: amountForComponentFromPayrollRow('KHAU_TRU_BHXH', byCode.get('XE00236')),
          XE00250_BHXH: amountForComponentFromPayrollRow('KHAU_TRU_BHXH', byCode.get('XE00250')),
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
