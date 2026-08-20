#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01
 * L1 smoke R-PAY-PAYSLIP-LINES-GET after BE ADD
 * U65 zero-seed · payroll_e2e_ready=false · no LIVE / module UAT / J-HRM-07
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const CEO_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `PAYSLIPGET-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return {
      tenantId: payload.tenantId || payload.tenant_id || null,
      companyId: payload.companyId || payload.company_id || payload?.scope?.companyId || null,
      sub: payload.sub || null,
      roleCode: payload.roleCode || payload.role_code || null,
    };
  } catch {
    return { tenantId: null, companyId: null, sub: null, roleCode: null };
  }
}

async function login(email, password = PASSWORD) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
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
  return { ok: true, status: r.status, token, claims: decodeJwt(token), body: null };
}

async function call(token, method, path, { query, body, companyId = COMPANY, tenantId = 'xevn', headerCompanyId } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
    'x-company-id': headerCompanyId ?? companyId,
    Accept: 'application/json',
  };
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
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? null,
    message: json?.message ?? null,
    dataSummary: summarizeBody(json?.data ?? json, 800),
    data: json?.data ?? null,
    json,
  };
}

function listRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}

async function main() {
  const steps = [];
  const ac = {};

  // L0 health
  const health = await fetch(`${HRM}`).then(async (r) => ({ status: r.status, text: await r.text() })).catch((e) => ({ status: 0, text: String(e) }));
  steps.push({ step: 'L0_hrm_health', status: health.status });
  ac.L0 = passFail(health.status === 200, `HRM health ${health.status}`);

  const ceo = await login(CEO_EMAIL);
  steps.push({ step: 'login_ceo', ok: ceo.ok, status: ceo.status });
  if (!ceo.ok) {
    const out = { stamp: STAMP, ack_status: 'FAIL_TO_PM', ac, steps, error: 'ceo login failed' };
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    console.log(JSON.stringify(out, null, 2));
    process.exit(1);
  }

  // List periods (optional) + list payslips main
  const periods = await call(ceo.token, 'GET', '/payroll/periods', { query: { company_id: COMPANY, page_size: 50 } });
  steps.push({
    step: 'list_periods',
    status: periods.status,
    code: periods.code,
    summary: periods.dataSummary,
  });

  const payslips = await call(ceo.token, 'GET', '/payroll/payslips', {
    query: { company_id: COMPANY, page_size: 50 },
    companyId: COMPANY,
    tenantId: ceo.claims?.tenantId || 'xevn',
  });
  const rows = listRows(payslips.data);
  const processed = rows.filter((r) => String(r.status || '').toLowerCase() === 'processed');
  const pick = processed[0] || rows[0] || null;
  steps.push({
    step: 'list_payslips',
    status: payslips.status,
    code: payslips.code,
    total: payslips.data?.total ?? rows.length,
    rows: rows.length,
    processed: processed.length,
    pick: pick
      ? {
          id: pick.id,
          status: pick.status,
          period_id: pick.period_id,
          employee_id: pick.employee_id,
          gross: pick.gross_amount ?? pick.gross,
          net: pick.net_amount ?? pick.net,
        }
      : null,
    summary: payslips.dataSummary,
  });
  ac.AC_LIST = passFail(payslips.status === 200 && !!pick, pick ? `picked ${pick.id} status=${pick.status}` : 'no payslip rows');

  let getById = null;
  let getLines = null;
  if (pick?.id) {
    // Prefer period-scoped list if we have period_id (mission)
    if (pick.period_id) {
      const scoped = await call(ceo.token, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: pick.period_id, page_size: 50 },
      });
      steps.push({
        step: 'list_payslips_period',
        status: scoped.status,
        code: scoped.code,
        period_id: pick.period_id,
        rows: listRows(scoped.data).length,
        summary: scoped.dataSummary,
      });
    }

    getById = await call(ceo.token, 'GET', `/payroll/payslips/${pick.id}`, {
      query: { company_id: COMPANY },
    });
    const comps = getById.data?.components;
    const lines = getById.data?.lines;
    const hasArrays = Array.isArray(comps) || Array.isArray(lines);
    const lineArr = Array.isArray(lines) ? lines : Array.isArray(comps) ? comps : null;
    steps.push({
      step: 'get_payslip_by_id',
      status: getById.status,
      code: getById.code,
      components_len: Array.isArray(comps) ? comps.length : null,
      lines_len: Array.isArray(lines) ? lines.length : null,
      summary: getById.dataSummary,
    });
    ac.AC_GET_BY_ID = passFail(
      getById.status === 200 && getById.code === 'HRM-PAY-200' && hasArrays,
      `status=${getById.status} code=${getById.code} arrays=${hasArrays} lines=${lineArr?.length ?? 'n/a'}`,
    );

    getLines = await call(ceo.token, 'GET', `/payroll/payslips/${pick.id}/lines`, {
      query: { company_id: COMPANY },
    });
    const linesTotal = getLines.data?.total;
    const linesData = Array.isArray(getLines.data?.data) ? getLines.data.data : null;
    const byIdCount = Array.isArray(lines) ? lines.length : Array.isArray(comps) ? comps.length : null;
    const totalMatches =
      linesData != null &&
      (linesTotal === linesData.length || Number(linesTotal) === linesData.length) &&
      (byIdCount == null || Number(linesTotal) === byIdCount || linesData.length === byIdCount);
    steps.push({
      step: 'get_payslip_lines',
      status: getLines.status,
      code: getLines.code,
      total: linesTotal,
      data_len: linesData?.length ?? null,
      total_matches_by_id: totalMatches,
      summary: getLines.dataSummary,
    });
    ac.AC_GET_LINES = passFail(
      getLines.status === 200 &&
        (getLines.code === 'HRM-PAY-200' || getLines.code == null || String(getLines.code).startsWith('HRM-PAY')) &&
        linesData != null &&
        totalMatches,
      `status=${getLines.status} code=${getLines.code} total=${linesTotal} data=${linesData?.length} match=${totalMatches}`,
    );
  } else {
    ac.AC_GET_BY_ID = passFail(false, 'skipped — no payslip');
    ac.AC_GET_LINES = passFail(false, 'skipped — no payslip');
  }

  // Scope miss: member CEO (correct tenant/company headers) → 404 HRM-PAY-404 on out-of-scope payslip
  // Also: group CEO + unknown UUID → 404 HRM-PAY-404 (no leak)
  const member = await login(MEMBER_EMAIL);
  steps.push({
    step: 'login_member',
    ok: member.ok,
    status: member.status,
    claims: member.claims,
  });
  const missingId = '00000000-0000-4000-8000-000000000099';
  const missing = await call(ceo.token, 'GET', `/payroll/payslips/${missingId}`, {
    query: { company_id: COMPANY },
    companyId: COMPANY,
    tenantId: 'xevn',
  });
  steps.push({
    step: 'scope_miss_unknown_uuid_ceo',
    status: missing.status,
    code: missing.code,
    summary: missing.dataSummary,
  });

  let scopeMiss = null;
  if (member.ok && pick?.id) {
    const mTenant = member.claims?.tenantId || 'xe-du-lich';
    const mCompany = member.claims?.companyId || 'main';
    // Jest parity: member token + company_id=main → out-of-scope holding payslip → HRM-PAY-404
    scopeMiss = await call(member.token, 'GET', `/payroll/payslips/${pick.id}`, {
      query: { company_id: mCompany },
      companyId: mCompany,
      tenantId: mTenant,
      headerCompanyId: mCompany,
    });
    steps.push({
      step: 'scope_miss_member_ceo',
      status: scopeMiss.status,
      code: scopeMiss.code,
      tenant: mTenant,
      company: mCompany,
      summary: scopeMiss.dataSummary,
    });
    // lines path same gate
    const scopeMissLines = await call(member.token, 'GET', `/payroll/payslips/${pick.id}/lines`, {
      query: { company_id: mCompany },
      companyId: mCompany,
      tenantId: mTenant,
      headerCompanyId: mCompany,
    });
    steps.push({
      step: 'scope_miss_member_ceo_lines',
      status: scopeMissLines.status,
      code: scopeMissLines.code,
      summary: scopeMissLines.dataSummary,
    });
    const missOk =
      (scopeMiss.status === 404 && String(scopeMiss.code || '').includes('HRM-PAY-404')) &&
      (scopeMissLines.status === 404 && String(scopeMissLines.code || '').includes('HRM-PAY-404'));
    const missingOk = missing.status === 404 && String(missing.code || '').includes('HRM-PAY-404');
    ac.AC_SCOPE_404 = passFail(
      missOk && missingOk,
      `member=${scopeMiss.status}/${scopeMiss.code}; memberLines=${scopeMissLines.status}/${scopeMissLines.code}; missing=${missing.status}/${missing.code}`,
    );
  } else {
    const missingOk = missing.status === 404 && String(missing.code || '').includes('HRM-PAY-404');
    ac.AC_SCOPE_404 = passFail(missingOk && !pick?.id === false, `missing=${missing.status}/${missing.code}; member_login=${member.ok}`);
  }

  // Auth gate smoke (optional)
  const noAuth = await fetch(`${HRM}/payroll/payslips/${pick?.id || '00000000-0000-4000-8000-000000000001'}?company_id=main`);
  const noAuthBody = await noAuth.text();
  steps.push({ step: 'no_auth', status: noAuth.status, body: noAuthBody.slice(0, 200) });
  ac.AC_AUTH = passFail(noAuth.status === 401, `status=${noAuth.status}`);

  const corePass =
    ac.L0?.ok && ac.AC_LIST?.ok && ac.AC_GET_BY_ID?.ok && ac.AC_GET_LINES?.ok && ac.AC_SCOPE_404?.ok;
  const out = {
    work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01',
    stamp: STAMP,
    date: new Date().toISOString(),
    honesty: {
      payroll_e2e_ready: false,
      seed: false,
      formula_LIVE: 'DENIED',
      module_UAT: 'DENIED',
      'J-HRM-07': 'DENIED',
      reopen_ATT_CB_FE_EVAL: 'RETAINED_CLOSED',
    },
    ac,
    steps,
    verdict: corePass ? 'PASS' : 'FAIL',
    ack_status: corePass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    residual_closed: corePass ? ['R-PAY-PAYSLIP-LINES-GET'] : [],
    residual_open: corePass ? [] : ['R-PAY-PAYSLIP-LINES-GET'],
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  process.exit(corePass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
