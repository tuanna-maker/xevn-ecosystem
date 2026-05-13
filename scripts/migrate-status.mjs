import pg from 'pg';
import { loadMigrateEnv, explainEnvFailure, effectiveDatabaseUrl } from './migrate-env-loader.mjs';

const { Client } = pg;

const target = process.argv[2];
if (!target || (target !== 'hrm' && target !== 'xbos')) {
  throw new Error("Usage: node ./scripts/migrate-status.mjs <hrm|xbos>");
}

const { loaded: loadedEnvFiles } = loadMigrateEnv(target);

const database = target === 'hrm' ? 'xevn_hrm' : 'xevn_xbos';
const databaseUrl = effectiveDatabaseUrl(
  target === 'hrm' ? process.env.DATABASE_URL_HRM : process.env.DATABASE_URL_XBOS,
);

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
if (!databaseUrl) {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    const urlKey = target === 'hrm' ? 'DATABASE_URL_HRM' : 'DATABASE_URL_XBOS';
    const example =
      target === 'hrm' ? 'apps/api/hrm-api/.env.example' : 'apps/api/xbos-api/.env.example';
    const detail = explainEnvFailure(target, { loaded: loadedEnvFiles });
    throw new Error(
      [
        `Missing DB config: need ${urlKey} or all of ${required.join(', ')}. Thiếu: ${missing.join(', ')}.`,
        detail.hint,
        `Tham chiếu: ${example}`,
        `Đã nạp .env: ${detail.loaded_env_files.length ? detail.loaded_env_files.join('; ') : '(không có file nào tồn tại)'}`,
        `Đã kiểm tra: ${JSON.stringify(detail.checked_files)}`,
        `cwd=${detail.cwd} repoRoot=${detail.repoRoot} ${detail.node_version}`,
      ].join(' '),
    );
  }
}

if (
  !databaseUrl &&
  (!process.env.DB_PASSWORD?.trim() || process.env.DB_PASSWORD.trim() === 'replace_me')
) {
  throw new Error(
    'DB_PASSWORD vẫn là replace_me hoặc trống. Thêm mật khẩu thật vào deploy/dev-server/.env.local (gitignore), hoặc biến môi trường XEVN_DB_PASSWORD, hoặc sửa deploy/dev-server/.env.',
  );
}

const client = databaseUrl
  ? new Client({ connectionString: databaseUrl, ssl: false })
  : new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database,
      ssl: false,
    });

async function tableExists(name) {
  const res = await client.query(
    `
      SELECT EXISTS(
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists
    `,
    [name],
  );
  return Boolean(res.rows[0]?.exists);
}

async function main() {
  await client.connect();
  try {
    const schemaMigrationsExists = await tableExists('schema_migrations');
    let appliedMigrations = [];
    if (schemaMigrationsExists) {
      const res = await client.query(
        `SELECT file_name, checksum, applied_at FROM public.schema_migrations ORDER BY file_name`,
      );
      appliedMigrations = res.rows;
    }

    const tablesRes = await client.query(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `,
    );
    const tables = tablesRes.rows.map((r) => r.table_name);

    console.log(
      JSON.stringify(
        {
          success: true,
          target,
          database: databaseUrl ? `(connection string → ${database})` : database,
          schema_migrations_exists: schemaMigrationsExists,
          applied_migrations: appliedMigrations,
          public_tables: tables,
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
