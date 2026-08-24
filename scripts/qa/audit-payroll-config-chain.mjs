#!/usr/bin/env node
/**
 * Audit payroll config chain: components → formula → template → period → payslips → lines
 */
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();

const period = (
  await c.query(
    `SELECT id::text, status, period_label, payroll_group_id::text,
            formula_definition_id::text, pay_sheet_template_id::text
     FROM public.payroll_periods WHERE company_id='main'
     ORDER BY start_date DESC LIMIT 1`,
  )
).rows[0];

const components = await c.query(
  `SELECT COUNT(*)::int AS total
   FROM public.salary_components WHERE company_id='main'`,
);

const componentSample = await c.query(
  `SELECT code, name, nature FROM public.salary_components
   WHERE company_id='main' AND code IN ('LUONG_CO_BAN','LUONG_THEO_CONG','PC_XANG_XE','KHAU_TRU_BHXH')
   ORDER BY code`,
);

const formula = await c.query(
  `SELECT id::text, code, status, published_at::text,
          jsonb_typeof(expression_json) AS expr_type,
          expression_json->>'form' AS expr_form
   FROM public.pay_formula_definitions
   WHERE id = $1::uuid`,
  [period.formula_definition_id],
);

const template = await c.query(
  `SELECT t.id::text, t.code, t.name, t.status,
          (SELECT COUNT(*)::int FROM public.pay_sheet_template_lines l WHERE l.template_id=t.id) AS line_count
   FROM public.pay_sheet_templates t WHERE t.id = $1::uuid`,
  [period.pay_sheet_template_id],
);

const templateLines = await c.query(
  `SELECT component_code, display_label, sort_order
   FROM public.pay_sheet_template_lines
   WHERE template_id = $1::uuid
   ORDER BY sort_order LIMIT 12`,
  [period.pay_sheet_template_id],
);

const group = await c.query(
  `SELECT code, name_vi, status,
          jsonb_array_length(match_rule_json->'employee_ids') AS member_count
   FROM public.pay_payroll_group WHERE id = $1::uuid`,
  [period.payroll_group_id],
);

const payslips = await c.query(
  `SELECT e.employee_code, e.full_name,
          e.custom_fields->>'department' AS dept_code,
          ps.gross_amount, ps.net_amount, ps.status AS payslip_status,
          (SELECT COUNT(*)::int FROM public.payroll_payslip_lines pl WHERE pl.payslip_id=ps.id) AS line_count
   FROM public.payroll_payslips ps
   JOIN public.employees e ON e.id = ps.employee_id
   WHERE ps.period_id = $1::uuid
   ORDER BY e.employee_code`,
  [period.id],
);

const cbForEnrolled = await c.query(
  `SELECT e.employee_code,
          MAX(CASE WHEN l.line_type='base' THEN l.amount END) AS cb_base,
          MAX(CASE WHEN l.component_code='allowance_p2' OR l.allowance_code='p2' THEN l.amount END) AS cb_p2
   FROM public.payroll_payslips ps
   JOIN public.employees e ON e.id = ps.employee_id
   LEFT JOIN public.employee_compensation_packages p ON p.employee_id = e.id
   LEFT JOIN public.employee_compensation_lines l ON l.package_id = p.id
   WHERE ps.period_id = $1::uuid
   GROUP BY e.employee_code`,
  [period.id],
);

const periodInputs = await c.query(
  `SELECT COUNT(*)::int AS total,
          COUNT(DISTINCT employee_id)::int AS employees,
          COUNT(*) FILTER (WHERE component_code='LUONG_CO_BAN')::int AS luong_co_ban_rows
   FROM public.pay_period_input_lines
   WHERE period_id = $1::uuid AND archived_at IS NULL`,
  [period.id],
);

const inputSample = await c.query(
  `SELECT e.employee_code, pil.component_code, pil.amount
   FROM public.pay_period_input_lines pil
   JOIN public.employees e ON e.id = pil.employee_id
   WHERE pil.period_id = $1::uuid AND e.employee_code IN ('XE00236','XE00250')
     AND pil.component_code IN ('LUONG_CO_BAN','LUONG_THEO_CONG','PC_XANG_XE')
     AND pil.archived_at IS NULL
   ORDER BY e.employee_code, pil.component_code`,
  [period.id],
);

console.log(
  JSON.stringify(
    {
      period,
      salary_components: components.rows[0],
      component_sample: componentSample.rows,
      formula: formula.rows[0],
      template: template.rows[0],
      template_lines_sample: templateLines.rows,
      payroll_group: group.rows[0],
      payslips,
      cb_for_enrolled: cbForEnrolled.rows,
      period_inputs: periodInputs.rows[0],
      period_input_sample: inputSample.rows,
      diagnosis: {
        config_ok:
          components.rows[0]?.total >= 20 &&
          formula.rows[0]?.status === 'active' &&
          template.rows[0]?.line_count >= 15,
        amounts_zero_because: 'period status=draft + process chưa chạy thành công → payslip gross=0, line_count=0',
        department_ui_gap: 'FE mapPayslipToPayrollRecord hardcodes department:null — cần enrich từ employee',
        delete_not_supported: 'usePayrollBatches deleteRecordMutation throws — API chưa có DELETE payslip',
      },
    },
    null,
    2,
  ),
);

await c.end();
