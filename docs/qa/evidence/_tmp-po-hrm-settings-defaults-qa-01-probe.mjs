/**
 * L1 probe — PO-HRM-SETTINGS-DEFAULTS-QA-01 (U65 secondary; not UF).
 * Run: node docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-01-probe.mjs
 */
import fs from 'node:fs';

const base = 'http://127.0.0.1:28001/api/hrm';
const xbos = 'http://127.0.0.1:28002/api/xbos';
const stamp = 'SETDEF' + Date.now().toString(36).slice(-6).toUpperCase();

const login = await fetch(xbos + '/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lj = await login.json();
const token = lj.data?.accessToken || lj.data?.access_token;
if (!token) {
  console.error('LOGIN_FAIL', lj);
  process.exit(1);
}
const H = {
  Authorization: 'Bearer ' + token,
  'x-tenant-id': 'xevn',
  'x-company-id': 'main',
  'content-type': 'application/json',
};

const steps = [];
async function call(name, method, url, body) {
  const opts = { method, headers: { ...H } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  else delete opts.headers['content-type'];
  const r = await fetch(url, opts);
  const text = await r.text();
  let j = null;
  try {
    j = JSON.parse(text);
  } catch {
    /* ignore */
  }
  const row = {
    name,
    method,
    url: url.replace(base, ''),
    status: r.status,
    code: j?.code || null,
    message: j?.message || null,
    data: j?.data ?? null,
  };
  steps.push(row);
  console.log(JSON.stringify({ name, status: r.status, code: row.code, message: row.message }));
  return row;
}

await call('TAX_GET_PREFIX', 'GET', base + '/settings/company-settings?company_id=main&prefix=pay_tax_');
await call(
  'TAX_GET_KEY_NULL',
  'GET',
  base + '/settings/company-settings?company_id=main&key=pay_tax_personal_deduction_vnd',
);
await call('TAX_PUT_OK', 'PUT', base + '/settings/company-settings', {
  companyId: 'main',
  settingKey: 'pay_tax_personal_deduction_vnd',
  value: { amount: 11000000, currency: 'VND' },
});
await call('TAX_PUT_BAD', 'PUT', base + '/settings/company-settings', {
  companyId: 'main',
  settingKey: 'pay_tax_personal_deduction_vnd',
  value: { amount: -1, currency: 'VND' },
});
await call('TAX_PUT_REGIME', 'PUT', base + '/settings/company-settings', {
  companyId: 'main',
  settingKey: 'pay_tax_regime',
  value: { code: 'progressive_vn' },
});

const typeKey = 'BHXH_QA_' + stamp;
const si1 = await call('SI_CREATE', 'POST', base + '/settings/insurance-rate-cfg', {
  companyId: 'main',
  insuranceTypeKey: typeKey,
  employeeRatePct: 8,
  employerRatePct: 17.5,
  effectiveFrom: '2026-01-01',
  status: 'active',
  notes: 'qa ' + stamp,
});
const siId = si1.data?.id;
await call('SI_GET', 'GET', base + '/settings/insurance-rate-cfg/' + siId + '?company_id=main');
await call(
  'SI_LIST',
  'GET',
  base + '/settings/insurance-rate-cfg?company_id=main&insurance_type_key=' + encodeURIComponent(typeKey),
);
await call('SI_PATCH', 'PATCH', base + '/settings/insurance-rate-cfg/' + siId + '?company_id=main', {
  employerRatePct: 18,
  notes: 'patched',
});
await call('SI_OVERLAP', 'POST', base + '/settings/insurance-rate-cfg', {
  companyId: 'main',
  insuranceTypeKey: typeKey,
  employeeRatePct: 8,
  employerRatePct: 17.5,
  effectiveFrom: '2026-06-01',
  status: 'active',
  notes: 'should-409',
});
await call('SI_DELETE', 'DELETE', base + '/settings/insurance-rate-cfg/' + siId + '?company_id=main');
await call('SI_RETIRE', 'POST', base + '/settings/insurance-rate-cfg/' + siId + '/retire?company_id=main', {
  reason: 'qa retire',
});
await call('SI_GET_AFTER_RETIRE', 'GET', base + '/settings/insurance-rate-cfg/' + siId + '?company_id=main');

await call(
  'POS_RESOLVE_UNKNOWN',
  'GET',
  base + '/settings/position-compensation-policies/resolve?company_id=main&positionKey=NOT_A_TITLE&asOf=2026-08-07',
);
await call(
  'POS_RESOLVE_NO_POLICY',
  'GET',
  base + '/settings/position-compensation-policies/resolve?company_id=main&positionKey=CEO&asOf=2026-08-07',
);
const pos = await call('POS_CREATE', 'POST', base + '/settings/position-compensation-policies', {
  companyId: 'main',
  positionKey: 'CEO',
  positionLabelSnapshot: 'TGD',
  nameVi: 'QA policy ' + stamp,
  effectiveFrom: '2026-01-01',
  status: 'active',
  lines: [
    {
      componentCode: 'PC_DIEU_XE_6A75AC29',
      amount: 500000,
      calcMode: 'fixed',
      currency: 'VND',
      sortOrder: 1,
    },
  ],
});
const posId = pos.data?.id;
if (posId) {
  await call('POS_GET', 'GET', base + '/settings/position-compensation-policies/' + posId + '?company_id=main');
  await call(
    'POS_RESOLVE_HIT',
    'GET',
    base + '/settings/position-compensation-policies/resolve?company_id=main&positionKey=CEO&asOf=2026-08-07',
  );
  await call('POS_DUP', 'POST', base + '/settings/position-compensation-policies', {
    companyId: 'main',
    positionKey: 'CEO',
    nameVi: 'dup',
    effectiveFrom: '2026-01-01',
    status: 'active',
    lines: [{ componentCode: 'PC_DIEU_XE_6A75AC29', amount: 1, calcMode: 'fixed', currency: 'VND' }],
  });
  await call(
    'POS_RETIRE',
    'POST',
    base + '/settings/position-compensation-policies/' + posId + '/retire?company_id=main',
    { reason: 'qa' },
  );
  await call(
    'POS_RESOLVE_AFTER_RETIRE',
    'GET',
    base + '/settings/position-compensation-policies/resolve?company_id=main&positionKey=CEO&asOf=2026-08-07',
  );
} else {
  await call('POS_CREATE_ORPHAN', 'POST', base + '/settings/position-compensation-policies', {
    companyId: 'main',
    positionKey: 'CEO',
    nameVi: 'QA orphan ' + stamp,
    effectiveFrom: '2026-01-01',
    status: 'draft',
    lines: [{ componentCode: 'ORPHAN_CODE_' + stamp, amount: 1, calcMode: 'fixed', currency: 'VND' }],
  });
}

const resolveHit =
  steps.find((s) => s.name === 'POS_RESOLVE_HIT') || steps.find((s) => s.name === 'POS_RESOLVE_NO_POLICY');
const src02 = {
  resolveHasEmployeePackageId: !!(
    resolveHit?.data && Object.prototype.hasOwnProperty.call(resolveHit.data, 'employeePackageId')
  ),
  resolveKeys: resolveHit?.data ? Object.keys(resolveHit.data) : null,
  warnings: resolveHit?.data?.warnings || null,
};

const out = { work_item_id: 'PO-HRM-SETTINGS-DEFAULTS-QA-01', stamp, siId, posId, typeKey, src02, steps };
fs.writeFileSync(
  'docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-01.json',
  JSON.stringify(out, null, 2),
);
console.log('WROTE', stamp, 'siId', siId, 'posId', posId);
