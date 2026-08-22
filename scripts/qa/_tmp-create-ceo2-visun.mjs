#!/usr/bin/env node
/**
 * Provision portal user ceo2@xe.vn scoped to tenant visun (Công ty TNHH Du lịch Visun).
 * Usage: node scripts/qa/_tmp-create-ceo2-visun.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const requirePg = createRequire(resolve(root, 'apps/api/xbos-api/package.json'));
const { Pool } = requirePg('pg');

const USER_ID = 'ceo2@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const TENANT_ID = 'visun';
const ROLE_CODE = 'subsidiary_ceo';
const DISPLAY_NAME = 'CEO Visun 2';

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

function portalPasswordHash(userId, password) {
  return createHash('sha256')
    .update(`${userId.trim().toLowerCase()}:${password}:xevn-portal-dev`)
    .digest('hex');
}

function poolFromEnv() {
  if (process.env.DATABASE_URL_XBOS?.trim()) {
    return new Pool({ connectionString: process.env.DATABASE_URL_XBOS, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_XBOS ?? 'xevn_xbos',
    ssl: false,
  });
}

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
  loadEnv(resolve(root, 'apps/api/xbos-api/.env'));

  const pool = poolFromEnv();
  const userId = USER_ID.trim().toLowerCase();

  try {
    const reg = await pool.query(
      `SELECT tenant_id, name, short_name, status
       FROM public.xbos_tenant_registry WHERE tenant_id = $1`,
      [TENANT_ID],
    );
    if (!reg.rows[0]) {
      throw new Error(`Tenant ${TENANT_ID} not found — run org foundation seed first`);
    }
    if (String(reg.rows[0].status) !== 'active') {
      throw new Error(`Tenant ${TENANT_ID} is not active`);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_portal_user (
        user_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const hash = portalPasswordHash(userId, PASSWORD);
    await pool.query(
      `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         password_hash = EXCLUDED.password_hash,
         status = 'active',
         updated_at = NOW()`,
      [userId, DISPLAY_NAME, hash],
    );

    await pool.query(
      `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default, status)
       VALUES ($1, $2, $3, true, 'active')
       ON CONFLICT (user_id, tenant_id) DO UPDATE SET
         role_code = EXCLUDED.role_code,
         is_default = true,
         status = 'active',
         updated_at = NOW()`,
      [userId, TENANT_ID, ROLE_CODE],
    );

    // Ensure subsidiary CEO cannot access group tenant (xevn).
    const removed = await pool.query(
      `DELETE FROM public.xbos_user_tenant_membership
       WHERE user_id = $1 AND tenant_id <> $2
       RETURNING tenant_id`,
      [userId, TENANT_ID],
    );

    console.log(JSON.stringify({
      ok: true,
      userId,
      password: PASSWORD,
      tenantId: TENANT_ID,
      tenantName: reg.rows[0].name,
      roleCode: ROLE_CODE,
      companyLabel: 'Công ty TNHH Du lịch Visun',
      hrmOperatingUnitSlug: 'logistics',
      removedOtherMemberships: removed.rows.map((r) => r.tenant_id),
    }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
