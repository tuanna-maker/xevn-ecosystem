#!/usr/bin/env node
/**
 * P1-EX-QA-HTTPS-01 — L2 + L2.5 + J-CC-03 on HTTPS pilot (perimeter only).
 * Usage: PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
 */
const PORTAL = (process.env.PORTAL_DEV_URL || 'https://14-225-217-232.nip.io').replace(/\/+$/, '');
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const checks = [];
const journeys = {};

function record(id, pass, detail = {}) {
  checks.push({ id, pass, ...detail });
  const mark = pass ? 'PASS' : 'FAIL';
  const extra = detail.status != null ? ` HTTP ${detail.status}` : '';
  const code = detail.code ? ` ${detail.code}` : '';
  console.log(`${mark}  ${id}${extra}${code}${detail.note ? ` — ${detail.note}` : ''}`);
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code ?? body?.error?.code };
}

async function portalLogin() {
  const { status, body } = await fetchJson(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = body?.data ?? body;
  const token = data?.access_token ?? data?.accessToken;
  return { ok: (status === 200 || status === 201) && Boolean(token), status, token, data, code: body?.code };
}

function sessionHeaders(session) {
  const tenant = session.defaultTenantId ?? session.default_tenant_id ?? 'xevn';
  const company = session.defaultCompanyId ?? session.default_company_id ?? 'main';
  return {
    Authorization: `Bearer ${session.access_token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
    tenant,
    company,
  };
}

async function portalGet(path, headers) {
  return fetchJson(`${PORTAL}${path}`, { headers: { ...headers, Accept: 'application/json' } });
}

function firstRow(body) {
  const inner = body?.data;
  if (Array.isArray(inner)) return inner[0];
  if (inner && Array.isArray(inner.data)) return inner.data[0];
  if (inner?.items && Array.isArray(inner.items)) return inner.items[0];
  return undefined;
}

async function main() {
  console.log(`P1-EX-QA-HTTPS-01 probe — ${PORTAL}\n`);

  const login = await portalLogin();
  record('P-CC-01-login', login.ok, { status: login.status, code: login.code });
  if (!login.ok) {
    console.error('Login failed — aborting');
    process.exit(1);
  }

  const session = { ...login.data, access_token: login.token };
  const h = sessionHeaders(session);
  const { tenant, company, ...headers } = h;

  record('P-CC-01-jwt', (login.data?.expiresInSec ?? login.data?.expires_in_sec) === 86400, {
    expiresInSec: login.data?.expiresInSec ?? login.data?.expires_in_sec,
    company,
    tenant,
  });

  const gmu = await portalGet('/api/xbos/tenant-scope/group-member-units', headers);
  const memberCount = Array.isArray(gmu.body?.data?.members)
    ? gmu.body.data.members.length
    : Array.isArray(gmu.body?.data)
      ? gmu.body.data.length
      : 0;
  record('P-CC-02', gmu.status === 200 && memberCount >= 1, {
    status: gmu.status,
    code: gmu.code,
    memberCount,
  });

  const emp = await portalGet('/api/hrm/employees?company_id=main&page_size=100', headers);
  record('P-CC-03', emp.status === 200, { status: emp.status, code: emp.code });

  const catalogs = await portalGet('/api/hrm/settings-catalogs', headers);
  const contracts = await portalGet('/api/hrm/contracts-insurance/contracts?company_id=main', headers);
  record('P-CC-04a', catalogs.status === 200, { status: catalogs.status, code: catalogs.code });
  record('P-CC-04b', contracts.status === 200, { status: contracts.status, code: contracts.code });

  const rollupHolding = await portalGet(
    `/api/xbos/kpi-engine/rollup?tenantId=${encodeURIComponent(tenant)}&companyId=holding`,
    headers,
  );
  const rollup409 =
    rollupHolding.status === 409 && rollupHolding.code === 'SCOPE_CONTEXT_MISMATCH';
  record('J-CC-03', rollupHolding.status === 200 && !rollup409, {
    status: rollupHolding.status,
    code: rollupHolding.code,
    note: 'KPI rollup companyId=holding + x-company-id main',
  });
  record('P-CC-04c', !rollup409, { status: rollupHolding.status, code: rollupHolding.code });
  record('P-CC-04', catalogs.status === 200 && contracts.status === 200 && !rollup409, {});

  const insurance = await portalGet('/api/hrm/contracts-insurance/insurance?company_id=main', headers);
  record('P-CC-05', insurance.status === 200, { status: insurance.status, code: insurance.code });

  const recruitment = await portalGet('/api/hrm/recruitment/requisitions?company_id=main&page_size=100', headers);
  record('P-CC-06', recruitment.status === 200, { status: recruitment.status, code: recruitment.code });

  const attendance = await portalGet('/api/hrm/attendance/records?company_id=main&page_size=100', headers);
  record('P-CC-07', attendance.status === 200, { status: attendance.status, code: attendance.code });

  const payroll = await portalGet('/api/hrm/payroll/payslips?company_id=main&page_size=100', headers);
  record('P-CC-08', payroll.status === 200, { status: payroll.status, code: payroll.code });

  const catGov = await portalGet('/api/xbos/catalog-governance/inbox?assigneeUserId=ceo@xe.vn', headers);
  const inbox409 = catGov.status === 409 && catGov.code === 'SCOPE_CONTEXT_MISMATCH';
  record('P-CC-09', catGov.status === 200 && !inbox409, { status: catGov.status, code: catGov.code });

  // L2.5 J-HRM via portal proxy
  const cRow = firstRow(contracts.body);
  let j01 = { pass: false };
  if (cRow?.employee_id) {
    const empD = await portalGet(`/api/hrm/employees/${cRow.employee_id}?company_id=main`, headers);
    j01 = {
      pass: contracts.status === 200 && empD.status === 200,
      list: contracts.status,
      get: empD.status,
      employee_id: cRow.employee_id,
    };
  } else j01.reason = 'no contract row';
  journeys['J-HRM-01'] = j01;
  record('J-HRM-01', j01.pass, j01);

  const eRow = firstRow(emp.body);
  let j02 = { pass: false };
  if (eRow?.id) {
    const empD = await portalGet(`/api/hrm/employees/${eRow.id}?company_id=main`, headers);
    j02 = { pass: emp.status === 200 && empD.status === 200, get: empD.status, employee_id: eRow.id };
  }
  journeys['J-HRM-02'] = j02;
  record('J-HRM-02', j02.pass, j02);

  journeys['J-HRM-03'] = {
    pass: Boolean(cRow?.id && cRow?.employee_id),
    contract_id: cRow?.id,
    employee_id: cRow?.employee_id,
  };
  record('J-HRM-03', journeys['J-HRM-03'].pass, journeys['J-HRM-03']);

  const iRow = firstRow(insurance.body);
  const insEmpId = iRow?.employee_id ?? iRow?.employeeId;
  let j04 = { pass: false };
  if (insEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${insEmpId}?company_id=main`, headers);
    j04 = { pass: insurance.status === 200 && empD.status === 200, get: empD.status, employee_id: insEmpId };
  }
  journeys['J-HRM-04'] = j04;
  record('J-HRM-04', j04.pass, j04);

  const reqs = await portalGet('/api/hrm/recruitment/requisitions?company_id=main&page_size=5', headers);
  const cand = await portalGet('/api/hrm/recruitment/candidates?company_id=main&page_size=5', headers);
  journeys['J-HRM-05'] = { pass: reqs.status === 200 && cand.status === 200 };
  record('J-HRM-05', journeys['J-HRM-05'].pass, {
    requisitions: reqs.status,
    candidates: cand.status,
  });

  const aRow = firstRow(attendance.body);
  const attEmpId = aRow?.employee_id ?? aRow?.employeeId;
  let j06 = { pass: attendance.status === 200 };
  if (attEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${attEmpId}?company_id=main`, headers);
    j06 = { pass: attendance.status === 200 && empD.status === 200, get: empD.status };
  }
  journeys['J-HRM-06'] = j06;
  record('J-HRM-06', j06.pass, j06);

  const pRow = firstRow(payroll.body);
  const payEmpId = pRow?.employee_id ?? pRow?.employeeId;
  let j07 = { pass: false };
  if (payEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${payEmpId}?company_id=main`, headers);
    j07 = { pass: payroll.status === 200 && empD.status === 200, get: empD.status, payslip_id: pRow?.id };
  } else j07.reason = 'no payslip row';
  journeys['J-HRM-07'] = j07;
  record('J-HRM-07', j07.pass, j07);

  // J-XBOS-01 workflow spot
  const wfTasks = await portalGet(
    '/api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending',
    headers,
  );
  const wf409 = wfTasks.status === 409 && wfTasks.code === 'SCOPE_CONTEXT_MISMATCH';
  record('J-XBOS-01-tasks', wfTasks.status === 200 && !wf409, { status: wfTasks.status, code: wfTasks.code });

  // Member negative (matrix optional)
  const memberLogin = await fetchJson(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'du-lich.ceo@xe.vn', password: 'Xevn@2026' }),
  });
  if (memberLogin.status === 200 || memberLogin.status === 201) {
    const mData = memberLogin.body?.data ?? memberLogin.body;
    const mToken = mData?.access_token ?? mData?.accessToken;
    const mHeaders = {
      Authorization: `Bearer ${mToken}`,
      'x-tenant-id': mData?.defaultTenantId ?? mData?.default_tenant_id ?? 'xevn',
      'x-company-id': mData?.defaultCompanyId ?? mData?.default_company_id ?? 'main',
    };
    const holdingKpi = await portalGet(
      `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=holding`,
      mHeaders,
    );
    record('member-kpi-negative', holdingKpi.status === 403 || holdingKpi.status === 409, {
      status: holdingKpi.status,
      code: holdingKpi.code,
      note: 'du-lich.ceo@xe.vn — expect 403/409 on group rollup',
    });
  }

  const failed = checks.filter((c) => !c.pass);
  const jFailed = Object.entries(journeys).filter(([, v]) => !v.pass);
  console.log(`\n=== L2 checks: ${checks.length - failed.length}/${checks.length} PASS ===`);
  console.log(`=== L2.5 journeys: ${Object.keys(journeys).length - jFailed.length}/${Object.keys(journeys).length} PASS ===`);
  if (failed.length || jFailed.length) {
    console.log('Failed checks:', failed.map((c) => c.id).join(', '));
    console.log('Failed journeys:', jFailed.map(([k]) => k).join(', '));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
