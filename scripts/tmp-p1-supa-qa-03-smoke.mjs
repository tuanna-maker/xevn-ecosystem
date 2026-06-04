#!/usr/bin/env node
/**
 * P1-SUPA-QA-03 — Wave 2+3 HRM endpoint smoke (delete after QA ack).
 * Usage: node scripts/tmp-p1-supa-qa-03-smoke.mjs
 */
const XBOS = process.env.XBOS_BASE ?? 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const PORTAL = (process.env.PORTAL_DEV_URL ?? 'http://127.0.0.1:5175').replace(/\/+$/, '');
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const EMPLOYEE_ID = process.env.HRM_SMOKE_EMPLOYEE_ID ?? '3796d949-4513-45c0-88fa-33030a062b17';

const rows = [];
let fail = 0;

function bump(pass) {
  if (!pass) fail += 1;
}

async function portalLogin() {
  const res = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const json = await res.json().catch(() => ({}));
  const token = json?.data?.accessToken ?? json?.accessToken;
  if (!res.ok || !token) throw new Error(`portal login ${res.status}`);
  return token;
}

async function hrmJson(name, method, path, { body, token, form, contentType } = {}) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
    'x-internal-api-key': INTERNAL,
  };
  let reqBody;
  if (form != null) {
    reqBody = form;
    if (contentType) headers['content-type'] = contentType;
  } else if (body != null) {
    headers['content-type'] = 'application/json';
    reqBody = JSON.stringify(body);
  }
  const res = await fetch(`${HRM}${path}`, { method, headers, body: reqBody });
  const text = await res.text().catch(() => '');
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  const pass = res.ok;
  const row = { name, method, path, status: res.status, code: json?.code, pass };
  rows.push(row);
  bump(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  HTTP ${res.status}  ${json?.code ?? ''}`);
  return { res, json, pass };
}

async function main() {
  const token = await portalLogin();
  console.log('PASS  portal-login\n');

  await hrmJson('GET employee-insurances', 'GET', `/employee-insurances?company_id=main&employee_id=${EMPLOYEE_ID}`, { token });
  await hrmJson('GET employee-benefits', 'GET', `/employee-benefits?company_id=main&employee_id=${EMPLOYEE_ID}`, { token });
  await hrmJson('GET job-postings', 'GET', '/recruitment/job-postings?company_id=main', { token });
  await hrmJson('GET overtime-requests', 'GET', '/attendance/overtime-requests?company_id=main', { token });
  await hrmJson('GET business-trip-requests', 'GET', '/attendance/business-trip-requests?company_id=main', { token });
  await hrmJson('GET late-early-requests', 'GET', '/attendance/late-early-requests?company_id=main', { token });

  const otBody = {
    company_id: 'main',
    employee_id: EMPLOYEE_ID,
    employee_code: 'QA-SMOKE',
    employee_name: 'QA Smoke',
    overtime_date: '2026-05-29',
    start_time: '18:00',
    end_time: '20:00',
    total_hours: 2,
    overtime_type: 'weekday',
    reason: 'P1-SUPA-QA-03 smoke',
  };
  const otCreate = await hrmJson('POST overtime-requests', 'POST', '/attendance/overtime-requests', {
    token,
    body: otBody,
  });
  const otId = otCreate.json?.data?.id ?? otCreate.json?.id;
  if (otId) {
    await hrmJson('DELETE overtime-requests cleanup', 'DELETE', `/attendance/overtime-requests/${otId}`, { token });
  }

  const decList = await hrmJson('GET decisions list', 'GET', '/decisions?company_id=main', { token });
  const items = decList.json?.data?.items ?? decList.json?.data ?? [];
  const decisionId = Array.isArray(items) ? items[0]?.id : null;
  if (decisionId) {
    const boundary = `----qa03${Date.now()}`;
    const content = 'P1-SUPA-QA-03 decision file smoke\n';
    const form =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="qa-03-smoke.txt"\r\n` +
      `Content-Type: text/plain\r\n\r\n` +
      `${content}\r\n` +
      `--${boundary}--\r\n`;
    await hrmJson('POST decision file', 'POST', `/decisions/${decisionId}/files?company_id=main`, {
      token,
      form,
      contentType: `multipart/form-data; boundary=${boundary}`,
    });
  } else {
    console.log('SKIP  POST decision file — no decision row in DB');
  }

  console.log(`\n=== Smoke summary: ${rows.filter((r) => r.pass).length}/${rows.length} pass; exit ${fail ? 1 : 0} ===`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
