import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || 'xevn_hrm',
  ssl: false,
});

async function main() {
  await client.connect();
  const companies = ['holding', 'trsport', 'logistics', 'finance', 'services'];
  const byCompany = await client.query(
    `
      SELECT company_id, COUNT(*)::int AS total
      FROM public.employees
      WHERE company_id = ANY($1::text[])
      GROUP BY company_id
      ORDER BY company_id
    `,
    [companies],
  );
  const byStatus = await client.query(
    `
      SELECT status, COUNT(*)::int AS total
      FROM public.employees
      WHERE company_id = ANY($1::text[])
      GROUP BY status
      ORDER BY status
    `,
    [companies],
  );
  const roleCount = await client.query(
    `
      SELECT COUNT(DISTINCT job_title_key)::int AS role_count
      FROM public.employees
      WHERE company_id = ANY($1::text[])
    `,
    [companies],
  );
  console.log(
    JSON.stringify(
      {
        companies,
        by_company: byCompany.rows,
        by_status: byStatus.rows,
        role_count: roleCount.rows[0]?.role_count ?? 0,
      },
      null,
      2,
    ),
  );
  await client.end();
}

main().catch(async (error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  try {
    await client.end();
  } catch {
    // noop
  }
  process.exit(1);
});

