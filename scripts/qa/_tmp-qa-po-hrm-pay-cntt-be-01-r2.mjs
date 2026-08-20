#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-CNTT-BE-01-R2 — L1 API retest after D-PAY-CNTT-BE-COMPILE-01
 * U65 zero-seed · payroll_e2e_ready=false · company_id snake_case bodies
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `CNTTBER2QA-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-be-01-r2.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ts = () => new Date().toISOString();
function summarizeBody(body, max = 900) {
  if (body === undefined || body === null) return '';
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}
function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function login(email, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `http://127.0.0.1:28002/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (token) return { ok: true, status: r.status, token, via: url };
    } catch {
      /* next */
    }
  }
  return { ok: false, status: 0, token: null };
}

async function call(token, method, path, { query, body, companyId = COMPANY, tenantId = 'xevn' } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
    'x-company-id': companyId,
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
    json = { _raw: text };
  }
  const data = json?.data ?? json;
  return {
    status: r.status,
    ok: r.ok,
    code: json?.code ?? null,
    message: json?.message ?? null,
    data,
    body: summarizeBody(json),
  };
}

const report = {
  work_item_id: 'QA-PO-HRM-PAY-CNTT-BE-01-R2',
  parent: 'PO-HRM-PAY-CNTT-BE-01',
  stamp: STAMP,
  generatedAt: ts(),
  honesty: { payroll_e2e_ready: false, formula_eval: 'HOLD', zero_seed: true },
  steps: [],
  ac: {},
};

function pushStep(name, detail) {
  report.steps.push({ at: ts(), name, ...detail });
}

async function main() {
  const auth = await login(EMAIL);
  pushStep('login_ceo', auth);
  if (!auth.ok) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: 'login_failed' };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    process.exit(2);
  }
  const token = auth.token;

  const polCode = `qa_pol_${STAMP.toLowerCase()}`;
  const polCreate = await call(token, 'POST', '/payroll/pay-policy-packs', {
    body: {
      company_id: COMPANY,
      code: polCode,
      nameVi: `Gói QA chính sách ${STAMP}`,
      scope: 'CHUNG',
      business_line_tag: 'DPHH',
      effectiveFrom: '2026-01-01',
      rateParams: { kpi_threshold_1500: 1500 },
    },
  });
  const polId = polCreate.data?.id ?? null;
  pushStep('post_policy_pack', { status: polCreate.status, code: polCreate.code, polId });

  const polList = await call(token, 'GET', '/payroll/pay-policy-packs', {
    query: { company_id: COMPANY },
  });
  const polInList = asList(polList.data).some((p) => p.id === polId || p.code === polCode);
  pushStep('get_policy_pack_list', { status: polList.status, count: asList(polList.data).length, polInList });

  report.ac.ac_cntt_setup_02 = passFail(
    polCreate.status === 201 &&
      (polCreate.code === 'HRM-PAY-POL-201' || polCreate.ok) &&
      polList.status === 200 &&
      polInList,
    `create=${polCreate.status}/${polCreate.code} list=${polList.status} inList=${polInList}`,
  );

  const profCode = `qa_inp_${STAMP.toLowerCase()}`;
  const profCreate = await call(token, 'POST', '/payroll/pay-input-pack-profiles', {
    body: {
      company_id: COMPANY,
      code: profCode,
      nameVi: `Profile QA nhập liệu ${STAMP}`,
      allowedSourceKinds: ['manual', 'kpi'],
      requiredComponentCodes: [],
    },
  });
  const profId = profCreate.data?.id ?? null;
  pushStep('post_input_profile', { status: profCreate.status, code: profCreate.code, profId });

  const profList = await call(token, 'GET', '/payroll/pay-input-pack-profiles', {
    query: { company_id: COMPANY },
  });
  const profInList = asList(profList.data).some((p) => p.id === profId || p.code === profCode);
  pushStep('get_input_profile_list', { status: profList.status, count: asList(profList.data).length, profInList });

  report.ac.ac_cntt_setup_04_profile = passFail(
    profCreate.status === 201 &&
      (profCreate.code === 'HRM-PAY-INP-PROF-201' || profCreate.ok) &&
      profList.status === 200 &&
      profInList,
    `create=${profCreate.status}/${profCreate.code} list=${profList.status}`,
  );

  const resolve = await call(token, 'GET', '/payroll/pay-setup/resolve', {
    query: { company_id: COMPANY, business_line_tag: 'DPHH' },
  });
  pushStep('get_pay_setup_resolve', {
    status: resolve.status,
    code: resolve.code,
    hasRecommended: Boolean(resolve.data?.recommended),
  });
  report.ac.f_pay_setup_resolve = passFail(resolve.status === 200, `resolve=${resolve.status}/${resolve.code}`);

  const tplCode = `qa_tpl_cntt_${STAMP.toLowerCase()}`;
  const tplCreate = await call(token, 'POST', '/payroll/pay-sheet-templates', {
    body: {
      company_id: COMPANY,
      code: tplCode,
      name: `QA mẫu CNTT ${STAMP}`,
      status: 'active',
      applicabilityScope: 'company',
      business_line_tag: 'DPHH',
      policyPackId: polId,
      inputPackProfileId: profId,
    },
  });
  const tplId = tplCreate.data?.id ?? null;
  pushStep('create_template_with_fks', { status: tplCreate.status, code: tplCreate.code, tplId });

  const comps = await call(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } });
  const c1 = asList(comps.data)[0];
  if (tplId && c1?.id) {
    await call(token, 'PUT', `/payroll/pay-sheet-templates/${tplId}/lines`, {
      body: {
        company_id: COMPANY,
        lines: [{ componentId: c1.id, displayLabel: `CNTT col ${STAMP}`, sortOrder: 1 }],
      },
    });
  }

  const label = `QA-CNTT-${STAMP}`;
  let periodCreate = { status: 0, code: null, data: null, message: null, body: '' };
  let periodId = null;
  let snapshot = null;
  let setupContext = null;
  for (const month of [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5]) {
    const year = month <= 5 ? 2027 : 2026;
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    periodCreate = await call(token, 'POST', '/payroll/periods', {
      body: {
        company_id: COMPANY,
        period_label: `${label}-${year}${String(month).padStart(2, '0')}`,
        start_date: start,
        end_date: end,
        created_by: EMAIL,
        paySheetTemplateId: tplId,
      },
    });
    if (periodCreate.status === 201 || periodCreate.status === 200) {
      periodId = periodCreate.data?.id ?? null;
      snapshot =
        periodCreate.data?.sheet_template_snapshot_json ??
        periodCreate.data?.sheetTemplateSnapshotJson ??
        null;
      setupContext = snapshot?.setupContext ?? null;
      pushStep('create_period_with_setupContext', {
        status: periodCreate.status,
        code: periodCreate.code,
        periodId,
        month: `${year}-${String(month).padStart(2, '0')}`,
        hasSnapshot: Boolean(snapshot),
        setupContext,
      });
      break;
    }
    if (periodCreate.status !== 409) {
      pushStep('create_period_with_setupContext', {
        status: periodCreate.status,
        code: periodCreate.code,
        month: `${year}-${String(month).padStart(2, '0')}`,
        body: periodCreate.body,
      });
      break;
    }
  }
  if (!periodId && periodCreate.status === 409) {
    pushStep('create_period_with_setupContext', {
      status: periodCreate.status,
      code: periodCreate.code,
      note: 'all candidate months overlapped',
    });
  }

  const setupOk =
    Boolean(tplId) &&
    (periodCreate.status === 201 || periodCreate.status === 200) &&
    setupContext &&
    (setupContext.policyPackId === polId || setupContext.policyPackCode === polCode) &&
    (setupContext.inputPackProfileId === profId || setupContext.inputPackProfileCode === profCode) &&
    Array.isArray(setupContext.allowedSourceKinds) &&
    setupContext.allowedSourceKinds.includes('manual') &&
    setupContext.allowedSourceKinds.includes('kpi');
  report.ac.ac_cntt_setup_03 = passFail(
    setupOk,
    `period=${periodCreate.status} setupContext=${Boolean(setupContext)} policy=${setupContext?.policyPackId} profile=${setupContext?.inputPackProfileId} kinds=${JSON.stringify(setupContext?.allowedSourceKinds)}`,
  );

  let inp422 = { status: 0, code: null };
  if (periodId) {
    const emps = await call(token, 'GET', '/employees', { query: { company_id: COMPANY, page_size: 1 } });
    const empRows = asList(emps.data);
    const empId = empRows[0]?.id ?? empRows[0]?.employee_id ?? empRows[0]?.employeeId ?? null;
    pushStep('pick_employee_for_input_line', { empCount: empRows.length, empId, via: '/employees' });
    if (empId) {
      const compCode = c1?.code ?? asList(comps.data)[0]?.code ?? 'bonus';
      inp422 = await call(token, 'POST', `/payroll/periods/${periodId}/input-lines`, {
        body: {
          employeeId: empId,
          componentCode: compCode,
          amount: 1000000,
          sourceKind: 'revenue',
          note: `QA reject revenue ${STAMP}`,
        },
      });
    } else {
      inp422 = { status: 0, code: 'NO_EMP', message: 'no employee for input-line probe' };
    }
  }
  pushStep('post_input_line_revenue_reject', inp422);
  const msg422 = `${inp422.message || ''} ${inp422.body || ''}`;
  report.ac.hrm_pay_inp_profile_422 = passFail(
    inp422.status === 422 &&
      (inp422.code === 'HRM-PAY-INP-PROFILE-422' || /HRM-PAY-INP-PROFILE-422/.test(msg422)),
    `status=${inp422.status} code=${inp422.code} msg=${summarizeBody(inp422.message || inp422.body, 200)}`,
  );

  let memberAuth = await login(MEMBER_EMAIL);
  pushStep('login_member_ceo', memberAuth);
  let scopeParityOk = false;
  if (polId && memberAuth.ok) {
    const memberGet = await call(memberAuth.token, 'GET', `/payroll/pay-policy-packs/${polId}`, {
      query: { company_id: COMPANY },
      tenantId: 'xe-du-lich',
    });
    pushStep('scope_parity_member_get', {
      memberGetStatus: memberGet.status,
      memberGetCode: memberGet.code,
    });
    scopeParityOk =
      polList.status === 200 &&
      polInList &&
      memberGet.status === 404 &&
      (memberGet.code === 'HRM-PAY-POL-404' || memberGet.code === 'HRM-NOT-FOUND' || memberGet.code === 'HRM-DATA-404');
  }
  report.ac.scope_parity_u19 = passFail(scopeParityOk, `mainList=${polList.status} memberGet=${scopeParityOk}`);

  const allPass = Object.values(report.ac).every((a) => a.ok);
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    payroll_e2e_ready: false,
    browser: 'NOT_PROMOTED — FE Thiết lập hub not wired (grep apps/web: 0 pay-policy-packs)',
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ stamp: STAMP, verdict: report.overall.verdict, ack: report.overall.ack_status, ac: report.ac }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
