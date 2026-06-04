#!/usr/bin/env node
/**
 * DELTA-G5-01 — publish 72 HRM catalog keys to xevn_xbos (direct DB, idempotent).
 * work_item_id: P1-U18-DO-B1
 *
 * Usage: node scripts/seed-hrm-xbos-catalog-keys.mjs
 */
import crypto from 'node:crypto';
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { HRM_XBOS_CATALOG_DEFS } from './lib/hrm-xbos-catalog-defs.mjs';

loadDeployEnv();

const { Client } = pg;
const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
const companyId = process.env.HRM_GROUP_CATALOG_COMPANY ?? 'holding';

function checksum(items) {
  const stableItems = [...items]
    .map((item) => {
      const canonical = { code: item.code, label: item.label, status: item.status ?? 'active' };
      if (item.unit && String(item.unit).trim()) canonical.unit = String(item.unit).trim();
      return canonical;
    })
    .sort((a, b) => a.code.localeCompare(b.code));
  const digest = crypto.createHash('sha256').update(JSON.stringify(stableItems)).digest('hex');
  return `sha256:${digest}`;
}

async function publishOne(client, def) {
  const assigned = ['hrm', 'xbos', 'web-portal'];
  const items = def.items.map((i) => ({
    code: i.code,
    label: i.label,
    unit: i.unit ?? null,
    status: i.status ?? 'active',
  }));
  const sum = checksum(items);
  const existing = await client.query(
    `SELECT version, checksum FROM public.config_catalogs
     WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3`,
    [def.key, tenantId, companyId],
  );
  const row = existing.rows[0];
  const version = !row ? 1 : row.checksum === sum ? row.version : row.version + 1;

  await client.query(
    `INSERT INTO public.config_catalogs
       (tenant_id, company_id, catalog_key, name, domain, assigned_systems, version, checksum, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,NOW())
     ON CONFLICT (tenant_id, company_id, catalog_key) DO UPDATE SET
       name = EXCLUDED.name, domain = EXCLUDED.domain, assigned_systems = EXCLUDED.assigned_systems,
       version = EXCLUDED.version, checksum = EXCLUDED.checksum, updated_at = NOW()`,
    [tenantId, companyId, def.key, def.name, def.domain, JSON.stringify(assigned), version, sum],
  );
  await client.query(
    `DELETE FROM public.config_catalog_items WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3`,
    [def.key, tenantId, companyId],
  );
  for (const item of items) {
    await client.query(
      `INSERT INTO public.config_catalog_items (tenant_id, company_id, catalog_key, code, label, unit, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (tenant_id, company_id, catalog_key, code) DO UPDATE SET
         label = EXCLUDED.label, unit = EXCLUDED.unit, status = EXCLUDED.status`,
      [tenantId, companyId, def.key, item.code, item.label, item.unit, item.status],
    );
  }
  return { key: def.key, version, itemCount: items.length };
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.XBOS_DB_NAME || process.env.DB_NAME_XBOS || 'xevn_xbos',
    ssl: false,
  });
  await client.connect();
  const published = [];
  try {
    await client.query('BEGIN');
    for (const def of HRM_XBOS_CATALOG_DEFS) {
      published.push(await publishOne(client, def));
    }
    await client.query('COMMIT');
    const count = await client.query(
      `SELECT COUNT(DISTINCT catalog_key)::int AS c FROM public.config_catalogs
       WHERE tenant_id = $1 AND company_id = $2 AND assigned_systems @> '["hrm"]'::jsonb`,
      [tenantId, companyId],
    );
    console.log(
      JSON.stringify(
        {
          success: true,
          work_item_id: 'P1-U18-DO-B1',
          tenantId,
          companyId,
          defs: HRM_XBOS_CATALOG_DEFS.length,
          published: published.length,
          distinct_hrm_catalog_keys: count.rows[0].c,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
