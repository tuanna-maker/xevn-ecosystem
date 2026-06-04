/**
 * P1-EX-QA-FE-P1-03 — Group CEO HRM list URLs must use company_id=main (not holding).
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const LIST_PATHS = [
  ['employees', '/api/hrm/employees?page_size=5&company_id=main'],
  ['contracts', '/api/hrm/contracts-insurance/contracts?company_id=main'],
  ['insurance', '/api/hrm/contracts-insurance/insurance?company_id=main'],
  ['requisitions', '/api/hrm/recruitment/requisitions?page_size=5&company_id=main'],
  ['candidates', '/api/hrm/recruitment/candidates?page_size=5&company_id=main'],
  ['attendance', '/api/hrm/attendance/records?page_size=5&company_id=main'],
  ['payslips', '/api/hrm/payroll/payslips?page_size=5&company_id=main'],
];

const session = await portalLogin(email, password);
const headers = authHeaders(session);

const jwtCompany =
  session.default_company_id ?? session.defaultCompanyId ?? session.company_id ?? session.companyId;

async function portalGet(path) {
  const url = `${PORTAL}${path}`;
  const res = await fetch(url, { headers: { ...headers, accept: 'application/json' } });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { url, status: res.status, code: body?.code ?? body?.error?.code ?? null };
}

const results = { jwtCompany, lists: {}, holdingNegative: null, pass: true };

for (const [name, path] of LIST_PATHS) {
  if (!path.includes('company_id=main')) {
    results.pass = false;
    results.lists[name] = { error: 'path missing company_id=main' };
    continue;
  }
  if (path.includes('company_id=holding')) {
    results.pass = false;
    results.lists[name] = { error: 'path contains holding' };
    continue;
  }
  const r = await portalGet(path);
  const ok = r.status === 200;
  results.lists[name] = { status: r.status, code: r.code, url: r.url, pass: ok };
  if (!ok) results.pass = false;
}

// Negative: operational list with query holding + header main → expect 409 (ADR)
const holdingPath = '/api/hrm/employees?page_size=1&company_id=holding';
const neg = await portalGet(holdingPath);
results.holdingNegative = {
  path: holdingPath,
  status: neg.status,
  code: neg.code,
  pass: neg.status === 409 || neg.code === 'SCOPE_CONTEXT_MISMATCH',
};

console.log(JSON.stringify({ work_item_id: 'P1-EX-QA-FE-P1-03', ...results }, null, 2));
process.exit(results.pass && results.holdingNegative.pass ? 0 : 1);
