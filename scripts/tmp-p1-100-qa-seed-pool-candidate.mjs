import { randomUUID } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();
const pg = (await import('pg')).default;
const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_hrm',
});
await client.connect();
const id = randomUUID();
const stamp = Date.now();
await client.query(
  `INSERT INTO public.candidates (id, company_id, full_name, email, stage, source)
   VALUES ($1::uuid, $2, $3, $4, 'applied', 'qa-smoke')
   ON CONFLICT (id) DO NOTHING`,
  [id, 'holding', `QA Pool ${stamp}`, `qa.pool.${stamp}@mail.xe.vn`],
);
const cnt = await client.query(
  `SELECT COUNT(*)::int AS n FROM public.candidates WHERE company_id IN ('holding','main')`,
);
await client.end();
console.log(JSON.stringify({ seeded_id: id, pool_count: cnt.rows[0].n }));
