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

function fromDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await client.connect();
  const start = fromDate(89);
  const queries = {
    attendance: `SELECT COUNT(*)::int AS c FROM public.attendance_records WHERE attendance_date >= $1::date`,
    service_requests: `SELECT COUNT(*)::int AS c FROM public.service_requests WHERE request_date >= $1::date`,
    tasks: `SELECT COUNT(*)::int AS c FROM public.hrm_tasks WHERE due_date >= $1::date`,
    requisitions: `SELECT COUNT(*)::int AS c FROM public.job_requisitions WHERE created_at::date >= $1::date`,
    candidates: `SELECT COUNT(*)::int AS c FROM public.recruitment_candidates WHERE created_at::date >= $1::date`,
    interviews: `SELECT COUNT(*)::int AS c FROM public.recruitment_interviews WHERE created_at::date >= $1::date`,
    payroll_periods: `SELECT COUNT(*)::int AS c FROM public.payroll_periods WHERE created_at::date >= $1::date`,
  };
  const output = { from_date: start };
  for (const [key, sql] of Object.entries(queries)) {
    const res = await client.query(sql, [start]);
    output[key] = res.rows[0]?.c ?? 0;
  }
  console.log(JSON.stringify(output, null, 2));
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

