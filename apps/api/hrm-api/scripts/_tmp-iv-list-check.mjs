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

const r = await pool.query(`
  SELECT i.id::text, i.company_id, i.status, i.scheduled_at,
         c.full_name AS candidate_name, nullif(btrim(r.title), '') AS position
  FROM public.recruitment_interviews i
  LEFT JOIN public.recruitment_candidates c ON c.id = i.candidate_id
  LEFT JOIN public.job_requisitions r ON r.id = c.requisition_id
  WHERE i.company_id = ANY($1::text[])
  ORDER BY i.scheduled_at DESC
  LIMIT 5
`, [['holding', 'main']]);
console.log(JSON.stringify(r.rows, null, 2));

const cols = await pool.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='recruitment_candidates'
    AND column_name IN ('requisition_id','full_name','email','status')
`);
console.log('cand cols', cols.rows);

await pool.end();
