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

const id = '0a05420f-c28f-44d7-9e39-6a0e4db5b938';
const r = await pool.query(
  `SELECT id::text, company_id, full_name, email, status,
          requisition_id::text AS requisition_id
   FROM public.recruitment_candidates WHERE id = $1::uuid`,
  [id],
);
console.log(r.rows[0]);
await pool.end();
