/**
 * P1-BND-QA-FE — Payroll advance approve/reject/mark-paid via portal proxy (:5175).
 * ANTI-LOOP: narrow smoke only; no phase1:gate / embed / UAT.
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const stamp = Date.now();

const session = await portalLogin(email, password);
const headers = {
  ...authHeaders(session),
  accept: 'application/json',
  'content-type': 'application/json',
};

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
  return {
    url,
    status: res.status,
    code: json?.code ?? json?.error?.code ?? null,
    data: json?.data ?? json,
    message: json?.message ?? null,
  };
}

const results = { work_item_id: 'P1-BND-QA-FE', steps: [], pass: true };

function record(name, r, expect) {
  const statusOk = Array.isArray(expect.status)
    ? expect.status.includes(r.status)
    : r.status === expect.status;
  const ok =
    statusOk &&
    (expect.code == null || r.code === expect.code) &&
    (expect.statusField == null || r.data?.status === expect.statusField);
  results.steps.push({ name, ...r, expect, pass: ok });
  if (!ok) results.pass = false;
  return r;
}

// Flow A: create → approve → mark-paid
const createA = record(
  'create-A',
  await portalHrm('POST', '/api/hrm/payroll/advance-requests', {
    company_id: 'main',
    name: `QA-BND-FE approve ${stamp}`,
    salary_period: '2026-05',
  }),
  { status: 201, code: 'HRM-ADV-201' },
);
const idA = createA.data?.id;
if (!idA) {
  results.pass = false;
  results.steps.push({ name: 'create-A-id', pass: false, error: 'missing id' });
} else {
  record(
    'approve-A',
    await portalHrm('POST', `/api/hrm/payroll/advance-requests/${idA}/approve`, {
      reviewer_name: 'QA Lead',
    }),
    { status: [200, 201], code: 'HRM-ADV-203', statusField: 'approved' },
  );
  record(
    'mark-paid-A',
    await portalHrm('POST', `/api/hrm/payroll/advance-requests/${idA}/mark-paid`, {
      reviewer_name: 'QA Lead',
    }),
    { status: [200, 201], code: 'HRM-ADV-205', statusField: 'paid' },
  );
}

// Flow B: create → reject
const createB = record(
  'create-B',
  await portalHrm('POST', '/api/hrm/payroll/advance-requests', {
    company_id: 'main',
    name: `QA-BND-FE reject ${stamp}`,
    salary_period: '2026-05',
  }),
  { status: 201, code: 'HRM-ADV-201' },
);
const idB = createB.data?.id;
if (!idB) {
  results.pass = false;
  results.steps.push({ name: 'create-B-id', pass: false, error: 'missing id' });
} else {
  record(
    'reject-B',
    await portalHrm('POST', `/api/hrm/payroll/advance-requests/${idB}/reject`, {
      reviewer_name: 'QA Lead',
      rejected_reason: 'QA smoke reject',
    }),
    { status: [200, 201], code: 'HRM-ADV-204', statusField: 'rejected' },
  );
}

// List sanity — portal proxy, company_id=main
const list = await portalHrm(
  'GET',
  '/api/hrm/payroll/advance-requests?company_id=main',
);
results.list = { status: list.status, total: list.data?.total ?? null, pass: list.status === 200 };
if (list.status !== 200) results.pass = false;

console.log(JSON.stringify(results, null, 2));
process.exit(results.pass ? 0 : 1);
