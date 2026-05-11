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

async function verifyDatabase(database) {
  const client = new Client(getBaseConfig(database));
  await client.connect();
  const tableRes = await client.query(`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'tenant_id'
    ORDER BY table_name;
  `);
  const report = [];
  for (const row of tableRes.rows) {
    const table = row.table_name;
    const countRes = await client.query(`SELECT COUNT(*)::int AS c FROM public.${table} WHERE tenant_id <> $1`, [
      SINGLE_TENANT_ID,
    ]);
    report.push({ table, nonXevnRows: countRes.rows[0]?.c ?? 0 });
  }
  await client.end();
  return report;
}

async function main() {
  const dbs = ['xevn_hrm', 'xevn_xbos'];
  const summary = {};
  for (const db of dbs) {
    summary[db] = await verifyDatabase(db);
  }
  console.log(JSON.stringify({ tenant: SINGLE_TENANT_ID, verification: summary }, null, 2));
}

main().catch((error) => {
  console.error('[verify-single-tenant] failed:', error?.message ?? error);
  process.exit(1);
});

