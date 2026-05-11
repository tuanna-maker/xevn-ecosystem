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
  throw new Error("Usage: node ./scripts/migrate-status.mjs <hrm|xbos>");
}

const database = target === 'hrm' ? 'xevn_hrm' : 'xevn_xbos';

const client = new Client({
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
          database,
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
