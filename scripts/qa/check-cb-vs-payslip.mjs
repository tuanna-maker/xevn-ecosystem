#!/usr/bin/env node
/**
 * So sánh gói C&B (employee_compensation_*) vs phiếu lương (payroll_payslips).
 * Usage: node scripts/qa/check-cb-vs-payslip.mjs [employee_code]
 */
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

const company = 'main';
const employeeCode = process.argv[2]?.trim() || null;

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const summary = await client.query(
  `SELECT
     (SELECT COUNT(*)::int FROM public.employee_compensation_packages p
      WHERE p.company_id = $1) AS packages,
     (SELECT COUNT(DISTINCT p.employee_id)::int FROM public.employee_compensation_packages p
      WHERE p.company_id = $1) AS employees_with_pkg,
     (SELECT COUNT(*)::int FROM public.employee_compensation_lines l
      JOIN public.employee_compensation_packages p ON p.id = l.package_id
      WHERE p.company_id = $1) AS compensation_lines,
     (SELECT COUNT(*)::int FROM public.payroll_payslips ps
      JOIN public.payroll_periods pp ON pp.id = ps.period_id
      WHERE pp.company_id = $1) AS payslips,
     (SELECT COUNT(DISTINCT ps.employee_id)::int FROM public.payroll_payslips ps
      JOIN public.payroll_periods pp ON pp.id = ps.period_id
      WHERE pp.company_id = $1) AS employees_with_payslip`,
  [company],
);

const periods = await client.query(
  `SELECT pp.id::text, pp.status, pp.start_date::text, pp.end_date::text, pp.period_label,
          (SELECT COUNT(*)::int FROM public.payroll_payslips ps WHERE ps.period_id = pp.id) AS payslip_count
   FROM public.payroll_periods pp
   WHERE pp.company_id = $1
   ORDER BY pp.start_date DESC
   LIMIT 10`,
  [company],
);

const gap = await client.query(
  `SELECT e.employee_code, e.full_name, e.id::text AS employee_id,
          p.id::text AS package_id,
          (SELECT COALESCE(SUM(l.amount), 0)::numeric FROM public.employee_compensation_lines l WHERE l.package_id = p.id) AS line_total,
          (SELECT COUNT(*)::int FROM public.payroll_payslips ps WHERE ps.employee_id = e.id) AS payslip_count
   FROM public.employees e
   JOIN public.employee_compensation_packages p ON p.employee_id = e.id AND p.company_id = e.company_id
   WHERE e.company_id = $1
     AND NOT EXISTS (SELECT 1 FROM public.payroll_payslips ps WHERE ps.employee_id = e.id)
   ORDER BY e.employee_code
   LIMIT 20`,
  [company],
);

const cbWithAmounts = await client.query(
  `SELECT e.employee_code,
          MAX(CASE WHEN l.line_type = 'base' THEN l.amount END) AS base_amount,
          COUNT(*) FILTER (WHERE l.line_type = 'allowance') AS allowance_lines
   FROM public.employees e
   JOIN public.employee_compensation_packages p ON p.employee_id = e.id
   JOIN public.employee_compensation_lines l ON l.package_id = p.id
   WHERE e.company_id = $1
   GROUP BY e.employee_code
   ORDER BY e.employee_code
   LIMIT 5`,
  [company],
);

const payslipHolders = await client.query(
  `SELECT e.employee_code, e.full_name, ps.gross_amount, ps.net_amount, ps.status AS payslip_status,
          pp.period_label, pp.status AS period_status
   FROM public.payroll_payslips ps
   JOIN public.employees e ON e.id = ps.employee_id
   JOIN public.payroll_periods pp ON pp.id = ps.period_id
   WHERE pp.company_id = $1
   ORDER BY e.employee_code`,
  [company],
);

let detail = null;
if (employeeCode) {
  const res = await client.query(
    `SELECT e.employee_code, e.full_name, e.id::text AS employee_id,
            p.id::text AS package_id, p.effective_from::text,
            (SELECT json_agg(json_build_object(
               'line_type', l.line_type, 'amount', l.amount,
               'component_code', l.component_code, 'allowance_code', l.allowance_code
             ) ORDER BY l.line_type)
             FROM public.employee_compensation_lines l WHERE l.package_id = p.id) AS lines
     FROM public.employees e
     LEFT JOIN public.employee_compensation_packages p
       ON p.employee_id = e.id AND p.company_id = e.company_id
     WHERE e.company_id = $1 AND e.employee_code = $2`,
    [company, employeeCode],
  );
  const pays = await client.query(
    `SELECT ps.id::text, ps.status, ps.gross_amount, ps.net_amount, ps.deduction_amount,
            pp.start_date::text, pp.end_date::text, pp.status AS period_status, pp.period_label
     FROM public.payroll_payslips ps
     JOIN public.payroll_periods pp ON pp.id = ps.period_id
     JOIN public.employees e ON e.id = ps.employee_id
     WHERE e.employee_code = $1
     ORDER BY pp.start_date DESC`,
    [employeeCode],
  );
  detail = { employee: res.rows[0] ?? null, payslips: pays.rows };
}

console.log(JSON.stringify({
  company,
  summary: summary.rows[0],
  periods: periods.rows,
  cb_sample: cbWithAmounts.rows,
  gap_sample: gap.rows,
  gap_note: 'NV có gói C&B nhưng chưa có payslip (mẫu tối đa 20)',
  payslip_holders: payslipHolders.rows,
  detail,
}, null, 2));

await client.end();
