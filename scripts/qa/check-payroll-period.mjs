#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodRes = await client.query(
  `SELECT id::text, status, period_label, start_date::text, end_date::text,
          payroll_group_id::text, formula_definition_id::text, pay_sheet_template_id::text
   FROM public.payroll_periods
   WHERE company_id = 'main'
   ORDER BY start_date DESC
   LIMIT 1`,
);

const period = periodRes.rows[0];
if (!period) {
  console.log(JSON.stringify({ error: 'no period' }, null, 2));
  await client.end();
  process.exit(0);
}

const payslips = await client.query(
  `SELECT e.employee_code, e.full_name, ps.id::text AS payslip_id,
          ps.gross_amount, ps.net_amount, ps.deduction_amount, ps.status
   FROM public.payroll_payslips ps
   JOIN public.employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid
   ORDER BY e.employee_code`,
  [period.id],
);

const payslipLines = await client.query(
  `SELECT e.employee_code, pl.component_code, pl.amount, pl.source_tier
   FROM public.payroll_payslip_lines pl
   JOIN public.payroll_payslips ps ON ps.id = pl.payslip_id
   JOIN public.employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid
   ORDER BY e.employee_code, pl.component_code
   LIMIT 40`,
  [period.id],
);

const groupInfo = await client.query(
  `SELECT code, name_vi, match_rule_json, status
   FROM public.pay_payroll_group
   WHERE id = $1::uuid`,
  [period.payroll_group_id],
);

const timesheetBind = await client.query(
  `SELECT id::text, timesheet_header_id::text, transfer_kind, bound_at::text
   FROM public.pay_period_timesheet_bind
   WHERE payroll_period_id = $1::uuid`,
  [period.id],
);

const periodInputs = await client.query(
  `SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE amount IS NOT NULL AND amount <> 0)::int AS nonzero
   FROM public.pay_period_input_lines
   WHERE period_id = $1::uuid`,
  [period.id],
);

const formula = await client.query(
  `SELECT code, status, published_at::text
   FROM public.pay_formula_definitions
   WHERE id = $1::uuid`,
  [period.formula_definition_id],
);

const empMap = await client.query(
  `SELECT employee_code, id::text FROM public.employees
   WHERE id IN (
     SELECT employee_id FROM public.payroll_payslips WHERE period_id = $1::uuid
   ) OR id = 'f7218e5b-0af2-45a3-82b6-08f8cdff496f'::uuid`,
  [period.id],
);

const cbForPayslipEmployees = await client.query(
  `SELECT e.employee_code,
          MAX(CASE WHEN l.line_type = 'base' THEN l.amount END) AS base_amount,
          COUNT(*) FILTER (WHERE l.line_type = 'allowance') AS allowance_lines
   FROM public.payroll_payslips ps
   JOIN public.employees e ON e.id = ps.employee_id
   LEFT JOIN public.employee_compensation_packages p ON p.employee_id = e.id
   LEFT JOIN public.employee_compensation_lines l ON l.package_id = p.id
   WHERE ps.period_id = $1::uuid
   GROUP BY e.employee_code
   ORDER BY e.employee_code`,
  [period.id],
);

console.log(
  JSON.stringify(
    {
      period,
      formula: formula.rows[0] ?? null,
      payslips: payslips.rows,
      payslip_lines_sample: payslipLines.rows,
      payroll_group: groupInfo.rows[0] ?? null,
      timesheet_bind: timesheetBind.rows,
      period_inputs: periodInputs.rows[0],
      cb_for_payslip_employees: cbForPayslipEmployees.rows,
      payslip_employee_ids: empMap.rows,
      note: 'Payslip amounts stay 0 until POST processPayrollPeriod runs formula evaluator',
    },
    null,
    2,
  ),
);

await client.end();
