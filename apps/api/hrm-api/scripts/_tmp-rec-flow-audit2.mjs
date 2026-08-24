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
  'candidates columns sample',
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_schema='public' AND table_name='candidates'
   ORDER BY ordinal_position LIMIT 40`,
);

await q(
  'candidates stage counts',
  `SELECT coalesce(stage,'(null)') stage, count(*)::int n
   FROM public.candidates GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'candidates company',
  `SELECT coalesce(company_id,'(null)') company_id, count(*)::int n
   FROM public.candidates GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'candidate_applications',
  `SELECT count(*)::int total,
          count(DISTINCT candidate_id)::int candidates,
          count(DISTINCT requisition_id)::int requisitions
   FROM public.candidate_applications`,
);

await q(
  'applications by stage',
  `SELECT coalesce(stage,'(null)') stage, count(*)::int n
   FROM public.candidate_applications GROUP BY 1 ORDER BY n DESC`,
);

await q(
  'interviews vs recruitment_interviews',
  `SELECT 'interviews' t, count(*)::int n FROM public.interviews
   UNION ALL
   SELECT 'recruitment_interviews', count(*)::int FROM public.recruitment_interviews`,
);

await q(
  'interviews cols',
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name IN ('interviews','recruitment_interviews')
   ORDER BY table_name, ordinal_position`,
);

await q(
  'job_templates',
  `SELECT coalesce(status,'(null)') status, count(*)::int n FROM public.job_templates GROUP BY 1`,
);

await q(
  'job_postings',
  `SELECT coalesce(status,'(null)') status, count(*)::int n FROM public.job_postings GROUP BY 1`,
);

await q(
  'candidate_evaluations',
  `SELECT count(*)::int n FROM public.candidate_evaluations`,
);

await q(
  'holding receivable YCTD',
  `SELECT id::text, title, status, headcount_mode,
          pipeline_flags_json, workflow_instance_id::text wi
   FROM public.job_requisitions
   WHERE company_id IN ('holding','main')
   ORDER BY updated_at DESC LIMIT 10`,
);

await pool.end();
