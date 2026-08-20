#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-ESS-QA-01
 * L1 smoke AMIS step6 ESS payslip — U65 zero-seed · payroll_e2e_ready=false
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const ESS_EMAIL = process.env.QA_ESS_EMAIL || 'uat.nv0001@xe.vn';
const ESS_PASS = process.env.QA_ESS_PASSWORD || 'xevn-uat-2026';
const CEO_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const CEO_PASS = process.env.QA_PASSWORD || 'Xevn@2026';
const STAMP = `PAYESS-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-ess-qa-01.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 1200) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return {
      tenantId: payload.tenantId || payload.tenant_id || null,
      companyId: payload.companyId || payload.company_id || null,
      employee_id: payload.employee_id || payload.employeeId || null,
      sub: payload.sub || null,
      roleCode: payload.roleCode || payload.role_code || null,
    };
  } catch {
    return { tenantId: null, companyId: null, employee_id: null, sub: null, roleCode: null };
  }
}

async function mobileLogin(email, password) {
  const r = await fetch(`${HRM}/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || j;
  const token = d.accessToken || d.access_token;
  if (!r.ok || !token) {
    return {
      ok: false,
      status: r.status,
      code: j.code || null,
      body: summarizeBody(j),
      token: null,
      claims: null,
      data: d,
    };
  }
  return {
    ok: true,
    status: r.status,
    code: j.code || null,
    token,
    claims: decodeJwt(token),
    data: {
      employee_id: d.employee_id || d.employeeId || null,
      company_id: d.company_id || d.companyId || null,
      memberships_count: Array.isArray(d.memberships) ? d.memberships.length : null,
    },
  };
}

async function portalLogin(email, password) {
  const r = await fetch(`${XBOS}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || j;
  const token = d.accessToken || d.access_token;
  if (!r.ok || !token) {
    return { ok: false, status: r.status, body: summarizeBody(j), token: null, claims: null };
  }
  return { ok: true, status: r.status, token, claims: decodeJwt(token) };
}

async function call(token, method, path, { query, body, companyId, tenantId = 'xevn' } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
    Accept: 'application/json',
  };
  if (companyId) headers['x-company-id'] = companyId;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return {
    status: r.status,
    code: json?.code ?? null,
    message: json?.message ?? null,
    data: json?.data ?? null,
    body: summarizeBody(json),
    json,
  };
}

function passFail(ok, detail) {
  return { ok: Boolean(ok), detail };
}

async function main() {
  const cases = {};
  const startedAt = new Date().toISOString();

  const health = await fetch(`${HRM}`).then((r) => r.status).catch((e) => `ERR:${e.message}`);
  cases.L0_HRM = passFail(health === 200, `GET /api/hrm → ${health}`);

  const essLogin = await mobileLogin(ESS_EMAIL, ESS_PASS);
  cases.AC1_MOBILE_LOGIN = passFail(
    essLogin.ok && Boolean(essLogin.claims?.employee_id),
    `status=${essLogin.status} code=${essLogin.code} claims.employee_id=${essLogin.claims?.employee_id || 'MISSING'} companyId=${essLogin.claims?.companyId} body=${essLogin.body || ''}`,
  );

  const essEmpId = essLogin.claims?.employee_id || null;
  const essCompany = essLogin.claims?.companyId || 'holding';
  const listCompany = 'holding';

  let listRes = null;
  let ownRowsOnly = false;
  let processed = null;
  if (essLogin.ok) {
    listRes = await call(essLogin.token, 'GET', '/payroll/me/payslips', {
      query: { company_id: listCompany },
      companyId: listCompany,
      tenantId: essLogin.claims?.tenantId || 'xevn',
    });
    const rows = listRes.data?.data || listRes.data?.items || (Array.isArray(listRes.data) ? listRes.data : []);
    const total = listRes.data?.total ?? rows.length;
    ownRowsOnly =
      listRes.status === 200 &&
      listRes.code === 'HRM-PAY-200' &&
      Array.isArray(rows) &&
      rows.every((r) => !essEmpId || r.employee_id === essEmpId);
    processed = rows.find((r) => r.status === 'processed' || r.status === 'paid') || rows[0] || null;
    cases.AC2_LIST_OWN = passFail(
      ownRowsOnly,
      `status=${listRes.status} code=${listRes.code} total=${total} rows=${rows.length} ownOnly=${ownRowsOnly} sampleEmp=${rows[0]?.employee_id || 'n/a'} status0=${rows[0]?.status || 'n/a'}`,
    );
  } else {
    cases.AC2_LIST_OWN = passFail(false, 'skipped — mobile login failed');
  }

  let getRes = null;
  if (essLogin.ok && processed?.id) {
    getRes = await call(essLogin.token, 'GET', `/payroll/me/payslips/${processed.id}`, {
      query: { company_id: listCompany },
      companyId: listCompany,
      tenantId: essLogin.claims?.tenantId || 'xevn',
    });
    const hasComponents = Array.isArray(getRes.data?.components);
    const hasLines = Array.isArray(getRes.data?.lines);
    const hasEssFlag = typeof getRes.data?.ess_confirmed === 'boolean';
    cases.AC3_GET_BY_ID = passFail(
      getRes.status === 200 && getRes.code === 'HRM-PAY-200' && hasComponents && hasLines && hasEssFlag,
      `status=${getRes.status} code=${getRes.code} components=${getRes.data?.components?.length} lines=${getRes.data?.lines?.length} ess_confirmed=${getRes.data?.ess_confirmed} employee_confirmed_at=${getRes.data?.employee_confirmed_at}`,
    );
  } else {
    cases.AC3_GET_BY_ID = passFail(
      false,
      `skipped — no own payslip (list status=${listRes?.status} total=${listRes?.data?.total ?? 'n/a'})`,
    );
  }

  let confirmRes = null;
  let f5Res = null;
  if (essLogin.ok && processed?.id && getRes?.status === 200) {
    const beforeConfirmed = Boolean(getRes.data?.ess_confirmed);
    confirmRes = await call(essLogin.token, 'POST', `/payroll/me/payslips/${processed.id}/confirm`, {
      query: { company_id: listCompany },
      companyId: listCompany,
      tenantId: essLogin.claims?.tenantId || 'xevn',
      body: {},
    });
    f5Res = await call(essLogin.token, 'GET', `/payroll/me/payslips/${processed.id}`, {
      query: { company_id: listCompany },
      companyId: listCompany,
      tenantId: essLogin.claims?.tenantId || 'xevn',
    });
    // Nest POST default = 201; paper/BE claim 200 — accept 2xx + HRM-PAY-204-ESS (OBS residual).
    const confirmOk =
      confirmRes.status >= 200 &&
      confirmRes.status < 300 &&
      confirmRes.code === 'HRM-PAY-204-ESS' &&
      confirmRes.data?.ess_confirmed === true;
    const f5Ok =
      f5Res.status === 200 &&
      f5Res.data?.ess_confirmed === true &&
      Boolean(f5Res.data?.employee_confirmed_at);
    cases.AC4_CONFIRM_F5 = passFail(
      confirmOk && f5Ok,
      `before=${beforeConfirmed} confirm status=${confirmRes.status} code=${confirmRes.code} ess=${confirmRes.data?.ess_confirmed} F5 status=${f5Res.status} ess=${f5Res.data?.ess_confirmed} confirmed_at=${f5Res.data?.employee_confirmed_at} http_obs=${confirmRes.status === 201 ? 'NEST_POST_201_vs_paper_200' : 'ok'}`,
    );
  } else {
    cases.AC4_CONFIRM_F5 = passFail(false, 'skipped — no GET-by-id PASS or no processed id');
  }

  const ceoLogin = await portalLogin(CEO_EMAIL, CEO_PASS);
  let ceoEss = null;
  if (ceoLogin.ok) {
    ceoEss = await call(ceoLogin.token, 'GET', '/payroll/me/payslips', {
      query: { company_id: 'holding' },
      companyId: 'holding',
      tenantId: ceoLogin.claims?.tenantId || 'xevn',
    });
    cases.AC5_CEO_NO_EMP = passFail(
      ceoEss.status === 403 && ceoEss.code === 'HRM-PAY-403-ESS',
      `ceo.employee_id=${ceoLogin.claims?.employee_id || 'null'} status=${ceoEss.status} code=${ceoEss.code} msg=${ceoEss.message}`,
    );
  } else {
    cases.AC5_CEO_NO_EMP = passFail(false, `ceo login failed status=${ceoLogin.status} ${ceoLogin.body}`);
  }

  // Cross-employee: CEO lists payslips (admin) → pick other employee id → ESS GET → 403
  let crossRes = null;
  if (essLogin.ok && ceoLogin.ok) {
    const adminList = await call(ceoLogin.token, 'GET', '/payroll/payslips', {
      query: { company_id: 'holding', page_size: '50' },
      companyId: 'holding',
      tenantId: 'xevn',
    });
    const adminRows = adminList.data?.data || [];
    const foreign =
      adminRows.find((r) => essEmpId && r.employee_id && r.employee_id !== essEmpId) || null;
    if (foreign?.id) {
      crossRes = await call(essLogin.token, 'GET', `/payroll/me/payslips/${foreign.id}`, {
        query: { company_id: listCompany },
        companyId: listCompany,
        tenantId: essLogin.claims?.tenantId || 'xevn',
      });
      cases.AC6_CROSS_EMP = passFail(
        crossRes.status === 403 && crossRes.code === 'HRM-PAY-403-ESS',
        `foreign.id=${foreign.id} foreign.emp=${foreign.employee_id} foreign.co=${foreign.company_id} ess.emp=${essEmpId} status=${crossRes.status} code=${crossRes.code} msg=${crossRes.message}`,
      );
    } else {
      cases.AC6_CROSS_EMP = passFail(
        false,
        `no foreign payslip found (adminList status=${adminList.status} code=${adminList.code} total=${adminList.data?.total} essEmp=${essEmpId})`,
      );
    }
  } else {
    cases.AC6_CROSS_EMP = passFail(false, 'skipped — login failed');
  }

  const acKeys = ['AC1_MOBILE_LOGIN', 'AC2_LIST_OWN', 'AC3_GET_BY_ID', 'AC4_CONFIRM_F5', 'AC5_CEO_NO_EMP', 'AC6_CROSS_EMP'];
  const allPass = cases.L0_HRM.ok && acKeys.every((k) => cases[k]?.ok);
  const verdict = allPass ? 'PASS' : 'FAIL';
  const ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';

  const report = {
    work_item_id: 'PO-HRM-AMIS-PARITY-PAY-ESS-QA-01',
    stamp: STAMP,
    startedAt,
    finishedAt: new Date().toISOString(),
    honesty: {
      payroll_e2e_ready: false,
      seed: false,
      module_uat: false,
      j_hrm_07: false,
      amis_parity_done: false,
    },
    personas: {
      ess: { email: ESS_EMAIL, claims: essLogin.claims, data: essLogin.data },
      ceo: { email: CEO_EMAIL, claims: ceoLogin.claims },
    },
    picks: {
      listCompany,
      payslipId: processed?.id || null,
      payslipStatus: processed?.status || null,
      payslipEmployeeId: processed?.employee_id || null,
    },
    cases,
    verdict,
    ack_status,
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ stamp: STAMP, verdict, ack_status, cases, out: OUT }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
