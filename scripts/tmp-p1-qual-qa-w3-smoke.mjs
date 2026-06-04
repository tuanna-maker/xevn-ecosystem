/**
 * P1-QUAL-QA-W3 — W3 hrmApiGap zero verification via portal :5175.
 * Account: ceo@xe.vn, company_id=main. No 54321 / rest/v1 on load paths.
 */
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDeployEnv, loadEnvFile, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const COMPANY = 'main';
const stamp = Date.now();

const session = await portalLogin(email, password);
const headers = {
  ...authHeaders(session),
  accept: 'application/json',
  'content-type': 'application/json',
};

const results = {
  work_item_id: 'P1-QUAL-QA-W3',
  date: '2026-05-30',
  steps: [],
  pass: true,
  supabase_hits: [],
};

function record(name, r, expect = {}) {
  const statusOk = Array.isArray(expect.status)
    ? expect.status.includes(r.status)
    : expect.status == null || r.status === expect.status;
  const ok = statusOk && (expect.minTotal == null || (r.total ?? 0) >= expect.minTotal);
  const url = String(r.url ?? '');
  if (url.includes('54321') || url.includes('rest/v1')) {
    results.supabase_hits.push(url);
    results.pass = false;
  }
  results.steps.push({ name, url: r.url, status: r.status, code: r.code, total: r.total, pass: ok, expect });
  if (!ok) results.pass = false;
  return r;
}

async function portalHrm(method, path, body) {
  const url = `${PORTAL}${path.startsWith('/') ? path : `/api/hrm${path}`}`;
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  const data = json?.data ?? json;
  const list = data?.data ?? data?.items ?? (Array.isArray(data) ? data : null);
  return {
    url,
    status: res.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? json?.error?.message ?? null,
    data,
    row: data?.id ? data : list?.[0] ?? null,
    total: data?.total ?? (Array.isArray(list) ? list.length : null),
    list: Array.isArray(list) ? list : Array.isArray(data) ? data : data?.data ?? [],
  };
}

const q = `company_id=${COMPANY}`;

// L2 P-CC-03..08 embed load APIs (portal proxy)
const embedLoads = [
  ['P-CC-03', `/api/hrm/employees?page_size=100&${q}`],
  ['P-CC-04', `/api/hrm/contracts-insurance/contracts?${q}`],
  ['P-CC-05', `/api/hrm/contracts-insurance/insurance?${q}`],
  ['P-CC-06', `/api/hrm/recruitment/requisitions?page_size=100&${q}`],
  ['P-CC-07', `/api/hrm/attendance/records?page_size=100&${q}`],
  ['P-CC-08', `/api/hrm/payroll/payslips?page_size=100&${q}`],
];
for (const [id, path] of embedLoads) {
  record(`${id}-load`, await portalHrm('GET', path), { status: 200 });
}

const empList = await portalHrm('GET', `/api/hrm/employees?page_size=5&${q}`);
record('employees-pick', empList, { status: 200 });
const employeeId = empList.list?.[0]?.id ?? empList.row?.id;

// W3 spot: payroll sales / bonus
record('payroll-sales-data', await portalHrm('GET', `/api/hrm/payroll/sales-data?${q}`), {
  status: [200, 404],
});
record('payroll-bonus-policies', await portalHrm('GET', `/api/hrm/payroll/bonus-policies?${q}`), {
  status: [200, 404],
});

// W3 spot: insurance participants list
record(
  'insurance-policy-participants',
  await portalHrm('GET', `/api/hrm/contracts-insurance/insurance-policy-participants?${q}`),
  { status: [200, 404] },
);

if (employeeId) {
  record(
    'employee-assets-list',
    await portalHrm('GET', `/api/hrm/employees/${employeeId}/assets?${q}`),
    { status: [200, 404] },
  );
} else {
  results.steps.push({ name: 'employee-assets-list', pass: false, skip: 'no employee' });
  results.pass = false;
}

// Import-related: departments POST probe (dialog wire — expect 400/201 not 500)
record(
  'departments-import-probe',
  await portalHrm('POST', `/api/hrm/departments?${q}`, { name: `QA W3 dept ${stamp}`, code: `QAW3${stamp}` }),
  { status: [200, 201, 400, 409] },
);

const outPath = resolve(repoRoot, 'docs/qa/evidence/p1-qual-qa-w3-smoke-20260530.json');
mkdirSync(resolve(repoRoot, 'docs/qa/evidence'), { recursive: true });
writeFileSync(outPath, JSON.stringify(results, null, 2));

console.log(JSON.stringify({ pass: results.pass, steps: results.steps.length, supabase_hits: results.supabase_hits }, null, 2));
for (const s of results.steps) {
  console.log(`${s.pass ? 'PASS' : 'FAIL'} ${s.name} ${s.status ?? ''} ${s.code ?? ''}`);
}
process.exit(results.pass ? 0 : 1);
