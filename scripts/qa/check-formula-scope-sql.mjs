#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

loadDeployEnv();
const client = createHrmClient();
await client.connect();

const formulaId = '043aa919-eb2b-4e30-81dd-205285664604';

const r1 = await client.query(
  `SELECT id::text, company_id FROM pay_formula_definitions
   WHERE id = $1::uuid AND status = 'active' AND archived_at IS NULL AND company_id = 'main'`,
  [formulaId],
);
console.log('single main:', r1.rows);

const members = ['holding', 'main', 'trsport', 'logistics', 'xevn-media'];
const r2 = await client.query(
  `SELECT id::text, company_id FROM pay_formula_definitions
   WHERE id = $1::uuid AND status = 'active' AND archived_at IS NULL AND company_id = ANY($2::text[])`,
  [formulaId, members],
);
console.log('any members:', r2.rows);

await client.end();
