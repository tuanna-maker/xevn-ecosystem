#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';
const empId = 'f7218e5b-0af2-45a3-82b6-08f8cdff496f';

const period = await client.query(
  `SELECT sheet_template_snapshot_json FROM public.payroll_periods WHERE id = $1::uuid`,
  [periodId],
);
const snap = period.rows[0]?.sheet_template_snapshot_json;
const col = snap?.columns?.find((x) => x.component_code === 'LUONG_THEO_CONG');
console.log('snapshot LUONG_THEO_CONG column:', JSON.stringify(col, null, 2));

const formula = await client.query(
  `SELECT expression_json FROM public.pay_formula_definitions WHERE id = '043aa919-eb2b-4e30-81dd-205285664604'`,
);
const lines = formula.rows[0]?.expression_json?.lines ?? [];
const ltc = lines.find((l) => l.component_code === 'LUONG_THEO_CONG');
console.log('formula LUONG_THEO_CONG line:', JSON.stringify(ltc, null, 2));

const periodInput = await client.query(
  `SELECT id::text, amount FROM public.pay_period_input_lines
   WHERE period_id = $1::uuid AND employee_id = $2::uuid AND component_code = 'LUONG_THEO_CONG'`,
  [periodId, empId],
);
console.log('period input:', periodInput.rows);

const sc = await client.query(
  `SELECT code, formula, default_formula_definition_id::text
   FROM public.salary_components WHERE company_id='main' AND code='LUONG_THEO_CONG'`,
);
console.log('salary_component:', sc.rows[0]);

await client.end();
