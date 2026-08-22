#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const requirePg = createRequire(resolve(root, 'apps/api/xbos-api/package.json'));
const { Pool } = requirePg('pg');

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function pool(dbName) {
  if (process.env.DATABASE_URL_XBOS && dbName === 'xbos') {
    return new Pool({ connectionString: process.env.DATABASE_URL_XBOS, ssl: false });
  }
  if (process.env.DATABASE_URL_HRM && dbName === 'hrm') {
    return new Pool({ connectionString: process.env.DATABASE_URL_HRM, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: dbName === 'xbos' ? (process.env.DB_NAME_XBOS ?? 'xevn_xbos') : (process.env.HRM_DB_NAME ?? process.env.DB_NAME_HRM ?? 'xevn_hrm'),
    ssl: false,
  });
}

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
  loadEnv(resolve(root, 'apps/api/xbos-api/.env'));
  loadEnv(resolve(root, 'apps/api/hrm-api/.env'));

  const xbos = pool('xbos');
  const hrm = pool('hrm');

  try {
    const tenants = await xbos.query(`
      SELECT tenant_id, name, short_name, tenant_kind, status
      FROM public.xbos_tenant_registry
      ORDER BY tenant_kind DESC, tenant_id
    `);
    const memberships = await xbos.query(`
      SELECT tenant_id, role_code, COUNT(*)::int AS users
      FROM public.xbos_user_tenant_membership
      WHERE status = 'active'
      GROUP BY tenant_id, role_code
      ORDER BY tenant_id, role_code
    `);

    console.log(JSON.stringify({ tenants: tenants.rows, memberships: memberships.rows }, null, 2));
  } finally {
    await xbos.end();
  }

  try {
    const ous = await hrm.query(`
      SELECT tenant_id, company_slug, company_uuid, display_name
      FROM public.company_slug_map
      ORDER BY company_slug
    `);
    const empByCompany = await hrm.query(`
      SELECT
        company_id,
        COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), '(empty→xevn)') AS emp_tenant_id,
        COUNT(*)::int AS cnt
      FROM public.employees
      GROUP BY 1, 2
      ORDER BY cnt DESC, company_id, emp_tenant_id
    `);
    const empTotal = await hrm.query(`SELECT COUNT(*)::int AS total FROM public.employees`);

    console.log(JSON.stringify({
      operating_units: ous.rows,
      employees_by_partition: empByCompany.rows,
      employees_total: empTotal.rows[0]?.total ?? 0,
    }, null, 2));
  } catch (e) {
    console.log(JSON.stringify({ hrm_error: String(e.message) }));
  } finally {
    await hrm.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
