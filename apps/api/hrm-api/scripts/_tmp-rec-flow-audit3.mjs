import pg from 'pg';
import { readFileSync } from 'fs';

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 0) continue;
  const k = line.slice(0, i);
  let v = line.slice(i + 1);
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[k] = v;
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_hrm',
  ssl: false,
});

async function q(label, sql, params = []) {
  try {
    const r = await pool.query(sql, params);
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.log(`\n=== ${label} ERROR ===`);
    console.log(String(e.message).split('\n')[0]);
  }
}

await q(
  'recruitment_candidates by company/status',
  `SELECT coalesce(company_id,'(null)') company_id,
          coalesce(status,'(null)') status,
          count(*)::int n
   FROM public.recruitment_candidates
   GROUP BY 1,2 ORDER BY n DESC LIMIT 30`,
);

await q(
  'recruitment_interviews by company/status',
  `SELECT coalesce(company_id,'(null)') company_id,
          coalesce(status,'(null)') status,
          count(*)::int n
   FROM public.recruitment_interviews
   GROUP BY 1,2 ORDER BY n DESC`,
);

await q(
  'recruitment_interviews sample',
  `SELECT id::text, company_id, candidate_id::text, status, scheduled_at, interviewer
   FROM public.recruitment_interviews
   ORDER BY scheduled_at DESC NULLS LAST LIMIT 10`,
);

await q(
  'candidate_applications cols',
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name='candidate_applications'
   ORDER BY ordinal_position`,
);

await q(
  'apps sample',
  `SELECT * FROM public.candidate_applications LIMIT 3`,
);

await q(
  'jd templates alt',
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='public' AND table_name ILIKE '%template%' OR table_name ILIKE '%jd_%'
   ORDER BY 1`,
);

await pool.end();
