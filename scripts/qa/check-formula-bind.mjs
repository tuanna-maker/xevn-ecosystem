#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const periodId = 'a4e896b6-6b22-4c0f-80e3-0acda5ee2810';

const r = await client.query(
  `SELECT p.id::text, p.company_id, p.formula_definition_id::text,
          f.id::text AS fid, f.company_id AS f_company, f.code, f.status, f.archived_at::text
   FROM public.payroll_periods p
   LEFT JOIN public.pay_formula_definitions f ON f.id = p.formula_definition_id
   WHERE p.id = $1::uuid`,
  [periodId],
);
console.log('period+formula:', JSON.stringify(r.rows[0], null, 2));

const all = await client.query(
  `SELECT id::text, company_id, code, version, status, archived_at::text
   FROM public.pay_formula_definitions
   WHERE archived_at IS NULL
   ORDER BY code, version`,
);
console.log('all formulas:', JSON.stringify(all.rows, null, 2));

await client.end();
