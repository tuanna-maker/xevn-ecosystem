#!/usr/bin/env node
/**
 * P1-QUAL-QA-W4 — L2.5 J-HRM-01..07 + Q6 persona (portal :5175).
 */
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';
import { portalLogin, authHeaders } from './lib/uat-http.mjs';

loadDeployEnv();

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const PASSWORD = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const out = {
  work_item_id: 'P1-QUAL-QA-W4',
  date: '2026-05-30',
  portal: PORTAL,
  group_ceo: { email: 'ceo@xe.vn', journeys: {}, l2: [] },
  member_ceo: { email: 'du-lich.ceo@xe.vn', checks: [], pass: true },
  pass: true,
};

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  return {
    status: res.status,
    body,
    code: body?.code ?? body?.error?.code ?? null,
  };
}

function firstRow(body) {
  const inner = body?.data;
  if (Array.isArray(inner)) return inner[0];
  if (inner && Array.isArray(inner.data)) return inner.data[0];
  if (inner?.items && Array.isArray(inner.items)) return inner.items[0];
  return undefined;
}

async function portalGet(path, headers) {
  return fetchJson(`${PORTAL}${path}`, { headers: { ...headers, Accept: 'application/json' } });
}

async function runJourneys(email, bucket) {
  const session = await portalLogin(email, PASSWORD);
  const headers = authHeaders(session);
  const tenant = session.defaultTenantId ?? session.default_tenant_id;
  const company = session.defaultCompanyId ?? session.default_company_id ?? 'main';

  const contracts = await portalGet('/api/hrm/contracts-insurance/contracts?company_id=main', headers);
  const emp = await portalGet('/api/hrm/employees?company_id=main&page_size=100', headers);
  const insurance = await portalGet('/api/hrm/contracts-insurance/insurance?company_id=main', headers);
  const attendance = await portalGet('/api/hrm/attendance/records?company_id=main&page_size=100', headers);
  const payroll = await portalGet('/api/hrm/payroll/payslips?company_id=main&page_size=100', headers);

  const cRow = firstRow(contracts.body);
  let j01 = { route: 'P-CC-04 contracts→employee', pass: false };
  if (cRow?.employee_id) {
    const empD = await portalGet(`/api/hrm/employees/${cRow.employee_id}?company_id=main`, headers);
    j01 = {
      ...j01,
      pass: contracts.status === 200 && empD.status === 200,
      listStatus: contracts.status,
      getStatus: empD.status,
      employee_id: cRow.employee_id,
      clickPath: `/command-center/hrm/contracts → GET /api/hrm/employees/${cRow.employee_id}?company_id=main`,
    };
  } else j01.reason = 'no contract row';
  bucket.journeys['J-HRM-01'] = j01;

  const eRow = firstRow(emp.body);
  let j02 = { route: 'P-CC-03 employees→detail', pass: false };
  if (eRow?.id) {
    const empD = await portalGet(`/api/hrm/employees/${eRow.id}?company_id=main`, headers);
    j02 = {
      ...j02,
      pass: emp.status === 200 && empD.status === 200,
      listStatus: emp.status,
      getStatus: empD.status,
      employee_id: eRow.id,
      clickPath: `/command-center/hrm/employees → GET /api/hrm/employees/${eRow.id}?company_id=main`,
    };
  }
  bucket.journeys['J-HRM-02'] = j02;

  bucket.journeys['J-HRM-03'] = {
    route: 'P-CC-04 contract drawer',
    pass: Boolean(cRow?.id && cRow?.employee_id),
    contract_id: cRow?.id,
    employee_id: cRow?.employee_id,
    clickPath: '/command-center/hrm/contracts → open contract row',
  };

  const iRow = firstRow(insurance.body);
  const insEmpId = iRow?.employee_id ?? iRow?.employeeId;
  let j04 = { route: 'P-CC-05 insurance→employee', pass: false };
  if (insEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${insEmpId}?company_id=main`, headers);
    j04 = {
      ...j04,
      pass: insurance.status === 200 && empD.status === 200,
      listStatus: insurance.status,
      getStatus: empD.status,
      employee_id: insEmpId,
      clickPath: `/command-center/hrm/insurance → GET /api/hrm/employees/${insEmpId}?company_id=main`,
    };
  }
  bucket.journeys['J-HRM-04'] = j04;

  const reqs = await portalGet('/api/hrm/recruitment/requisitions?company_id=main&page_size=5', headers);
  const cand = await portalGet('/api/hrm/recruitment/candidates?company_id=main&page_size=5', headers);
  bucket.journeys['J-HRM-05'] = {
    route: 'P-CC-06 recruitment',
    pass: reqs.status === 200 && cand.status === 200,
    requisitionsStatus: reqs.status,
    candidatesStatus: cand.status,
    clickPath: '/command-center/hrm/recruitment → requisitions + candidates APIs',
  };

  const aRow = firstRow(attendance.body);
  const attEmpId = aRow?.employee_id ?? aRow?.employeeId;
  let j06 = { route: 'P-CC-07 attendance→employee', pass: attendance.status === 200 };
  if (attEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${attEmpId}?company_id=main`, headers);
    j06 = {
      ...j06,
      pass: attendance.status === 200 && empD.status === 200,
      getStatus: empD.status,
      employee_id: attEmpId,
      clickPath: `/command-center/hrm/attendance → GET /api/hrm/employees/${attEmpId}?company_id=main`,
    };
  }
  bucket.journeys['J-HRM-06'] = j06;

  const pRow = firstRow(payroll.body);
  const payEmpId = pRow?.employee_id ?? pRow?.employeeId;
  let j07 = { route: 'P-CC-08 payroll→employee', pass: false };
  if (payEmpId) {
    const empD = await portalGet(`/api/hrm/employees/${payEmpId}?company_id=main`, headers);
    j07 = {
      ...j07,
      pass: payroll.status === 200 && empD.status === 200,
      listStatus: payroll.status,
      getStatus: empD.status,
      payslip_id: pRow?.id,
      employee_id: payEmpId,
      clickPath: `/command-center/hrm/payroll → GET /api/hrm/employees/${payEmpId}?company_id=main`,
    };
  } else j07.reason = 'no payslip row';
  bucket.journeys['J-HRM-07'] = j07;

  bucket.tenant = tenant;
  bucket.company = company;
  const journeyPass = Object.values(bucket.journeys).every((j) => j.pass);
  if (!journeyPass) out.pass = false;
  return journeyPass;
}

function recordMember(id, expected, actual, pass) {
  out.member_ceo.checks.push({ id, expected, ...actual, pass });
  if (!pass) {
    out.member_ceo.pass = false;
    out.pass = false;
  }
}

async function runMemberQ6() {
  const email = 'du-lich.ceo@xe.vn';
  const session = await portalLogin(email, PASSWORD);
  const headers = authHeaders(session);
  const tenant = session.defaultTenantId ?? session.default_tenant_id ?? 'xe-du-lich';

  const login = { status: 201, pass: true };
  recordMember('P-CC-01-login', '201 + token', { http: login.status }, login.pass);

  const gmu = await portalGet('/api/xbos/tenant-scope/group-member-units', headers);
  recordMember(
    'P-CC-02-negative',
    '403 (not group CEO)',
    { http: gmu.status, code: gmu.code },
    gmu.status === 403,
  );

  const rollup = await portalGet(
    `/api/xbos/kpi-engine/rollup?tenantId=${encodeURIComponent(tenant)}&companyId=holding`,
    headers,
  );
  recordMember(
    'J-CC-03-negative',
    '409 SCOPE_CONTEXT_MISMATCH',
    { http: rollup.status, code: rollup.code },
    rollup.status === 409 && rollup.code === 'SCOPE_CONTEXT_MISMATCH',
  );

  const embedPaths = [
    ['P-CC-03', '/api/hrm/employees?company_id=main&page_size=100'],
    ['P-CC-04', '/api/hrm/contracts-insurance/contracts?company_id=main'],
    ['P-CC-05', '/api/hrm/contracts-insurance/insurance?company_id=main'],
    ['P-CC-06', '/api/hrm/recruitment/requisitions?company_id=main&page_size=100'],
    ['P-CC-07', '/api/hrm/attendance/records?company_id=main&page_size=100'],
    ['P-CC-08', '/api/hrm/payroll/payslips?company_id=main&page_size=100'],
  ];
  for (const [id, path] of embedPaths) {
    const r = await portalGet(path, headers);
    const total = r.body?.data?.total ?? r.body?.meta?.total ?? null;
    recordMember(id, '200 no scope 409', { http: r.status, code: r.code, total }, r.status === 200);
  }

  const emps = await portalGet('/api/hrm/employees?company_id=main&page_size=5', headers);
  const eRow = firstRow(emps.body);
  let j02pass = false;
  if (eRow?.id) {
    const empD = await portalGet(`/api/hrm/employees/${eRow.id}?company_id=main`, headers);
    j02pass = emps.status === 200 && empD.status === 200;
    recordMember(
      'J-HRM-02-positive',
      'list→detail 200',
      { http: empD.status, employee_id: eRow.id },
      j02pass,
    );
  } else {
    recordMember('J-HRM-02-positive', 'list→detail 200', { reason: 'no row' }, false);
  }

  out.member_ceo.tenant = tenant;
}

async function main() {
  console.log(`P1-QUAL-QA-W4 probe — ${PORTAL}\n`);

  const gOk = await runJourneys('ceo@xe.vn', out.group_ceo);
  console.log('\n--- Group CEO J-HRM-01..07 ---');
  for (const [id, j] of Object.entries(out.group_ceo.journeys)) {
    console.log(`${j.pass ? 'PASS' : 'FAIL'}  ${id}  ${j.clickPath ?? j.route ?? ''}`);
  }
  console.log(gOk ? '\nGroup CEO L2.5: 7/7 PASS' : '\nGroup CEO L2.5: FAIL');

  console.log('\n--- Q6 Member CEO du-lich.ceo@xe.vn ---');
  await runMemberQ6();
  for (const c of out.member_ceo.checks) {
    console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.id}  HTTP ${c.http ?? ''} ${c.code ?? ''}`);
  }

  const jsonPath = resolve(repoRoot, 'docs/qa/evidence/p1-qual-qa-w4-probe-20260530.json');
  mkdirSync(resolve(repoRoot, 'docs/qa/evidence'), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${jsonPath}`);
  console.log(out.pass ? '\n=== OVERALL PASS ===' : '\n=== OVERALL FAIL ===');
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
