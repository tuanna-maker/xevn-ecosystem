import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';
import { loadMigrateEnv, explainEnvFailure, effectiveDatabaseUrl } from './migrate-env-loader.mjs';

const { Client } = pg;

const argv = process.argv.slice(2);
const repairChecksums = argv.includes('--repair-checksums');
const positional = argv.filter((a) => !a.startsWith('-'));
const target = positional[0];

if (!target || (target !== 'hrm' && target !== 'xbos')) {
  throw new Error(
    "Usage: node ./scripts/migrate-apply.mjs <hrm|xbos> [--repair-checksums]\n" +
      '  --repair-checksums  Cập nhật checksum trong schema_migrations khi file .sql đã sửa sau khi apply (chỉ dev/POC).',
  );
}

const { loaded: loadedEnvFiles, repoRoot } = loadMigrateEnv(target);

const database =
  target === 'hrm'
    ? (process.env.DB_NAME_HRM?.trim() || process.env.DB_NAME?.trim() || 'xevn_hrm')
    : (process.env.DB_NAME_XBOS?.trim() || process.env.DB_NAME?.trim() || 'xevn_xbos');
const databaseUrl = effectiveDatabaseUrl(
  target === 'hrm' ? process.env.DATABASE_URL_HRM : process.env.DATABASE_URL_XBOS,
);

/** Không bắt buộc DB_PASSWORD (local trust / socket). Nhóm bắt buộc khi không dùng connection string. */
const requiredCore = ['DB_HOST', 'DB_PORT', 'DB_USER'];
if (!databaseUrl) {
  const missing = requiredCore.filter((k) => !String(process.env[k] ?? '').trim());
  if (missing.length > 0) {
    const urlKey = target === 'hrm' ? 'DATABASE_URL_HRM' : 'DATABASE_URL_XBOS';
    const example =
      target === 'hrm' ? 'apps/api/hrm-api/.env.example' : 'apps/api/xbos-api/.env.example';
    const detail = explainEnvFailure(target, { loaded: loadedEnvFiles });
    throw new Error(
      [
        `Missing DB config: need ${urlKey} or all of ${requiredCore.join(', ')}. Thiếu: ${missing.join(', ')}.`,
        detail.hint,
        `Tham chiếu: ${example}`,
        `Đã nạp .env: ${detail.loaded_env_files.length ? detail.loaded_env_files.join('; ') : '(không có file nào tồn tại)'}`,
        `Đã kiểm tra: ${JSON.stringify(detail.checked_files)}`,
        `cwd=${detail.cwd} repoRoot=${detail.repoRoot} ${detail.node_version}`,
      ].join(' '),
    );
  }
}

function isPocDev() {
  const v = String(process.env.XEVN_POC_DEV ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

if (
  !databaseUrl &&
  !isPocDev() &&
  String(process.env.DB_PASSWORD ?? '').trim() === 'replace_me'
) {
  throw new Error(
    'DB_PASSWORD vẫn là placeholder replace_me. Với server dev/POC: đặt mật khẩu Postgres vào DB_PASSWORD, hoặc bật XEVN_POC_DEV=1 trong deploy/xevn-ecosystem/.env; hoặc XEVN_DB_PASSWORD trên máy.',
  );
}

const migrationsDir = path.join(repoRoot, 'migrations', target);

const client = databaseUrl
  ? new Client({ connectionString: databaseUrl, ssl: false })
  : new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database,
      ssl: false,
    });

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function listMigrationFiles() {
  const entries = await fsp.readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.sql'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

async function wasApplied(fileName, sum) {
  const res = await client.query(
    `SELECT file_name, checksum FROM public.schema_migrations WHERE file_name = $1`,
    [fileName],
  );
  const row = res.rows[0];
  if (!row) return { applied: false, changed: false };
  return { applied: true, changed: row.checksum !== sum };
}

async function applyMigration(fileName) {
  const fullPath = path.join(migrationsDir, fileName);
  const content = await fsp.readFile(fullPath, 'utf8');
  const sum = checksum(content);
  const state = await wasApplied(fileName, sum);

  if (state.applied && !state.changed) {
    return { file: fileName, status: 'skipped' };
  }
  if (state.applied && state.changed) {
    if (repairChecksums) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MIGRATE_REPAIR_CHECKSUM !== 'true') {
        throw new Error(
          `Checksum mismatch for ${fileName}: từ chối --repair-checksums khi NODE_ENV=production (đặt ALLOW_MIGRATE_REPAIR_CHECKSUM=true nếu cố ý).`,
        );
      }
      console.warn(`[migrate] repair checksum only (không chạy lại SQL): ${fileName}`);
      await client.query(
        `UPDATE public.schema_migrations SET checksum = $2, applied_at = NOW() WHERE file_name = $1`,
        [fileName, sum],
      );
      return { file: fileName, status: 'checksum_repaired' };
    }
    throw new Error(
      `Migration checksum mismatch for ${fileName}. File changed after applied; create a new migration file instead, or dev/PoC: node ./scripts/migrate-apply.mjs ${target} --repair-checksums`,
    );
  }

  await client.query(content);
  await client.query(
    `INSERT INTO public.schema_migrations (file_name, checksum) VALUES ($1, $2)`,
    [fileName, sum],
  );
  return { file: fileName, status: 'applied' };
}

async function main() {
  await client.connect();
  try {
    await ensureMigrationsTable();
    const files = await listMigrationFiles();
    const results = [];
    for (const fileName of files) {
      const result = await applyMigration(fileName);
      results.push(result);
    }
    const applied = results.filter((r) => r.status === 'applied').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const repaired = results.filter((r) => r.status === 'checksum_repaired').length;
    console.log(
      JSON.stringify(
        {
          success: true,
          target,
          database: databaseUrl ? `(connection string → ${database})` : database,
          repair_checksums: repairChecksums,
          total_files: files.length,
          applied,
          skipped,
          checksum_repaired: repaired,
          results,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, target, database, error: error.message }, null, 2));
  process.exit(1);
});
