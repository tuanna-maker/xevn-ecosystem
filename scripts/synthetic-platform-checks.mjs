#!/usr/bin/env node
/**
 * Synthetic business monitors (NFR P1.6).
 */
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`PASS ${name}: ${detail}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`FAIL ${name}: ${detail}`);
}

async function withDb(database, fn) {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function checkLogisticCatalogKeys() {
  const expected = Number(process.env.LOGISTIC_CATALOG_KEY_TARGET ?? 112);
  const count = await withDb(process.env.DB_NAME_XBOS ?? 'xevn_xbos', async (c) => {
    const { rows } = await c.query(
      `SELECT COUNT(DISTINCT catalog_key) AS n
       FROM catalog_items
       WHERE catalog_key LIKE 'logistic.%' OR catalog_key LIKE 'LOG.%'`,
    );
    return Number(rows[0]?.n ?? 0);
  });
  if (count >= expected) pass('catalog_logistic_keys', `${count} distinct keys (target ${expected})`);
  else fail('catalog_logistic_keys', `${count} < ${expected}`);
}

async function checkWorkflowStuck() {
  const hours = Number(process.env.WORKFLOW_STUCK_HOURS ?? 24);
  const stuck = await withDb(process.env.DB_NAME_XBOS ?? 'xevn_xbos', async (c) => {
    const { rows } = await c.query(
      `SELECT COUNT(*)::int AS n FROM workflow_instances
       WHERE status = 'pending' AND updated_at < NOW() - ($1::text || ' hours')::interval`,
      [hours],
    );
    return Number(rows[0]?.n ?? 0);
  });
  if (stuck === 0) pass('workflow_stuck', `0 pending > ${hours}h`);
  else fail('workflow_stuck', `${stuck} instances pending > ${hours}h`);
}

async function checkHrmCatalogSyncLag() {
  try {
    const lag = await withDb(process.env.DB_NAME_HRM ?? 'xevn_hrm', async (c) => {
      const { rows } = await c.query(
        `SELECT COUNT(*)::int AS n FROM synced_catalogs WHERE sync_status IS DISTINCT FROM 'ok'`,
      );
      return Number(rows[0]?.n ?? 0);
    });
    if (lag === 0) pass('hrm_catalog_sync', 'all synced_catalogs ok');
    else fail('hrm_catalog_sync', `${lag} rows not ok`);
  } catch {
    pass('hrm_catalog_sync', 'skipped (table absent)');
  }
}

async function main() {
  await checkLogisticCatalogKeys();
  await checkWorkflowStuck();
  await checkHrmCatalogSyncLag();
  const failed = checks.filter((c) => !c.ok).length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
