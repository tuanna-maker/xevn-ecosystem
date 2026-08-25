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

const reqId = 'fd9a3f4f-9828-4bb6-93fb-99b2979112c2';
const wi = '36180330-0e81-423e-9787-f1ed6a5f6ac9';
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_hrm',
  ssl: false,
});

const before = await pool.query(
  `SELECT id::text, status, workflow_instance_id::text AS wi, title
   FROM public.job_requisitions WHERE id = $1::uuid`,
  [reqId],
);
console.log('before', before.rows[0]);

if (before.rows[0] && !before.rows[0].wi) {
  await pool.query(
    `UPDATE public.job_requisitions
     SET workflow_instance_id = $1::uuid, updated_at = NOW()
     WHERE id = $2::uuid`,
    [wi, reqId],
  );
}

const after = await pool.query(
  `SELECT id::text, status, workflow_instance_id::text AS wi
   FROM public.job_requisitions WHERE id = $1::uuid`,
  [reqId],
);
console.log('after', after.rows[0]);
await pool.end();
