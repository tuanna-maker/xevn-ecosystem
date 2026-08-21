import { readFileSync } from 'node:fs';
import pg from 'pg';

function loadEnv() {
  for (const p of ['apps/api/hrm-api/.env', 'deploy/xevn-ecosystem/.env', '.env']) {
    try {
      const t = readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
      for (const line of t.split(/\r?\n/)) {
        const cleaned = line.replace(/^\uFEFF/, '');
        if (cleaned.startsWith('DATABASE_URL_HRM=')) {
          return cleaned
            .slice('DATABASE_URL_HRM='.length)
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      /* */
    }
  }
  return process.env.DATABASE_URL_HRM || process.env.DATABASE_URL || '';
}

const url = loadEnv();
if (!url) {
  console.log(JSON.stringify({ error: 'NO_DATABASE_URL' }));
  process.exit(0);
}
console.log(
  JSON.stringify({
    url_host: url.replace(/:[^:@/]+@/, ':***@').slice(0, 96),
  }),
);
const c = new pg.Client({ connectionString: url });
await c.connect();
const emp = '8104761f-da90-4979-9a94-74b20e49ee3c';
const cand = '448d12df-fd76-4fb2-8953-e26667bae446';
const e = await c.query(
  'select id::text, employee_code, status, candidate_id::text from public.employees where id=$1::uuid',
  [emp],
);
const r = await c.query(
  'select id::text, status, employee_id::text, offer_accepted_at::text, accepted_application_id::text from public.recruitment_candidates where id=$1::uuid',
  [cand],
);
console.log(JSON.stringify({ emp: e.rows[0] || null, cand: r.rows[0] || null }, null, 2));
await c.end();
