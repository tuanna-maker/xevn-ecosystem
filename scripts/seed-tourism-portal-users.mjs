#!/usr/bin/env node
/**
 * XBOS portal auth for CT Du lịch HRBP (and related tourism portal personas).
 * Fixes portal 401 when only mobile pilot / HRM employees exist.
 *
 * Usage: pnpm run seed:tourism:portal-users
 * Prerequisite: tenant xe-du-lich in xbos_tenant_registry (seed:org-foundation / seed:tenant-ceos)
 * Portal password (dev): Xevn@2026 — same as auth.service DEV_PASSWORD
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requirePg = createRequire(resolve(root, 'apps/api/xbos-api/package.json'));
const { Pool } = requirePg('pg');

const PORTAL_DEV_PASSWORD = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const TOURISM_PORTAL_USERS = [
  {
    userId: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    roleCode: 'subsidiary_ceo',
    displayName: 'CEO Du lịch XeVN',
    companyId: 'main',
  },
  {
    userId: 'du-lich.hr@xe.vn',
    tenantId: 'xe-du-lich',
    roleCode: 'HRBP_MANAGER',
    displayName: 'Trần Thị Hương — HR Du lịch',
    companyId: 'main',
  },
];

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

function portalPasswordHash(userId, password) {
  return createHash('sha256')
    .update(`${userId.trim().toLowerCase()}:${password}:xevn-portal-dev`)
    .digest('hex');
}

function poolFromEnv() {
  if (process.env.DATABASE_URL_XBOS) {
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
  const pool = poolFromEnv();

  try {
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

    for (const u of TOURISM_PORTAL_USERS) {
      const userId = u.userId.trim().toLowerCase();
      const reg = await pool.query(`SELECT 1 FROM public.xbos_tenant_registry WHERE tenant_id = $1`, [u.tenantId]);
      if (!reg.rows[0]) {
        console.warn(`  skip ${userId}: tenant ${u.tenantId} not in registry — run org foundation seed first`);
        continue;
      }

      const hash = portalPasswordHash(userId, PORTAL_DEV_PASSWORD);
      await pool.query(
        `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           status = 'active',
           updated_at = NOW()`,
        [userId, u.displayName, hash],
      );

      await pool.query(
        `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default, status)
         VALUES ($1, $2, $3, true, 'active')
         ON CONFLICT (user_id, tenant_id) DO UPDATE SET
           role_code = EXCLUDED.role_code,
           is_default = true,
           status = 'active',
           updated_at = NOW()`,
        [userId, u.tenantId, u.roleCode],
      );

      console.log(`  ✓ portal ${userId} → ${u.tenantId} (${u.roleCode})`);
    }

    console.log('\n=== Portal Du lịch (dev) ===');
    console.log(`  Email:     du-lich.ceo@xe.vn | du-lich.hr@xe.vn`);
    console.log(`  Password:  ${PORTAL_DEV_PASSWORD}`);
    console.log(`  Tenant:    xe-du-lich`);
    console.log(`  Company:   main`);
    console.log(`  Mobile:    xevn-pilot (HRM mobile — seed:tourism:mobile-pilot)\n`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
