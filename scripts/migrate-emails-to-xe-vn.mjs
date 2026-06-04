#!/usr/bin/env node
/**
 * Đồng bộ email hệ sinh thái XeVN → domain chung @xe.vn (HRM + XBOS portal/membership).
 *
 * Usage: pnpm run seed:migrate:emails-xe-vn
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requirePg = createRequire(resolve(root, 'apps/api/hrm-api/package.json'));
const { Pool } = requirePg('pg');

const DEV_PASSWORD = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const PILOT_PASSWORD = process.env.HRM_MOBILE_PILOT_PASSWORD ?? 'xevn-pilot';

/** old email → new email (@xe.vn) */
const EMAIL_MAP = new Map(
  Object.entries({
    'admin@xe.vn': 'admin@xe.vn',
    'ceo@xe.vn': 'ceo@xe.vn',
    'hr.manager@xe.vn': 'hr.manager@xe.vn',
    'ops.manager@xe.vn': 'ops.manager@xe.vn',
    'ceo@xe-du-lich.vn': 'du-lich.ceo@xe.vn',
    'hr@xe-du-lich.vn': 'du-lich.hr@xe.vn',
    'dieuhanh@xe-du-lich.vn': 'du-lich.dieuhanh@xe.vn',
    'ketoan@xe-du-lich.vn': 'du-lich.ketoan@xe.vn',
    'fleet@xe-du-lich.vn': 'du-lich.fleet@xe.vn',
    'laixe01@xe-du-lich.vn': 'du-lich.laixe01@xe.vn',
    'laixe02@xe-du-lich.vn': 'du-lich.laixe02@xe.vn',
    'laixe03@xe-du-lich.vn': 'du-lich.laixe03@xe.vn',
    'laixe04@xe-du-lich.vn': 'du-lich.laixe04@xe.vn',
    'cs@xe-du-lich.vn': 'du-lich.cs@xe.vn',
    'ceo@xe-vietnam.vn': 'vietnam.ceo@xe.vn',
    'ceo@xe-tmdv.vn': 'tmdv.ceo@xe.vn',
    'ceo@visun.vn': 'visun.ceo@xe.vn',
  }).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()]),
);

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

function portalHash(userId, password) {
  return createHash('sha256').update(`${userId}:${password}:xevn-portal-dev`).digest('hex');
}

function mobileHash(email, password) {
  return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
}

function hrmPool() {
  if (process.env.DATABASE_URL_HRM) {
    return new Pool({ connectionString: process.env.DATABASE_URL_HRM, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  });
}

function xbosPool() {
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

async function migrateHrm(pool) {
  let updated = 0;
  for (const [oldEmail, newEmail] of EMAIL_MAP) {
    const res = await pool.query(
      `UPDATE public.employees
       SET email = $2,
           custom_fields = COALESCE(custom_fields, '{}'::jsonb) || jsonb_build_object('mobile_password_hash', $3::text),
           updated_at = NOW()
       WHERE lower(email) = $1 AND archived_at IS NULL`,
      [oldEmail, newEmail, mobileHash(newEmail, PILOT_PASSWORD)],
    );
    if (res.rowCount) {
      console.log(`  HRM ${oldEmail} → ${newEmail} (${res.rowCount})`);
      updated += res.rowCount;
    }
  }
  const bulk = await pool.query(
    `UPDATE public.employees
     SET email = regexp_replace(email, '@xevn\\.vn$', '@xe.vn')
     WHERE email LIKE '%@xe.vn' AND archived_at IS NULL`,
  );
  if (bulk.rowCount) {
    console.log(`  HRM bulk @xe.vn → @xe.vn (${bulk.rowCount})`);
    updated += bulk.rowCount;
  }
  return updated;
}

async function migrateXbos(pool) {
  let updated = 0;
  for (const [oldId, newId] of EMAIL_MAP) {
    const oldRow = await pool.query(
      `SELECT user_id, display_name FROM public.xbos_portal_user WHERE user_id = $1`,
      [oldId],
    );
    if (oldRow.rows[0]) {
      const display = oldRow.rows[0].display_name;
      await pool.query(
        `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           status = 'active',
           updated_at = NOW()`,
        [newId, display, portalHash(newId, DEV_PASSWORD)],
      );
      const mem = await pool.query(
        `UPDATE public.xbos_user_tenant_membership SET user_id = $2, updated_at = NOW() WHERE user_id = $1`,
        [oldId, newId],
      );
      await pool.query(`DELETE FROM public.xbos_portal_user WHERE user_id = $1`, [oldId]);
      console.log(`  XBOS portal ${oldId} → ${newId} (membership ${mem.rowCount ?? 0})`);
      updated += 1;
    } else {
      const memOnly = await pool.query(
        `UPDATE public.xbos_user_tenant_membership SET user_id = $2, updated_at = NOW() WHERE user_id = $1`,
        [oldId, newId],
      );
      if (memOnly.rowCount) {
        console.log(`  XBOS membership ${oldId} → ${newId} (${memOnly.rowCount})`);
        updated += memOnly.rowCount;
      }
    }
  }
  const bulkMem = await pool.query(
    `UPDATE public.xbos_user_tenant_membership
     SET user_id = regexp_replace(user_id, '@xevn\\.vn$', '@xe.vn'), updated_at = NOW()
     WHERE user_id LIKE '%@xe.vn'`,
  );
  if (bulkMem.rowCount) {
    console.log(`  XBOS membership bulk @xe.vn → @xe.vn (${bulkMem.rowCount})`);
    updated += bulkMem.rowCount;
  }
  return updated;
}

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
  const hrm = hrmPool();
  const xbos = xbosPool();
  try {
    console.log('\n=== Migrate email → @xe.vn ===\nHRM employees:');
    const hrmN = await migrateHrm(hrm);
    console.log('\nXBOS portal / membership:');
    const xbosN = await migrateXbos(xbos);
    console.log(`\nDone. HRM rows: ${hrmN}, XBOS updates: ${xbosN}`);
    console.log('Chạy tiếp: pnpm run seed:tourism:mobile-pilot && cd apps/api/xbos-api && npx ts-node scripts/seed-tenant-ceo-users.ts\n');
  } finally {
    await hrm.end();
    await xbos.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
