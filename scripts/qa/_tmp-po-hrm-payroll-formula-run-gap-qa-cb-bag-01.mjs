#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01 — L1 R-PAY-F-CB-BAG retest
 * U65 zero-seed · payroll_e2e_ready=false · cấm claim formula LIVE
 *
 * AC-CB1 PROCESS + published gd1_eval_v1 + real CORE C&B base_salary (no variableOverrides)
 *         → 2xx + payroll_payslip_lines (or BLOCKED if product C&B create fails — no seed)
 * AC-CB2 PROCESS missing C&B → HRM-PAY-FORMULA-412-VARS (no silent 0₫)
 * AC-CB3 ATT-412 retained on open month
 * AC-CB4 FORMULA-412 retained when no active published formula
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const AUTHOR_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PUBLISHER_EMAIL = process.env.QA_PUBLISHER_EMAIL || 'admin@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `PAYFECB-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeSub(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub ?? null;
  } catch {
    return null;
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
    return { ok: false, status: r.status, body: summarizeBody(j), token: null, sub: null };
  }
  return { ok: true, status: r.status, token, sub: decodeSub(token), body: null };
}

async function call(token, method, path, { query, body, companyId = COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
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
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? null,
    message: json?.message ?? null,
    dataSummary: summarizeBody(json?.data ?? json, 700),
    data: json?.data ?? null,
    details: json?.details ?? json?.data?.details ?? null,
    json,
  };
}

function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}

function listRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function monthBoundsFromSheetStart(iso) {
  const d = new Date(iso);
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  const [yy, mm] = ymd.split('-');
  const lastDay = new Date(Number(yy), Number(mm), 0).getDate();
  return {
    start: `${yy}-${mm}-01`,
    end: `${yy}-${mm}-${String(lastDay).padStart(2, '0')}`,
    ymd,
  };
}

const GD1_EVAL_EXPR = {
  form: 'gd1_eval_v1',
  lines: [
    { component_code: 'BASE', sign: 'earning', source: 'var', var: 'base_salary' },
    {
      component_code: 'DED_SAMPLE',
      sign: 'deduction',
      source: 'expr',
      expr: { op: 'mul', left: 'base_salary', right: 0.1 },
    },
  ],
};

const report = {
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01',
  stamp: STAMP,
  lane: 'L1_API_R-PAY-F-CB-BAG',
  portal_url: PORTAL,
  u65: 'zero-seed · product-path C&B POST allowed (≠ pnpm seed) · cấm claim formula LIVE',
  honesty: { payroll_e2e_ready: false, formula_live: false, browser_uf: false },
  author: AUTHOR_EMAIL,
  publisher: PUBLISHER_EMAIL,
  company_id: COMPANY,
  startedAt: new Date().toISOString(),
  dist_rebuild: true,
  checks: {},
  steps: [],
};

try {
  const authorLogin = await login(AUTHOR_EMAIL);
  report.author_login = {
    ok: authorLogin.ok,
    status: authorLogin.status,
    sub: authorLogin.sub,
    err: authorLogin.body,
  };
  if (!authorLogin.ok) throw new Error(`author login fail ${authorLogin.status}`);

  const publisherLogin = await login(PUBLISHER_EMAIL);
  report.publisher_login = {
    ok: publisherLogin.ok,
    status: publisherLogin.status,
    sub: publisherLogin.sub,
    err: publisherLogin.body,
  };
  if (!publisherLogin.ok) throw new Error(`publisher login fail ${publisherLogin.status}`);
  if (publisherLogin.sub === authorLogin.sub) {
    throw new Error('publisher sub must differ from author for dual-control');
  }

  const authorTok = authorLogin.token;
  const pubTok = publisherLogin.token;

  const probe = await call(authorTok, 'GET', '/payroll/formulas', {
    query: { company_id: COMPANY },
  });
  report.steps.push({ name: 'probe_formulas_live', ...probe });
  report.checks.dist_formulas_live = passFail(
    probe.status === 200 && probe.code === 'HRM-PAY-FORMULA-200',
    `HTTP ${probe.status} code=${probe.code}`,
  );
  if (!report.checks.dist_formulas_live.ok) {
    throw new Error('formulas route stale/missing — rebuild required');
  }

  // Inventory live C&B (U65 — prefer existing; else product POST)
  const pkgsMain = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages', {
    query: { company_id: COMPANY },
  });
  const pkgsHolding = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages', {
    query: { company_id: 'holding' },
  });
  report.steps.push({ name: 'list_comp_packages_main', ...pkgsMain });
  report.steps.push({ name: 'list_comp_packages_holding', ...pkgsHolding });
  const livePkgs = [
    ...listRows(pkgsMain.data ?? pkgsMain.json?.data),
    ...listRows(pkgsHolding.data ?? pkgsHolding.json?.data),
  ];
  report.live_cb_package_count = livePkgs.length;

  async function createPublishFormula({ code, expressionJson, requiredVarsJson, label }) {
    const create = await call(authorTok, 'POST', '/payroll/formulas', {
      body: {
        company_id: COMPANY,
        code,
        expressionJson,
        requiredVarsJson,
        label,
      },
    });
    report.steps.push({ name: `create_${code}`, ...create });
    const id = create.data?.id ?? create.json?.data?.id ?? null;
    if (!(create.status >= 200 && create.status < 300 && id)) {
      return { id: null, create, submit: null, publish: null, active: false };
    }
    const submit = await call(authorTok, 'POST', `/payroll/formulas/${id}/submit-publish`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.steps.push({ name: `submit_${code}`, ...submit });
    const publish = await call(pubTok, 'POST', `/payroll/formulas/${id}/publish`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.steps.push({ name: `publish_${code}`, ...publish });
    const active =
      publish.status >= 200 &&
      publish.status < 300 &&
      (publish.data?.status === 'active' || publish.json?.data?.status === 'active');
    return { id, create, submit, publish, active };
  }

  // Publish gd1_eval_v1 required_vars=[base_salary] only
  const evalCode = `qa_cb_bag_${Date.now().toString(36)}`.slice(0, 48);
  const evalF = await createPublishFormula({
    code: evalCode,
    expressionJson: GD1_EVAL_EXPR,
    requiredVarsJson: { keys: ['base_salary'] },
    label: `QA-CB-BAG gd1_eval_v1 ${STAMP}`,
  });
  report.eval_formula_id = evalF.id;
  report.checks.eval_formula_publish = passFail(
    evalF.active,
    `id=${evalF.id} active=${evalF.active} publish=${evalF.publish?.status}/${evalF.publish?.code}`,
  );

  // Closed ATT sheet → period month
  const sheetsList = await call(authorTok, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY },
  });
  report.steps.push({ name: 'list_att_sheets', ...sheetsList });
  const sheetRows = listRows(sheetsList.data?.data ?? sheetsList.data ?? sheetsList.json?.data);
  const closedSheet = sheetRows.find((s) => String(s?.status).toLowerCase() === 'closed');
  report.closed_sheet = closedSheet
    ? {
        id: closedSheet.id,
        status: closedSheet.status,
        start: closedSheet.start_date || closedSheet.startDate,
        company: closedSheet.company_id || closedSheet.companyId,
      }
    : null;

  if (!closedSheet) {
    throw new Error('No closed attendance sheet — cannot reach PROCESS beyond ATT-412');
  }
  const bounds = monthBoundsFromSheetStart(closedSheet.start_date || closedSheet.startDate);
  report.process_period_bounds = bounds;

  // Create draft period aligned to closed sheet month
  const createPeriod = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-CB-BAG ${STAMP}`,
      start_date: bounds.start,
      end_date: bounds.end,
      created_by: AUTHOR_EMAIL,
    },
  });
  report.steps.push({ name: 'create_period_closed_month', ...createPeriod });
  let periodId = createPeriod.data?.id ?? createPeriod.json?.data?.id ?? null;
  if (!(createPeriod.status >= 200 && createPeriod.status < 300 && periodId)) {
    // overlap — reuse draft same month
    const periodsHolding = await call(authorTok, 'GET', '/payroll/periods', {
      query: { company_id: 'holding' },
    });
    report.steps.push({ name: 'list_periods_after_overlap', ...periodsHolding });
    const periodRows = listRows(periodsHolding.data ?? periodsHolding.json?.data);
    const sameMonthDraft = periodRows.find((p) => {
      if (p?.status !== 'draft') return false;
      const ps = new Date(p.start_date || p.startDate);
      const pYmd = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
      }).format(ps);
      return pYmd === bounds.start.slice(0, 7);
    });
    periodId = sameMonthDraft?.id ?? periodId;
    report.period_reuse = !!sameMonthDraft?.id;
  }
  report.period_id = periodId;
  report.checks.period_ready = passFail(!!periodId, `periodId=${periodId} create=${createPeriod.status}/${createPeriod.code}`);

  // Eligibility for enroll targets
  const eligibility = periodId
    ? await call(authorTok, 'GET', `/payroll/periods/${periodId}/eligibility`, {
        query: { company_id: COMPANY },
      })
    : { status: 0, data: null, code: null };
  report.steps.push({ name: 'eligibility', ...eligibility });
  const eligItems = listRows(eligibility.data?.items ?? eligibility.data ?? eligibility.json?.data?.items);
  const eligible = eligItems.filter((i) => i?.eligible);
  report.eligible_count = eligible.length;
  report.eligible_sample = eligible.slice(0, 5).map((i) => ({
    employee_id: i.employee_id,
    employee_code: i.employee_code,
    company_id: i.company_id,
  }));

  // Pick empWithCb / empWithoutCb
  let empWithCb = null;
  let empWithoutCb = null;
  let cbSource = 'none';
  let createdPackageId = null;

  // Prefer live package employee among eligible
  for (const item of eligible) {
    const active = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages/active', {
      query: {
        company_id: item.company_id || COMPANY,
        employee_id: item.employee_id,
        as_of: bounds.end,
      },
    });
    report.steps.push({
      name: `active_cb_${item.employee_code || item.employee_id?.slice(0, 8)}`,
      status: active.status,
      code: active.code,
      has: !!(active.data && (active.data.id || active.data.lines)),
    });
    if (active.data && (active.data.id || (Array.isArray(active.data.lines) && active.data.lines.length))) {
      empWithCb = item;
      cbSource = 'live_active_package';
      break;
    }
  }

  // If no live C&B: product-path POST package for first eligible (≠ seed script)
  if (!empWithCb && eligible.length > 0) {
    const target = eligible[0];
    const createCb = await call(authorTok, 'POST', '/contracts-insurance/compensation-packages', {
      body: {
        company_id: target.company_id || 'holding',
        employee_id: target.employee_id,
        effective_from: bounds.start,
        currency: 'VND',
        change_reason: `QA-CB-BAG product-path ${STAMP}`,
        lines: [{ line_type: 'base', amount: 12_000_000, currency: 'VND', sort_order: 1 }],
      },
    });
    report.steps.push({ name: 'product_path_create_cb_package', ...createCb });
    createdPackageId = createCb.data?.id ?? createCb.json?.data?.id ?? null;
    if (createCb.status >= 200 && createCb.status < 300 && createdPackageId) {
      empWithCb = target;
      cbSource = 'product_path_post_compensation_packages';
      // verify active
      const verify = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages/active', {
        query: {
          company_id: target.company_id || COMPANY,
          employee_id: target.employee_id,
          as_of: bounds.end,
        },
      });
      report.steps.push({ name: 'verify_active_after_create', ...verify });
      report.created_cb_active = !!(verify.data && (verify.data.id || verify.data.lines));
    } else {
      report.cb_create_blocked = {
        status: createCb.status,
        code: createCb.code,
        message: createCb.message,
        details: createCb.details,
      };
    }
  }

  // Employee without C&B: second eligible (or first if create failed / only one)
  empWithoutCb =
    eligible.find((i) => i.employee_id !== empWithCb?.employee_id) ||
    (empWithCb ? null : eligible[0]) ||
    null;

  // If we created CB for first eligible, ensure without-cb is someone without package
  if (empWithCb && !empWithoutCb && eligible.length === 1) {
    // Use a non-eligible / any employee from directory for VARS path via explicit enroll if possible —
    // Prefer create second period with only a known-no-cb employee from employees list.
    const emps = await call(authorTok, 'GET', '/employees', {
      query: { company_id: COMPANY, page_size: '50' },
    });
    report.steps.push({ name: 'list_employees_for_no_cb', status: emps.status, code: emps.code });
    const empRows = listRows(emps.data ?? emps.json?.data);
    for (const e of empRows) {
      if (e.id === empWithCb.employee_id) continue;
      const active = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages/active', {
        query: { company_id: e.company_id || COMPANY, employee_id: e.id, as_of: bounds.end },
      });
      if (!(active.data && (active.data.id || active.data.lines))) {
        // need eligibility — if not eligible, VARS path may need separate period enroll of eligible without cb
        const eligHit = eligItems.find((i) => i.employee_id === e.id);
        if (eligHit?.eligible) {
          empWithoutCb = eligHit;
          break;
        }
      }
    }
  }

  report.emp_with_cb = empWithCb
    ? { employee_id: empWithCb.employee_id, employee_code: empWithCb.employee_code, cbSource, createdPackageId }
    : null;
  report.emp_without_cb = empWithoutCb
    ? { employee_id: empWithoutCb.employee_id, employee_code: empWithoutCb.employee_code }
    : null;

  // --- AC-CB3 ATT-412 (open month far ahead) ---
  const openStart = '2032-03-01';
  const openEnd = '2032-03-31';
  const createOpen = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-CB-BAG-ATT ${STAMP}`,
      start_date: openStart,
      end_date: openEnd,
      created_by: AUTHOR_EMAIL,
    },
  });
  report.steps.push({ name: 'create_period_att_open', ...createOpen });
  const openPeriodId = createOpen.data?.id ?? createOpen.json?.data?.id ?? null;
  const processAttOpen = openPeriodId
    ? await call(authorTok, 'POST', `/payroll/periods/${openPeriodId}/process`, {
        query: { company_id: COMPANY },
        body: {},
      })
    : { status: 0, code: null, message: 'no open period' };
  report.steps.push({ name: 'ac_cb3_process_att_open', ...processAttOpen });
  const att412 =
    processAttOpen.status === 412 &&
    (processAttOpen.code === 'HRM-PAY-ATT-412' || processAttOpen.json?.code === 'HRM-PAY-ATT-412');
  report.checks.ac_cb3_att_412 = passFail(
    att412,
    `HTTP ${processAttOpen.status} code=${processAttOpen.code} msg=${processAttOpen.message}`,
  );

  // --- AC-CB1 PROCESS with C&B ---
  let processWithCb = { status: 0, code: null, message: 'no emp with C&B', data: null, json: null };
  let payslipLinesAfter = [];
  let successBlocked = null;

  if (empWithCb && periodId && evalF.active) {
    // Ensure period draft — if previously processed, create fresh period
    let workPeriodId = periodId;
    const periodGet = await call(authorTok, 'GET', `/payroll/periods/${workPeriodId}`, {
      query: { company_id: COMPANY },
    });
    report.steps.push({ name: 'get_period_before_enroll', ...periodGet });
    const st = periodGet.data?.status ?? periodGet.json?.data?.status;
    if (st && st !== 'draft') {
      const createP2 = await call(authorTok, 'POST', '/payroll/periods', {
        body: {
          company_id: COMPANY,
          period_label: `QA-CB-BAG-OK ${STAMP}`,
          start_date: bounds.start,
          end_date: bounds.end,
          created_by: AUTHOR_EMAIL,
        },
      });
      report.steps.push({ name: 'create_period_fresh_for_cb', ...createP2 });
      workPeriodId = createP2.data?.id ?? createP2.json?.data?.id ?? workPeriodId;
    }
    report.period_id_with_cb = workPeriodId;

    const enroll = await call(authorTok, 'POST', `/payroll/periods/${workPeriodId}/enroll`, {
      query: { company_id: COMPANY },
      body: { mode: 'explicit', employee_ids: [empWithCb.employee_id] },
    });
    report.steps.push({ name: 'enroll_with_cb', ...enroll });
    report.checks.enroll_with_cb = passFail(
      enroll.status >= 200 && enroll.status < 300,
      `HTTP ${enroll.status} code=${enroll.code} enrolled=${enroll.data?.enrolled?.length}`,
    );

    processWithCb = await call(authorTok, 'POST', `/payroll/periods/${workPeriodId}/process`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.steps.push({ name: 'ac_cb1_process_with_cb', ...processWithCb });

    const process2xx = processWithCb.status >= 200 && processWithCb.status < 300;
    if (process2xx) {
      const payslips = await call(authorTok, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: workPeriodId },
      });
      report.steps.push({ name: 'payslips_after_process_cb', ...payslips });
      const slips = listRows(payslips.data ?? payslips.json?.data);
      const processed = slips.filter((p) => p?.status === 'processed');
      // lines may be nested or need GET by payslip id
      for (const slip of processed.slice(0, 3)) {
        const detail = await call(authorTok, 'GET', `/payroll/payslips/${slip.id}`, {
          query: { company_id: COMPANY },
        });
        report.steps.push({
          name: `payslip_detail_${slip.id?.slice(0, 8)}`,
          status: detail.status,
          code: detail.code,
          dataSummary: summarizeBody(detail.data, 500),
        });
        const lines =
          detail.data?.lines ||
          detail.data?.payslip_lines ||
          detail.json?.data?.lines ||
          [];
        if (Array.isArray(lines) && lines.length) {
          payslipLinesAfter.push(...lines);
        }
      }
      // Also check process response for lines / summary
      const gross = Number(
        processWithCb.data?.payslip_summary?.total_gross ??
          processWithCb.json?.data?.payslip_summary?.total_gross ??
          0,
      );
      const net = Number(
        processWithCb.data?.payslip_summary?.total_net ??
          processWithCb.json?.data?.payslip_summary?.total_net ??
          0,
      );
      const hasLines = payslipLinesAfter.length > 0 || (processed.length > 0 && gross > 0);
      report.checks.ac_cb1_process_with_cb = passFail(
        process2xx && processed.length > 0 && gross > 0 && hasLines,
        `HTTP ${processWithCb.status} code=${processWithCb.code} processed=${processed.length} gross=${gross} net=${net} lines=${payslipLinesAfter.length} cbSource=${cbSource}`,
      );
      report.honesty_process = {
        payroll_e2e_ready:
          processWithCb.data?.formula_bind?.payroll_e2e_ready ??
          processWithCb.details?.payroll_e2e_ready ??
          false,
      };
    } else {
      const isVars =
        processWithCb.code === 'HRM-PAY-FORMULA-412-VARS' ||
        processWithCb.json?.code === 'HRM-PAY-FORMULA-412-VARS';
      successBlocked = {
        status: processWithCb.status,
        code: processWithCb.code,
        message: processWithCb.message,
        details: processWithCb.details,
        isVars,
      };
      // If product CB create claimed ok but still VARS → FAIL (bag bug)
      // If CB create failed earlier → BLOCKED not FAIL
      if (cbSource === 'none' || report.cb_create_blocked) {
        report.checks.ac_cb1_process_with_cb = {
          ok: true,
          verdict: 'BLOCKED',
          note: `No live C&B + product create blocked or absent — cannot assert success lines without seed. process=${processWithCb.status}/${processWithCb.code}`,
        };
      } else {
        report.checks.ac_cb1_process_with_cb = passFail(
          false,
          `Expected 2xx with C&B (${cbSource}) but got HTTP ${processWithCb.status} code=${processWithCb.code} msg=${processWithCb.message}`,
        );
      }
    }
  } else {
    report.checks.ac_cb1_process_with_cb = {
      ok: true,
      verdict: 'BLOCKED',
      note: `Cannot run success path: empWithCb=${!!empWithCb} periodId=${!!periodId} formulaActive=${evalF.active} livePkgs=${livePkgs.length} eligible=${eligible.length}`,
    };
  }

  // --- AC-CB2 PROCESS missing C&B → FORMULA-412-VARS ---
  // Fresh period same closed month, enroll only emp without CB
  let processNoCb = { status: 0, code: null, message: 'no emp without C&B', data: null, json: null };
  if (empWithoutCb && evalF.active) {
    const createNoCbPeriod = await call(authorTok, 'POST', '/payroll/periods', {
      body: {
        company_id: COMPANY,
        period_label: `QA-CB-BAG-VARS ${STAMP}`,
        start_date: bounds.start,
        end_date: bounds.end,
        created_by: AUTHOR_EMAIL,
      },
    });
    report.steps.push({ name: 'create_period_no_cb', ...createNoCbPeriod });
    let noCbPeriodId = createNoCbPeriod.data?.id ?? createNoCbPeriod.json?.data?.id ?? null;
    if (!(createNoCbPeriod.status >= 200 && createNoCbPeriod.status < 300)) {
      // If overlap because prior process consumed — try create with slightly different label still same dates may 409
      // Use a different closed sheet month if available
      const otherClosed = sheetRows.find(
        (s) =>
          String(s?.status).toLowerCase() === 'closed' &&
          s.id !== closedSheet.id,
      );
      if (otherClosed) {
        const b2 = monthBoundsFromSheetStart(otherClosed.start_date || otherClosed.startDate);
        const createAlt = await call(authorTok, 'POST', '/payroll/periods', {
          body: {
            company_id: COMPANY,
            period_label: `QA-CB-BAG-VARS2 ${STAMP}`,
            start_date: b2.start,
            end_date: b2.end,
            created_by: AUTHOR_EMAIL,
          },
        });
        report.steps.push({ name: 'create_period_no_cb_alt_month', ...createAlt });
        noCbPeriodId = createAlt.data?.id ?? createAlt.json?.data?.id ?? noCbPeriodId;
        report.no_cb_period_bounds = b2;
      }
    }
    report.period_id_no_cb = noCbPeriodId;

    if (noCbPeriodId) {
      // Re-check eligibility for this period
      const elig2 = await call(authorTok, 'GET', `/payroll/periods/${noCbPeriodId}/eligibility`, {
        query: { company_id: COMPANY },
      });
      report.steps.push({ name: 'eligibility_no_cb_period', ...elig2 });
      const elig2Items = listRows(elig2.data?.items ?? elig2.data ?? elig2.json?.data?.items);
      let targetNoCb = elig2Items.find(
        (i) => i?.eligible && i.employee_id === empWithoutCb.employee_id,
      );
      if (!targetNoCb) {
        // pick any eligible without active CB
        for (const i of elig2Items.filter((x) => x?.eligible)) {
          if (i.employee_id === empWithCb?.employee_id) continue;
          const active = await call(authorTok, 'GET', '/contracts-insurance/compensation-packages/active', {
            query: {
              company_id: i.company_id || COMPANY,
              employee_id: i.employee_id,
              as_of: bounds.end,
            },
          });
          if (!(active.data && (active.data.id || active.data.lines))) {
            targetNoCb = i;
            break;
          }
        }
      }
      report.emp_without_cb_resolved = targetNoCb
        ? { employee_id: targetNoCb.employee_id, employee_code: targetNoCb.employee_code }
        : null;

      if (targetNoCb) {
        const enroll2 = await call(authorTok, 'POST', `/payroll/periods/${noCbPeriodId}/enroll`, {
          query: { company_id: COMPANY },
          body: { mode: 'explicit', employee_ids: [targetNoCb.employee_id] },
        });
        report.steps.push({ name: 'enroll_without_cb', ...enroll2 });

        processNoCb = await call(authorTok, 'POST', `/payroll/periods/${noCbPeriodId}/process`, {
          query: { company_id: COMPANY },
          body: {},
        });
        report.steps.push({ name: 'ac_cb2_process_without_cb', ...processNoCb });
      }
    }
  }

  const vars412 =
    processNoCb.status === 412 &&
    (processNoCb.code === 'HRM-PAY-FORMULA-412-VARS' ||
      processNoCb.json?.code === 'HRM-PAY-FORMULA-412-VARS');
  const silentZeroNoCb =
    processNoCb.status >= 200 &&
    processNoCb.status < 300 &&
    (Number(processNoCb.data?.payslip_summary?.total_gross) === 0 ||
      Number(processNoCb.data?.payslip_summary?.total_net) === 0);
  report.checks.ac_cb2_formula_412_vars = passFail(
    vars412 && !silentZeroNoCb,
    `HTTP ${processNoCb.status} code=${processNoCb.code} silentZero=${silentZeroNoCb} msg=${processNoCb.message} warnings=${summarizeBody(processNoCb.details, 300)}`,
  );

  // --- AC-CB4 FORMULA-412: retire actives + process closed month ---
  const activeList = await call(authorTok, 'GET', '/payroll/formulas', {
    query: { company_id: COMPANY, active_only: 'true' },
  });
  report.steps.push({ name: 'list_active_before_retire', ...activeList });
  const activeRows = listRows(activeList.data ?? activeList.json?.data);
  for (const row of activeRows) {
    if (!row?.id) continue;
    const retire = await call(authorTok, 'POST', `/payroll/formulas/${row.id}/retire`, {
      query: { company_id: COMPANY },
      body: { note: `QA-CB-BAG retire for FORMULA-412 ${STAMP}` },
    });
    report.steps.push({ name: `retire_${row.code}`, status: retire.status, code: retire.code });
  }

  const createNf = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-CB-BAG-NF ${STAMP}`,
      start_date: bounds.start,
      end_date: bounds.end,
      created_by: AUTHOR_EMAIL,
    },
  });
  report.steps.push({ name: 'create_period_no_formula', ...createNf });
  let nfPeriodId = createNf.data?.id ?? createNf.json?.data?.id ?? null;
  if (!(createNf.status >= 200 && createNf.status < 300)) {
    // reuse any draft closed-month period
    const plist = await call(authorTok, 'GET', '/payroll/periods', {
      query: { company_id: 'holding' },
    });
    const rows = listRows(plist.data ?? plist.json?.data);
    const draft = rows.find((p) => {
      if (p?.status !== 'draft') return false;
      const ps = new Date(p.start_date || p.startDate);
      const pYmd = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
      }).format(ps);
      return pYmd === bounds.start.slice(0, 7);
    });
    nfPeriodId = draft?.id ?? nfPeriodId;
  }

  // Need at least one enrolled payslip — enroll auto or explicit
  if (nfPeriodId && eligible[0]) {
    const enrollNf = await call(authorTok, 'POST', `/payroll/periods/${nfPeriodId}/enroll`, {
      query: { company_id: COMPANY },
      body: { mode: 'explicit', employee_ids: [eligible[0].employee_id] },
    });
    report.steps.push({ name: 'enroll_no_formula', ...enrollNf });
  }

  const processNf = nfPeriodId
    ? await call(authorTok, 'POST', `/payroll/periods/${nfPeriodId}/process`, {
        query: { company_id: COMPANY },
        body: {},
      })
    : { status: 0, code: null, message: 'no nf period' };
  report.steps.push({ name: 'ac_cb4_process_no_formula', ...processNf });
  const formula412 =
    processNf.status === 412 &&
    (processNf.code === 'HRM-PAY-FORMULA-412' || processNf.json?.code === 'HRM-PAY-FORMULA-412');
  const silentZeroNf =
    processNf.status >= 200 &&
    processNf.status < 300 &&
    Number(processNf.data?.payslip_summary?.total_gross ?? 1) === 0;
  report.checks.ac_cb4_formula_412 = passFail(
    formula412 && !silentZeroNf,
    `HTTP ${processNf.status} code=${processNf.code} silentZero=${silentZeroNf} msg=${processNf.message}`,
  );

  // Aggregate verdict
  const required = ['ac_cb2_formula_412_vars', 'ac_cb3_att_412', 'ac_cb4_formula_412', 'eval_formula_publish'];
  const failedRequired = required.filter((k) => !report.checks[k]?.ok);
  const cb1 = report.checks.ac_cb1_process_with_cb;
  const cb1Fail = cb1 && cb1.verdict === 'FAIL';
  const cb1Blocked = cb1 && cb1.verdict === 'BLOCKED';

  report.failed_acs = [...failedRequired, ...(cb1Fail ? ['ac_cb1_process_with_cb'] : [])];
  report.verdict =
    report.failed_acs.length === 0
      ? cb1Blocked
        ? 'PASS_WITH_BLOCKED_SUCCESS_PATH'
        : 'PASS'
      : 'FAIL';
  report.honesty_final = {
    payroll_e2e_ready: false,
    formula_live: false,
    browser_uf: false,
    seed: false,
    cb_source: cbSource,
    created_package_id: createdPackageId,
    success_blocked: successBlocked,
  };
  report.finishedAt = new Date().toISOString();

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        verdict: report.verdict,
        failed_acs: report.failed_acs,
        checks: Object.fromEntries(
          Object.entries(report.checks).map(([k, v]) => [k, { verdict: v.verdict, note: v.note }]),
        ),
        emp_with_cb: report.emp_with_cb,
        emp_without_cb: report.emp_without_cb,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(report.verdict === 'FAIL' ? 1 : 0);
} catch (err) {
  report.fatal = String(err?.stack || err);
  report.verdict = 'FAIL';
  report.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.error(report.fatal);
  process.exit(1);
}
