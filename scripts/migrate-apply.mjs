import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const { Client } = pg;

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const target = process.argv[2];
if (!target || (target !== 'hrm' && target !== 'xbos')) {
  throw new Error("Usage: node ./scripts/migrate-apply.mjs <hrm|xbos>");
}

const database = target === 'hrm' ? 'xevn_hrm' : 'xevn_xbos';
const migrationsDir = path.resolve(process.cwd(), 'migrations', target);

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
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
  const content = await fs.readFile(fullPath, 'utf8');
  const sum = checksum(content);
  const state = await wasApplied(fileName, sum);

  if (state.applied && !state.changed) {
    return { file: fileName, status: 'skipped' };
  }
  if (state.applied && state.changed) {
    throw new Error(
      `Migration checksum mismatch for ${fileName}. File changed after applied; create a new migration file instead.`,
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
    console.log(
      JSON.stringify(
        {
          success: true,
          target,
          database,
          total_files: files.length,
          applied,
          skipped,
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
