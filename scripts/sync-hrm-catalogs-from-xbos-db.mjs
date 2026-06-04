#!/usr/bin/env node
/**
 * Sync XBOS config_catalogs → HRM synced_catalogs (DB path when HRM XBOS_API_URL misconfigured).
 * work_item_id: P1-U18-DO-B1 · DELTA-G5-05
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { HRM_XBOS_CATALOG_DEFS } from './lib/hrm-xbos-catalog-defs.mjs';

loadDeployEnv();

const { Client } = pg;
const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
const companyId = process.env.HRM_GROUP_CATALOG_COMPANY ?? 'holding';
const keys = new Set(HRM_XBOS_CATALOG_DEFS.map((d) => d.key));

async function main() {
  const xbos = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.XBOS_DB_NAME || 'xevn_xbos',
    ssl: false,
  });
  const hrm = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME || 'xevn_hrm',
    ssl: false,
  });
  await xbos.connect();
  await hrm.connect();

  const catalogs = await xbos.query(
    `SELECT catalog_key, name, domain, assigned_systems, version, checksum, updated_at
     FROM public.config_catalogs
     WHERE tenant_id = $1 AND company_id = $2 AND assigned_systems @> '["hrm"]'::jsonb
     ORDER BY catalog_key`,
    [tenantId, companyId],
  );

  let synced = 0;
  try {
    await hrm.query('BEGIN');
    for (const row of catalogs.rows) {
      if (!keys.has(row.catalog_key) && catalogs.rows.length >= 72) {
        // still sync all hrm-assigned keys from xbos
      }
      const items = await xbos.query(
        `SELECT code, label, unit, status FROM public.config_catalog_items
         WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 ORDER BY code`,
        [tenantId, companyId, row.catalog_key],
      );
      const payload = {
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId,
        companyId,
        key: row.catalog_key,
        name: row.name,
        domain: row.domain,
        assignedTo: row.assigned_systems,
        version: row.version,
        checksum: row.checksum,
        updatedAt: row.updated_at,
        items: items.rows,
      };
      const payloadChecksum = Buffer.from(JSON.stringify(payload)).toString('base64');
      await hrm.query(
        `INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
         VALUES ($1, $2, $3, 'xbos', $4::jsonb, $5, $6, NOW())
         ON CONFLICT (tenant_id, company_id, catalog_key) DO UPDATE SET
           payload = EXCLUDED.payload,
           version = EXCLUDED.version,
           checksum = EXCLUDED.checksum,
           synced_at = NOW()`,
        [tenantId, companyId, row.catalog_key, JSON.stringify(payload), row.version, payloadChecksum],
      );
      synced += 1;
    }
    await hrm.query('COMMIT');
    const count = await hrm.query(
      `SELECT COUNT(DISTINCT catalog_key)::int AS c FROM public.synced_catalogs WHERE tenant_id = $1 AND company_id = $2`,
      [tenantId, companyId],
    );
    console.log(
      JSON.stringify(
        {
          success: true,
          work_item_id: 'P1-U18-DO-B1',
          xbos_hrm_keys: catalogs.rows.length,
          synced_rows: synced,
          distinct_synced_catalog_keys: count.rows[0].c,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    await hrm.query('ROLLBACK');
    console.error(e);
    process.exit(1);
  } finally {
    await xbos.end();
    await hrm.end();
  }
}

main();
