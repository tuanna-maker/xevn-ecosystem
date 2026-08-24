#!/usr/bin/env node
/** POST process payroll period — smoke / debug */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function signJwt(claims) {
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...claims,
    iss: process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal',
    aud: process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api',
    iat: now,
    exp: now + 3600,
  };
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(`${header}.${payloadPart}`).digest('base64url');
  return `${header}.${payloadPart}.${sig}`;
}

loadDeployEnv();
const client = createHrmClient();
await client.connect();
const periodRes = await client.query(
  `SELECT id::text FROM public.payroll_periods WHERE company_id='main' ORDER BY start_date DESC LIMIT 1`,
);
const periodId = periodRes.rows[0]?.id;
await client.end();

if (!periodId) {
  console.error('No period');
  process.exit(1);
}

const token = signJwt({
  sub: 'ceo@xe.vn',
  email: 'ceo@xe.vn',
  tenant_id: 'xevn',
  company_id: 'main',
  role_code: 'group_ceo',
});

const base = process.env.HRM_API_URL ?? 'http://127.0.0.1:28001';
const url = `${base}/api/hrm/payroll/periods/${periodId}/process?company_id=main`;

const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  },
  body: '{}',
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

console.log(JSON.stringify({ status: res.status, periodId, body }, null, 2));

if (res.ok) {
  const c2 = createHrmClient();
  await c2.connect();
  const pays = await c2.query(
    `SELECT e.employee_code, ps.gross_amount, ps.net_amount, ps.status, pp.status AS period_status
     FROM public.payroll_payslips ps
     JOIN public.employees e ON e.id = ps.employee_id
     JOIN public.payroll_periods pp ON pp.id = ps.period_id
     WHERE ps.period_id = $1::uuid`,
    [periodId],
  );
  const lines = await c2.query(
    `SELECT COUNT(*)::int c FROM public.payroll_payslip_lines pl
     JOIN public.payroll_payslips ps ON ps.id = pl.payslip_id
     WHERE ps.period_id = $1::uuid`,
    [periodId],
  );
  console.log(JSON.stringify({ after_process: pays.rows, payslip_lines: lines.rows[0] }, null, 2));
  await c2.end();
}
