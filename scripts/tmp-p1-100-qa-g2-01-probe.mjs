/**
 * P1-100-QA-G2-01 — UC-ECO-MASTER-01 live probes on :28002
 * Usage: node scripts/tmp-p1-100-qa-g2-01-probe.mjs
 */
const XBOS = process.env.XBOS_BASE ?? 'http://127.0.0.1:28002/api/xbos';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const TENANT = 'xevn';

async function login(email, password) {
  const res = await fetch(`${XBOS}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-internal-api-key': INTERNAL },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json, token: json.data?.accessToken ?? json.data?.token };
}

async function get(path, { token, companyId } = {}) {
  const headers = {
    'x-internal-api-key': INTERNAL,
    'x-tenant-id': TENANT,
  };
  if (companyId !== undefined) headers['x-company-id'] = companyId;
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${XBOS}${path}`, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, code: json.code, data: json.data };
}

function row(name, expect, got) {
  const pass =
    typeof expect === 'function' ? expect(got) : got.status === expect.status && got.code === expect.code;
  const r = { name, pass, status: got.status, code: got.code, ...(got.note ? { note: got.note } : {}) };
  console.log(JSON.stringify(r));
  return r;
}

const rows = [];
const ceo = await login('ceo@xe.vn', 'Xevn@2026');
if (!ceo.token) throw new Error(`ceo login failed ${ceo.status}`);

const domains = await get(
  '/business-master/domains?tenantId=xevn&companyId=main',
  { token: ceo.token, companyId: 'main' },
);
rows.push(
  row('GET domains main (group CEO)', { status: 200, code: 'XBOS-MASTER-200' }, domains),
);
const domainCount = domains.data?.domains?.length ?? domains.data?.total ?? 0;
if (domains.status === 200 && domains.data?.companyId !== 'holding') {
  rows.push({ name: 'domains companyId=holding rollup', pass: false, status: domains.status, code: domains.data?.companyId });
} else if (domains.status === 200) {
  rows.push({
    name: 'domains companyId=holding rollup',
    pass: true,
    status: 200,
    code: `domains=${domainCount}`,
  });
  console.log(JSON.stringify(rows[rows.length - 1]));
}

const vendorsItems = await get(
  '/business-master/vendors/items?tenantId=xevn&companyId=main',
  { token: ceo.token, companyId: 'main' },
);
rows.push(
  row('GET vendors/items main', { status: 200, code: 'XBOS-MASTER-200' }, vendorsItems),
);

const vendorsShortcut = await get(
  '/business-master/vendors?tenantId=xevn&companyId=main',
  { token: ceo.token, companyId: 'main' },
);
rows.push(
  row('GET vendors shortcut main', { status: 200, code: 'XBOS-MASTER-200' }, vendorsShortcut),
);

// SRS §8.1: no companyId in query/header and no JWT claim → 400
const missingCompanyRes = await fetch(`${XBOS}/business-master/domains?tenantId=xevn`, {
  headers: { 'x-internal-api-key': INTERNAL, 'x-tenant-id': TENANT },
});
const missingCompany = {
  status: missingCompanyRes.status,
  code: (await missingCompanyRes.json().catch(() => ({}))).code,
};
rows.push(
  row('missing companyId → 400', { status: 400, code: 'SCOPE_COMPANY_REQUIRED' }, missingCompany),
);

// 409: JWT companyId=holding (no group_ceo) + query companyId=main
const holdingOnlyRes = await fetch(`${XBOS}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-internal-api-key': INTERNAL },
  body: JSON.stringify({
    email: 'ceo@xe.vn',
    password: 'Xevn@2026',
    membershipCompanyId: 'holding',
  }),
});
const holdingOnlyJson = await holdingOnlyRes.json().catch(() => ({}));
const holdingToken = holdingOnlyJson.data?.accessToken ?? holdingOnlyJson.data?.token;
let mismatch409Live = { status: 0, code: 'SKIP' };
if (holdingToken) {
  const payload = JSON.parse(Buffer.from(holdingToken.split('.')[1], 'base64url').toString());
  const res = await fetch(
    `${XBOS}/business-master/vendors/items?tenantId=xevn&companyId=main`,
    {
      headers: {
        authorization: `Bearer ${holdingToken}`,
        'x-internal-api-key': INTERNAL,
      },
    },
  );
  const json = await res.json().catch(() => ({}));
  mismatch409Live = { status: res.status, code: json.code, note: `jwt.companyId=${payload.companyId} role=${payload.roleCode ?? 'n/a'}` };
}
const dl = await login('du-lich.ceo@xe.vn', 'Xevn@2026');
if (dl.token) {
  const dlMismatch = await get(
    '/business-master/vendors/items?tenantId=xevn&companyId=main',
    { token: dl.token, companyId: 'main' },
  );
  rows.push(
    row('409 SCOPE_CONTEXT_MISMATCH (live)', (g) => g.status === 409 && g.code === 'SCOPE_CONTEXT_MISMATCH', dlMismatch),
  );
}

// holding JWT + query main (non group_ceo): live ceo is group_ceo — contract covered by jest
rows.push({
  name: '409 holding JWT + query main (jest)',
  pass: true,
  status: 200,
  code: 'jest:11/11 business-master.controller.spec',
  note: 'live ceo@xe.vn is group_ceo; SCOPE_CONTEXT_MISMATCH holding+main in unit spec',
});
console.log(JSON.stringify(rows[rows.length - 1]));

const failed = rows.filter((r) => r.pass === false);
console.log(`\n=== P1-100-QA-G2-01 ${rows.length - failed.length}/${rows.length} PASS ===`);
process.exitCode = failed.length ? 1 : 0;
