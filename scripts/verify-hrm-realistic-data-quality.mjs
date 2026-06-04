#!/usr/bin/env node
/**
 * Quality gate: workforce must look like real HR data (not UAT Nguyen / fidelity placeholders).
 * work_item_id: HRM-REALISTIC-DATA-RESET
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { UAT_SEED_TAG } from './lib/uat-workforce.mjs';

loadDeployEnv();

const { Client } = pg;
const MIN_REALISTIC_NAMES = Number(process.env.HRM_REALISTIC_MIN_NAMES ?? 950);
const MIN_CONTRACT_LINKED = Number(process.env.HRM_REALISTIC_MIN_CONTRACT_NAMES ?? 800);

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME || 'xevn_hrm',
    ssl: false,
  });
  await client.connect();

  const tag = UAT_SEED_TAG;
  const emp = await client.query(
    `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE full_name NOT ILIKE 'UAT %'
          AND length(trim(full_name)) >= 8
          AND full_name LIKE '% %'
      )::int AS realistic_names,
      COUNT(*) FILTER (WHERE full_name ILIKE 'UAT %')::int AS uat_placeholder
    FROM public.employees
    WHERE custom_fields->>'uat_seed' = $1
    `,
    [tag],
  );

  const contracts = await client.query(
    `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE contract_type NOT ILIKE '%fidelity%'
          AND contract_type NOT ILIKE '%UAT%'
      )::int AS professional_types,
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM public.employees e
          WHERE e.id = ec.employee_id AND e.full_name IS NOT NULL AND e.full_name <> ''
        )
      )::int AS linked_employee
    FROM public.employee_contracts ec
    `,
  );

  const row = emp.rows[0];
  const ct = contracts.rows[0];
  const checks = [
    {
      id: 'workforce-count',
      ok: row.total >= 1000,
      msg: `employees tag=${tag}: ${row.total} (need >=1000)`,
    },
    {
      id: 'realistic-names',
      ok: row.realistic_names >= MIN_REALISTIC_NAMES,
      msg: `realistic full_name: ${row.realistic_names} (need >=${MIN_REALISTIC_NAMES}), uat_placeholder=${row.uat_placeholder}`,
    },
    {
      id: 'contract-professional-types',
      ok: ct.professional_types >= MIN_CONTRACT_LINKED && ct.total > 0,
      msg: `contracts professional_type: ${ct.professional_types}/${ct.total}`,
    },
    {
      id: 'contract-employee-link',
      ok: ct.linked_employee >= MIN_CONTRACT_LINKED,
      msg: `contracts with employee row: ${ct.linked_employee} (need >=${MIN_CONTRACT_LINKED})`,
    },
  ];

  let fails = 0;
  console.log('verify-hrm-realistic-data-quality\n');
  for (const c of checks) {
    const mark = c.ok ? 'PASS' : 'FAIL';
    if (!c.ok) fails += 1;
    console.log(`${mark}  ${c.id}  ${c.msg}`);
  }
  console.log(`\n=== Summary: ${checks.length - fails}/${checks.length} PASS ===`);
  await client.end();
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
