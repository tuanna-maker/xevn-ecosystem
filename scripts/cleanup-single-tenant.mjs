import pg from 'pg';

const { Client } = pg;
const SINGLE_TENANT_ID = process.env.SINGLE_TENANT_ID ?? 'xevn';

function getBaseConfig(database) {
  return {
    host: process.env.DB_HOST ?? '113.20.107.184',
    port: Number(process.env.DB_PORT ?? '6432'),
    user: process.env.DB_USER ?? 'app1',
    password: process.env.DB_PASSWORD ?? '',
    database,
    ssl: false,
  };
}

async function cleanupDatabase(database) {
  const client = new Client(getBaseConfig(database));
  await client.connect();
  const tablesRes = await client.query(`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'tenant_id'
    ORDER BY table_name;
  `);

  const report = [];
  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const sql = `DELETE FROM public.${tableName} WHERE tenant_id <> $1`;
    const result = await client.query(sql, [SINGLE_TENANT_ID]);
    report.push({ table: tableName, deleted: result.rowCount ?? 0 });
  }

  await client.end();
  return report;
}

async function main() {
  if (process.env.ALLOW_CROSS_TENANT_PURGE !== 'true') {
    throw new Error(
      'Blocked destructive cleanup. Set ALLOW_CROSS_TENANT_PURGE=true only for explicit one-time tenant purge.',
    );
  }
  const dbs = ['xevn_hrm', 'xevn_xbos'];
  const output = {};
  for (const db of dbs) {
    output[db] = await cleanupDatabase(db);
  }
  console.log(JSON.stringify({ tenant: SINGLE_TENANT_ID, report: output }, null, 2));
}

main().catch((error) => {
  console.error('[cleanup-single-tenant] failed:', error?.message ?? error);
  process.exit(1);
});

