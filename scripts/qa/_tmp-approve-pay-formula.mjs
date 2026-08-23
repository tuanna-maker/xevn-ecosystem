/**
 * Dev helper: submit-publish + publish a pay formula (dual-control safe).
 * Usage: node scripts/qa/_tmp-approve-pay-formula.mjs formula_lai_tai_logistic
 */
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const FORMULA_CODE = (process.argv[2] || '').trim().toLowerCase();
const COMPANY_ID = (process.argv[3] || process.env.DEFAULT_COMPANY_ID || 'holding').trim();

if (!FORMULA_CODE) {
  console.error('Usage: node scripts/qa/_tmp-approve-pay-formula.mjs <formula_code> [company_id]');
  process.exit(1);
}

const QA_PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';

async function login(email) {
  const res = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: QA_PASSWORD }),
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.accessToken) {
    throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(json)}`);
  }
  return json.data.accessToken;
}

function headers(token, companyId) {
  return {
    Authorization: `Bearer ${token}`,
    'x-company-id': companyId,
    'x-tenant-id': 'xevn',
    'content-type': 'application/json',
  };
}

async function listFormula(token, companyId) {
  const search = new URLSearchParams({ company_id: companyId, code: FORMULA_CODE });
  const res = await fetch(`${HRM}/api/hrm/payroll/formulas?${search}`, {
    headers: headers(token, companyId),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`list failed: ${res.status} ${JSON.stringify(json)}`);
  }
  const items = json?.data?.items ?? [];
  return items[0] ?? null;
}

async function submitPublish(token, companyId, id) {
  const search = new URLSearchParams({ company_id: companyId });
  const res = await fetch(`${HRM}/api/hrm/payroll/formulas/${id}/submit-publish?${search}`, {
    method: 'POST',
    headers: headers(token, companyId),
    body: '{}',
  });
  const json = await res.json();
  console.log('submit-publish', res.status, json.code, json.message ?? '');
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.data;
}

async function publish(token, companyId, id) {
  const search = new URLSearchParams({ company_id: companyId });
  const res = await fetch(`${HRM}/api/hrm/payroll/formulas/${id}/publish?${search}`, {
    method: 'POST',
    headers: headers(token, companyId),
    body: '{}',
  });
  const json = await res.json();
  console.log('publish', res.status, json.code, json.message ?? '');
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.data;
}

const publisherCandidates = [
  'admin@xe.vn',
  'du-lich.ceo@xe.vn',
  'du-lich.hr@xe.vn',
  'tmdv.ceo@xe.vn',
];

const authorEmail = 'ceo@xe.vn';
const authorToken = await login(authorEmail);

let formula = await listFormula(authorToken, COMPANY_ID);
if (!formula) {
  formula = await listFormula(authorToken, 'main');
}
if (!formula) {
  console.error(`Formula not found: ${FORMULA_CODE} (tried company ${COMPANY_ID} and main)`);
  process.exit(1);
}

const companyId = String(formula.companyId ?? formula.company_id ?? COMPANY_ID).trim();
console.log('found', {
  id: formula.id,
  code: formula.code,
  status: formula.status,
  companyId,
  authoredBy: formula.authoredBy ?? formula.authored_by ?? null,
});

const status = String(formula.status ?? 'draft').trim().toLowerCase();
if (status === 'active') {
  console.log('already active — nothing to do');
  process.exit(0);
}

if (status === 'draft') {
  formula = await submitPublish(authorToken, companyId, formula.id);
}

const pending = String(formula.status ?? '').trim().toLowerCase();
if (pending !== 'pending_publish') {
  console.error('unexpected status after submit:', formula.status);
  process.exit(1);
}

const authoredBy = String(formula.authoredBy ?? formula.authored_by ?? authorEmail).trim().toLowerCase();
let published = null;
let lastErr = null;

for (const email of publisherCandidates) {
  if (email.toLowerCase() === authoredBy) continue;
  try {
    const pubToken = await login(email);
    published = await publish(pubToken, companyId, formula.id);
    console.log('published by', email);
    break;
  } catch (err) {
    lastErr = err;
    console.log('publish attempt failed for', email, String(err?.message ?? err));
  }
}

if (!published) {
  console.error('publish failed for all publisher candidates', lastErr);
  process.exit(1);
}

console.log('done', {
  id: published.id,
  code: published.code,
  status: published.status,
  publishedBy: published.publishedBy ?? published.published_by,
});
