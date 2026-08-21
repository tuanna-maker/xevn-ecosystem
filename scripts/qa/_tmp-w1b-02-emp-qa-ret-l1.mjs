/**
 * W1-B-02-EMP-QA-RET — L1 live EMP display-ready + scope parity (U65, no seed)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM = 'http://127.0.0.1:28001';
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-w1b-02-emp-qa-ret-l1.json',
);

function looksLikeSnakeCatalogKey(v) {
  if (typeof v !== 'string' || !v.trim()) return false;
  const s = v.trim();
  return /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(s) || /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s);
}

async function main() {
  const report = {
    work_item_id: 'W1-B-02-EMP-QA-RET',
    layer: 'L1-live',
    startedAt: new Date().toISOString(),
    steps: [],
  };

  const loginRes = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginBody = await loginRes.json();
  const token = loginBody?.data?.accessToken;
  if (!token) throw new Error(`login failed ${loginRes.status}`);
  report.steps.push({ step: 'login', status: loginRes.status, ok: true });

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  const listUrl = `${HRM}/api/hrm/employees?company_id=main&page_size=20`;
  const listRes = await fetch(listUrl, { headers });
  const listBody = await listRes.json();
  const data = listBody?.data ?? {};
  const items = Array.isArray(data) ? data : data.items || data.rows || data.data || [];
  report.steps.push({
    step: 'GET_list',
    status: listRes.status,
    code: listBody.code,
    total: data.total ?? items.length,
    count: items.length,
    sampleKeys: items[0] ? Object.keys(items[0]).slice(0, 40) : [],
  });

  const required = ['status_label', 'department', 'job_title_label', 'display_name'];
  const fieldCheck = items.slice(0, 10).map((r) => {
    const present = Object.fromEntries(required.map((k) => [k, k in r]));
    const values = Object.fromEntries(required.map((k) => [k, r[k] ?? null]));
    return {
      id: r.id,
      company_id: r.company_id,
      present,
      values,
      snakeLeak: looksLikeSnakeCatalogKey(r.job_title_label),
    };
  });
  const allHaveKeys =
    items.length > 0 && fieldCheck.every((r) => required.every((k) => r.present[k]));
  const snakeLeaks = fieldCheck.filter((r) => r.snakeLeak);
  report.ac1 = {
    verdict: listRes.status === 200 && allHaveKeys ? 'PASS' : 'FAIL',
    allHaveKeys,
    rowCount: items.length,
    fieldCheck,
    snakeLeakCount: snakeLeaks.length,
  };

  const holding =
    items.find((r) => r.company_id && String(r.company_id) !== 'main') || items[0];
  if (!holding) {
    report.ac2 = { verdict: 'FAIL', reason: 'no rows under company_id=main' };
    report.ac3 = { verdict: 'FAIL', reason: 'no rows' };
    report.finishedAt = new Date().toISOString();
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exit(2);
  }

  const getRes = await fetch(
    `${HRM}/api/hrm/employees/${holding.id}?company_id=main`,
    { headers },
  );
  const getBody = await getRes.json();
  const g = getBody?.data ?? getBody;
  report.ac2 = {
    verdict: getRes.status >= 200 && getRes.status < 300 && getRes.status !== 404 ? 'PASS' : 'FAIL',
    status: getRes.status,
    code: getBody.code,
    id: holding.id,
    company_id: g.company_id,
    display_name: g.display_name,
    department: g.department,
    job_title_label: g.job_title_label,
    status_label: g.status_label,
  };

  const patchPayload = {};
  if (g.job_title_key) patchPayload.job_title_key = g.job_title_key;
  else if (g.phone_number != null) patchPayload.phone_number = g.phone_number;
  else if (g.full_name) patchPayload.full_name = g.full_name;
  else patchPayload.display_name = g.display_name;

  const patchRes = await fetch(
    `${HRM}/api/hrm/employees/${holding.id}?company_id=main`,
    {
      method: 'PATCH',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify(patchPayload),
    },
  );
  const patchBody = await patchRes.json();
  const p = patchBody?.data ?? patchBody;
  const displayReady =
    p &&
    'display_name' in p &&
    'department' in p &&
    'job_title_label' in p &&
    'status_label' in p;
  report.ac3 = {
    verdict: patchRes.status >= 200 && patchRes.status < 300 && displayReady ? 'PASS' : 'FAIL',
    status: patchRes.status,
    code: patchBody.code,
    payloadKeys: Object.keys(patchPayload),
    displayReady,
    display_name: p.display_name,
    department: p.department,
    job_title_label: p.job_title_label,
    status_label: p.status_label,
    snakeLeak: looksLikeSnakeCatalogKey(p.job_title_label),
  };

  report.ac4_api = {
    verdict: snakeLeaks.length === 0 && !looksLikeSnakeCatalogKey(p.job_title_label) ? 'PASS' : 'FAIL',
    snakeLeakCount: snakeLeaks.length,
  };

  report.finishedAt = new Date().toISOString();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  const fail =
    report.ac1.verdict !== 'PASS' ||
    report.ac2.verdict !== 'PASS' ||
    report.ac3.verdict !== 'PASS' ||
    report.ac4_api.verdict !== 'PASS';
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
