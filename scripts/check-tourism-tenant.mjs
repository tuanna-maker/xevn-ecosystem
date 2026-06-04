#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requirePg = createRequire(resolve(root, 'apps/api/hrm-api/package.json'));
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));

function pool(dbName) {
  if (process.env.DATABASE_URL_HRM && dbName.includes('hrm')) {
    return new Pool({ connectionString: process.env.DATABASE_URL_HRM, ssl: false });
  }
  if (process.env.DATABASE_URL_XBOS && dbName.includes('xbos')) {
    return new Pool({ connectionString: process.env.DATABASE_URL_XBOS, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: false,
  });
}

async function main() {
  const hrmPool = pool(process.env.HRM_DB_NAME ?? 'xevn_hrm');
  const hrm = await hrmPool.query(`
    SELECT company_id, COUNT(*)::int AS n FROM public.employees GROUP BY company_id ORDER BY n DESC
  `);
  const tourism = await hrmPool.query(`
    SELECT id, company_id, employee_code, email, full_name, job_title_key
    FROM public.employees
    WHERE email ILIKE '%xe-du-lich%' OR company_id IN ('main', 'xe-du-lich', 'holding')
    ORDER BY company_id, employee_code
    LIMIT 25
  `);
  await hrmPool.end();

  const xbosPool = pool(process.env.DB_NAME_XBOS ?? 'xevn_xbos');
  const xbos = await xbosPool.query(`
    SELECT tenant_id, company_id, code, name, entity_type
    FROM public.xbos_legal_entity
    WHERE company_id = 'xe-du-lich' OR name ILIKE '%Du lịch%' OR name ILIKE '%X.E%'
    ORDER BY tenant_id, company_id
  `).catch((e) => ({ rows: [], err: e.message }));
  const memberships = await xbosPool.query(`
    SELECT tenant_id, company_id, user_id, role_code
    FROM public.xbos_portal_tenant_membership
    WHERE company_id = 'xe-du-lich' OR user_id ILIKE '%xe-du-lich%'
    LIMIT 15
  `).catch(async () => {
    return xbosPool.query(`
      SELECT tenant_id, company_id, user_id, role_code
      FROM public.xbos_tenant_membership
      WHERE company_id = 'xe-du-lich' OR user_id ILIKE '%xe-du-lich%'
      LIMIT 15
    `).catch((e) => ({ rows: [], err: e.message }));
  });
  await xbosPool.end();

  console.log(JSON.stringify({ hrmByCompany: hrm.rows, tourismEmployees: tourism.rows, xbosLegal: xbos.rows, xbosErr: xbos.err, memberships: memberships.rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
