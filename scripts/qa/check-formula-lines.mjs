#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const c = createHrmClient();
await c.connect();
const r = await c.query(
  `SELECT expression_json FROM pay_formula_definitions WHERE id='043aa919-eb2b-4e30-81dd-205285664604'`,
);
const lines = r.rows[0]?.expression_json?.lines ?? [];
console.log('formula lines count:', lines.length);
for (const l of lines) {
  console.log(l.component_code, l.source, l.var ?? '', l.amount ?? '', l.expr ? 'expr' : '');
}
const sc = await c.query(
  `SELECT code, formula FROM salary_components WHERE company_id='main' AND code IN ('LUONG_CO_BAN','LUONG_THEO_CONG')`,
);
console.log('\nsalary_components:', sc.rows);
await c.end();
