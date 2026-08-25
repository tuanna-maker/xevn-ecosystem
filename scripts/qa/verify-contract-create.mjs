/**
 * Verify contract create flow — catalog partition + POST body.
 * Usage: node scripts/qa/verify-contract-create.mjs
 *
 * @CODE-MEMORY-CHANGE 2026-08-24 PO-HRM-CTR-CREATE-CATALOG-PARITY-01
 * Spec: docs/program/specs/PO-HRM-CTR-CREATE-CATALOG-PARITY-01.md
 * Evidence: docs/qa/evidence/po-hrm-ctr-create-catalog-parity-01.md
 */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, 'deploy/xevn-ecosystem/.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const k = m[1].trim();
      let v = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

function signJwt(claims) {
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...claims,
    iss: process.env.SERVICE_JWT_ISSUER ?? 'xevn-internal',
    aud: process.env.SERVICE_JWT_AUDIENCE ?? 'xevn-api',
    iat: now,
    exp: now + 3600,
  };
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret)
    .update(`${header}.${payloadPart}`)
    .digest('base64url');
  return `${header}.${payloadPart}.${sig}`;
}

const HRM = process.env.HRM_BE_URL ?? 'http://127.0.0.1:28001';
const auth = `Bearer ${signJwt({
  sub: 'ceo@xe.vn',
  tenantId: 'xevn',
  companyId: 'main',
  roleCode: 'group_ceo',
})}`;

const headers = {
  Authorization: auth,
  'Content-Type': 'application/json',
  'x-tenant-id': 'xevn',
  'x-company-id': 'main',
};

async function api(path, opts = {}) {
  const res = await fetch(`${HRM}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

loadEnv();

console.log('=== Contract create verification ===\n');

const overviewWrong = await api('/api/hrm/settings-catalogs/overview?company_id=main');
const overview = await api('/api/hrm/settings-catalogs?company_id=main');
console.log(`GET /settings-catalogs/overview (wrong): ${overviewWrong.status}`);
console.log(`GET /settings-catalogs (FE path): ${overview.status}`);

const catalogs = overview.body?.data?.catalogs ?? overview.body?.catalogs ?? [];
const ct = catalogs.find((c) => (c.catalogKey ?? c.catalog_key) === 'contract_types');
let ctItems = (ct?.effectiveItems ?? []).filter((i) => i.status === 'active');
console.log(`  overview contract_types active=${ctItems.length}`);

const ctPicker = await api('/api/hrm/settings-catalogs/contract_types/items?company_id=main&status=active');
const pickerItems = ctPicker.body?.data?.data ?? ctPicker.body?.data ?? [];
console.log(`GET contract_types/items: ${ctPicker.status}, total=${ctPicker.body?.data?.total ?? pickerItems.length}`);
if (!ctItems.length && pickerItems.length) {
  ctItems = pickerItems.filter((i) => i.status === 'active' || !i.status);
}
console.log('  codes:', ctItems.slice(0, 8).map((i) => i.code).join(', ') || '(none)');

const emps = await api('/api/hrm/employees?company_id=main&page=1&page_size=3');
const empRows = emps.body?.data?.data ?? emps.body?.data ?? [];
const emp = empRows[0];
console.log(`GET employees: ${emps.status}, sample=${emp?.id ?? 'none'} ${emp?.full_name ?? ''} job_title_key=${emp?.job_title_key ?? '—'}`);

if (!ctItems.length) {
  console.error('\nFAIL: contract_types catalog empty — cannot create contract.');
  process.exit(1);
}

if (!emp?.id) {
  console.error('\nFAIL: no employees in scope.');
  process.exit(1);
}

const contractType =
  ctItems.find((i) => i.code === 'HDLD_XDHN_12')?.code ?? ctItems[0].code;
const endDate = '2027-12-31';

const payloads = [
  {
    label: 'minimal (registry_only)',
    body: {
      company_id: 'main',
      employee_id: emp.id,
      subject_type: 'employee',
      contract_type: contractType,
      start_date: '2026-01-01',
      end_date: endDate,
      position_key: emp.job_title_key || 'NV_KD',
      registry_only: true,
    },
  },
  {
    label: 'wizard persist (signed_at + work_arrangement + salary_ratio)',
    body: {
      company_id: 'main',
      employee_id: emp.id,
      subject_type: 'employee',
      contract_type: contractType,
      start_date: '2026-01-01',
      end_date: endDate,
      position_key: emp.job_title_key || 'NV_KD',
      signed_at: '2026-01-01',
      work_arrangement: 'full_time',
      salary_ratio_percent: 100,
      contract_code: `QA-CTR-${Date.now()}`,
    },
  },
];

for (const p of payloads) {
  console.log(`\nPOST contracts — ${p.label}`);
  console.log('  body:', JSON.stringify(p.body, null, 2));
  const res = await api('/api/hrm/contracts-insurance/contracts', {
    method: 'POST',
    body: JSON.stringify(p.body),
  });
  const err = res.body?.error ?? res.body;
  console.log(`  → ${res.status}`, JSON.stringify(err, null, 2));
}
