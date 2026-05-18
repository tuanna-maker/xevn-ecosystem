#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadMigrateEnv, effectiveDatabaseUrl } from './migrate-env-loader.mjs';

function createPgClient() {
  const database = process.env.DB_NAME_XBOS?.trim() || process.env.DB_NAME?.trim() || 'xevn_xbos';
  const url =
    effectiveDatabaseUrl(process.env.DATABASE_URL_XBOS) ||
    effectiveDatabaseUrl(process.env.DATABASE_URL);
  if (url) return new pg.Client({ connectionString: url, ssl: false });
  if (process.env.DB_HOST?.trim() && process.env.DB_PORT?.trim() && process.env.DB_USER?.trim()) {
    return new pg.Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database,
      ssl: false,
    });
  }
  return null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const DEFAULT_TENANT =
  process.env.SEED_TENANT_ID?.trim() ||
  process.env.MASTER_TENANT_ID?.trim() ||
  'xevn';

async function main() {
  loadMigrateEnv('xbos');
  const client = createPgClient();
  if (!client) {
    console.warn('⚠ Thiếu cấu hình DB — bỏ qua seed capabilities');
    process.exit(0);
  }

  const samplesPath = resolve(root, 'apps/api/xbos-api/data/raci-capability-samples.json');
  if (!existsSync(samplesPath)) {
    console.error('Missing', samplesPath);
    process.exit(1);
  }
  const samples = JSON.parse(readFileSync(samplesPath, 'utf8'));
  await client.connect();
  try {
    await client.query('BEGIN');
    let n = 0;
    for (const s of samples) {
      const act = await client.query(
        `SELECT id FROM public.raci_activity_catalog
         WHERE tenant_id = $1 AND activity_code = $2
         ORDER BY updated_at DESC LIMIT 1`,
        [DEFAULT_TENANT, s.activity_code],
      );
      if (!act.rows[0]) {
        console.warn('  skip (no activity):', s.activity_code);
        continue;
      }
      await client.query(
        `INSERT INTO public.raci_ecosystem_capability (
          tenant_id, activity_id, module_code, feature_code, permission_code,
          raci_letter_required, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (tenant_id, activity_id, module_code, feature_code) DO UPDATE SET
          permission_code = EXCLUDED.permission_code,
          raci_letter_required = EXCLUDED.raci_letter_required,
          status = EXCLUDED.status`,
        [
          DEFAULT_TENANT,
          act.rows[0].id,
          s.module_code,
          s.feature_code,
          s.permission_code ?? null,
          s.raci_letter_required ?? '*',
          s.status ?? 'active',
        ],
      );
      n += 1;
    }
    await client.query('COMMIT');
    console.log(`✓ ${n} capability mappings (tenant=${DEFAULT_TENANT})`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
