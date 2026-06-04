#!/usr/bin/env node
/**
 * Phase 1 — publish logistic catalogs directly to xevn_xbos (bypass API rate limit).
 */
import crypto from 'node:crypto';
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { parseLogisticCatalogDefs } from './lib/parse-logistic-catalog-md.mjs';

loadDeployEnv();

const { Client } = pg;
const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
const companies = (process.env.PHASE1_LOGISTIC_COMPANIES ?? 'holding,trsport,logistics,finance,services')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defs = parseLogisticCatalogDefs();

function checksum(items) {
  return crypto.createHash('sha256').update(JSON.stringify(items)).digest('hex').slice(0, 32);
}

async function publishOne(client, def, companyId) {
  const domain = def.kind === 'workflow' ? 'workflow_definition' : 'logistics';
  const assigned = def.kind === 'workflow' ? ['xbos'] : ['xbos', 'web-portal'];
  const items = [{ code: 'PHASE1_STUB', label: 'Khung Phase 1', status: 'active' }];
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
    [tenantId, companyId, def.key, def.name, domain, JSON.stringify(assigned), version, sum],
  );
  await client.query(
    `DELETE FROM public.config_catalog_items WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3`,
    [def.key, tenantId, companyId],
  );
  await client.query(
    `INSERT INTO public.config_catalog_items (tenant_id, company_id, catalog_key, code, label, unit, status)
     VALUES ($1,$2,$3,$4,$5,NULL,$6)
     ON CONFLICT (tenant_id, company_id, catalog_key, code) DO UPDATE SET
       label = EXCLUDED.label, status = EXCLUDED.status`,
    [tenantId, companyId, def.key, items[0].code, items[0].label, items[0].status],
  );
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
  let ok = 0;
  try {
    await client.query('BEGIN');
    for (const companyId of companies) {
      for (const def of defs) {
        await publishOne(client, def, companyId);
        ok += 1;
      }
    }
    await client.query('COMMIT');
    const count = await client.query(
      `SELECT COUNT(DISTINCT catalog_key)::int AS c FROM public.config_catalogs
       WHERE tenant_id = $1 AND domain IN ('logistics','workflow_definition')`,
      [tenantId],
    );
    console.log(
      JSON.stringify(
        {
          success: true,
          published: ok,
          defs: defs.length,
          companies: companies.length,
          distinct_logistic_catalog_keys: count.rows[0].c,
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
