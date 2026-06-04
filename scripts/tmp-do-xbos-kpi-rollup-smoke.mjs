#!/usr/bin/env node
/** DevOps smoke — KPI rollup scope on xbos-api (direct or via PORTAL_DEV_URL). */
const base = (process.env.XBOS_API_URL || 'http://127.0.0.1:28002').replace(/\/+$/, '');
const portal = process.env.PORTAL_DEV_URL?.replace(/\/+$/, '');
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

async function login() {
  const url = portal ? `${portal}/api/xbos/auth/login` : `${base}/api/xbos/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  const data = body?.data ?? body;
  const token = data?.access_token ?? data?.accessToken;
  const tenant = data?.defaultTenantId ?? data?.default_tenant_id ?? 'main';
  const company = data?.defaultCompanyId ?? data?.default_company_id ?? 'main';
  return { status: res.status, token, tenant, company, data };
}

async function rollup(token, tenant, company, queryTenant, queryCompany) {
  const apiBase = portal ? portal : base;
  const q = `tenantId=${encodeURIComponent(queryTenant)}&companyId=${encodeURIComponent(queryCompany)}`;
  const url = `${apiBase}/api/xbos/kpi-engine/rollup?${q}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenant,
      'x-company-id': company,
      Accept: 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, code: body?.code ?? body?.error?.code, details: body?.details ?? body?.error?.details };
}

async function main() {
  console.log(`xbos-kpi-rollup-smoke base=${portal || base}`);
  const { status, token, tenant, company } = await login();
  if (!token) {
    console.error(`LOGIN_FAIL status=${status}`);
    process.exit(1);
  }
  console.log(`LOGIN_OK session_tenant=${tenant} session_company=${company}`);
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  console.log(
    `JWT claims tenant=${payload.tenantId ?? payload.tenant_id} company=${payload.companyId ?? payload.company_id} role=${payload.roleCode ?? payload.role_code ?? payload.role}`,
  );

  const cases = [
    ['main', 'holding', 'J-CC-03-query-main'],
    ['xevn', 'holding', 'xevn-holding'],
    [tenant, 'holding', 'session-tenant-holding'],
  ];
  let fail = 0;
  for (const [qt, qc, label] of cases) {
    const r = await rollup(token, tenant, company, qt, qc);
    const pass = r.status === 200 && r.code === 'XBOS-KPI-202';
    console.log(`${pass ? 'PASS' : 'FAIL'} ${label} query=${qt}/${qc} HTTP ${r.status} code=${r.code}`, r.details ? JSON.stringify(r.details) : '');
    if (!pass) fail += 1;
  }
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
