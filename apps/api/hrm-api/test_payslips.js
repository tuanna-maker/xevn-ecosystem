const { Client } = require('pg');
const client = new Client('postgresql://app1:5^S0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/xevn_hrm');
client.connect()
  .then(() => client.query(`
        SELECT
          p.id, p.company_id, p.period_id, p.employee_id, p.employee_code, p.employee_name,
          p.gross_amount::text, p.deduction_amount::text, p.net_amount::text,
          p.currency, p.status, p.formula_definition_id::text AS formula_definition_id,
          p.employee_confirmed_at::text AS employee_confirmed_at,
          p.employee_confirmed_by::text AS employee_confirmed_by,
          p.gtgc_amount::text AS gtgc_amount,
          p.si_employee_amount::text AS si_employee_amount,
          p.si_employer_amount::text AS si_employer_amount,
          p.tax_amount::text AS tax_amount,
          p.is_final_pay,
          p.termination_settlement_id::text AS termination_settlement_id,
          p.payment_status,
          p.published_to_ess,
          p.published_at::text AS published_at,
          p.version,
          p.payroll_group_id::text AS payroll_group_id,
          pg.code AS payroll_group_code,
          pg.name_vi AS payroll_group_name_vi,
          pts.status AS settlement_status,
          pp.period_label,
          pp.start_date::text AS period_start_date,
          pp.end_date::text AS period_end_date
        FROM public.payroll_payslips p
        JOIN public.payroll_periods pp ON pp.id = p.period_id
        LEFT JOIN public.pay_payroll_group pg ON pg.id = p.payroll_group_id
        LEFT JOIN public.pay_termination_settlement pts ON pts.id = p.termination_settlement_id
        WHERE p.company_id = 'main'
        ORDER BY pp.start_date DESC, p.employee_code ASC
        LIMIT 1;
  `))
  .then(res => console.log(res.rows))
  .then(() => client.end())
  .catch(console.error);
