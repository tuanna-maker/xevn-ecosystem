#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';
loadDeployEnv();
const c = createHrmClient();
await c.connect();
const r = await c.query(
  `SELECT id::text, tenant_id, company_id, status FROM payroll_periods WHERE id = $1::uuid`,
  ['a4e896b6-6b22-4c0f-80e3-0acda5ee2810'],
);
console.log(r.rows[0]);
await c.end();
