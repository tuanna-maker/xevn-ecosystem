/**
 * Live snapshot: recruitment spine counts for audit.
 * Usage: node scripts/_tmp-rec-flow-audit.mjs
 */
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
  'requisitions by status',
  `SELECT status, count(*)::int n,
          count(*) FILTER (WHERE workflow_instance_id IS NOT NULL)::int with_wi,
          count(*) FILTER (WHERE workflow_instance_id IS NULL)::int no_wi
   FROM public.job_requisitions GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'requisitions headcount_mode',
  `SELECT coalesce(headcount_mode,'(null)') mode, count(*)::int n
   FROM public.job_requisitions GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'recent requisitions',
  `SELECT id::text, title, status, headcount_mode,
          workflow_instance_id::text wi,
          company_id, updated_at
   FROM public.job_requisitions
   ORDER BY updated_at DESC NULLS LAST LIMIT 8`,
);

await q(
  'candidates by stage/status',
  `SELECT coalesce(stage,'(null)') stage, coalesce(status,'(null)') status, count(*)::int n
   FROM public.candidates GROUP BY 1,2 ORDER BY n DESC LIMIT 20`,
);

await q(
  'candidates with requisition link',
  `SELECT
     count(*)::int total,
     count(*) FILTER (WHERE job_requisition_id IS NOT NULL)::int with_yctd,
     count(*) FILTER (WHERE job_requisition_id IS NULL)::int no_yctd,
     count(*) FILTER (WHERE workflow_instance_id IS NOT NULL)::int with_wi
   FROM public.candidates`,
);

await q(
  'interviews counts',
  `SELECT coalesce(status,'(null)') status, count(*)::int n
   FROM public.interviews GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'interview tables probe',
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='public'
     AND (table_name ILIKE '%interview%' OR table_name ILIKE '%candidate%' OR table_name ILIKE '%requisition%' OR table_name ILIKE '%recruitment_plan%' OR table_name ILIKE '%campaign%' OR table_name ILIKE '%job_post%')
   ORDER BY 1`,
);

await q(
  'recruitment_plans',
  `SELECT coalesce(status,'(null)') status, count(*)::int n,
          count(*) FILTER (WHERE workflow_instance_id IS NOT NULL)::int with_wi
   FROM public.recruitment_plans GROUP BY 1 ORDER BY n DESC`,
);

await pool.end();
