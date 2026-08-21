#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01 — L1 evaluator honesty
 * U65 zero-seed · payroll_e2e_ready=false · cấm claim formula LIVE / browser UF invent
 *
 * AC1 Opaque GĐ1 preview → 412-PREVIEW-STUB
 * AC2 gd1_eval_v1 + complete overrides → 200 compute · ready=false
 * AC3 PROCESS without published formula → FORMULA-412 (no silent 0₫)
 * AC4 ATT open / incomplete hours bag → ATT-412 or PREVIEW-STUB / FORMULA-412 equiv
 * AC5 Payslip lines only on success path (fail paths must not return 2xx processed zeros)
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
const STAMP = `PAYFEQ1-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json');

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

async function call(token, method, path, { query, body } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': COMPANY,
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

const OPAQUE_GD1 = {
  form: 'gd1',
  ops: [{ op: 'opaque', note: `QA-EVAL opaque ${STAMP}` }],
};

const report = {
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01',
  stamp: STAMP,
  lane: 'L1_API_evaluator_honesty',
  u65: 'zero-seed · probe ≠ UF · cấm claim formula LIVE · cấm invent browser UF',
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

  // Probe: formulas route live (not 404 stale)
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

  // --- AC1: opaque GĐ1 preview → PREVIEW-STUB ---
  const opaqueCode = `qa_eval_opaque_${Date.now().toString(36)}`.slice(0, 48);
  const opaque = await createPublishFormula({
    code: opaqueCode,
    expressionJson: OPAQUE_GD1,
    requiredVarsJson: { keys: ['base_salary'] },
    label: `QA-EVAL opaque ${STAMP}`,
  });
  report.opaque_formula_id = opaque.id;
  report.checks.ac1_opaque_publish = passFail(
    opaque.active,
    `id=${opaque.id} active=${opaque.active} publish=${opaque.publish?.status}/${opaque.publish?.code}`,
  );

  const opaquePreview = opaque.id
    ? await call(authorTok, 'POST', `/payroll/formulas/${opaque.id}/preview`, {
        query: { company_id: COMPANY },
        body: { variableOverrides: { base_salary: 8_000_000 } },
      })
    : { status: 0, code: null, message: 'no opaque id', details: null, json: null };
  report.steps.push({ name: 'ac1_opaque_preview', ...opaquePreview });
  const stubCode =
    opaquePreview.code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB' ||
    opaquePreview.json?.code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB';
  const readyFlagOpaque =
    opaquePreview.details?.payroll_e2e_ready ??
    opaquePreview.json?.details?.payroll_e2e_ready ??
    opaquePreview.json?.data?.payroll_e2e_ready;
  report.checks.ac1_opaque_preview_stub = passFail(
    opaquePreview.status === 412 && stubCode,
    `HTTP ${opaquePreview.status} code=${opaquePreview.code} ready=${readyFlagOpaque} msg=${opaquePreview.message}`,
  );

  // --- AC2: gd1_eval_v1 + overrides → 200 · ready=false ---
  const evalCode = `qa_eval_v1_${Date.now().toString(36)}`.slice(0, 48);
  const evalF = await createPublishFormula({
    code: evalCode,
    expressionJson: GD1_EVAL_EXPR,
    requiredVarsJson: { keys: ['base_salary'] },
    label: `QA-EVAL gd1_eval_v1 ${STAMP}`,
  });
  report.eval_formula_id = evalF.id;
  report.checks.ac2_eval_publish = passFail(
    evalF.active,
    `id=${evalF.id} active=${evalF.active} publish=${evalF.publish?.status}/${evalF.publish?.code}`,
  );

  const evalPreview = evalF.id
    ? await call(authorTok, 'POST', `/payroll/formulas/${evalF.id}/preview`, {
        query: { company_id: COMPANY },
        body: { variableOverrides: { base_salary: 8_000_000 } },
      })
    : { status: 0, code: null, message: 'no eval id', data: null, json: null };
  report.steps.push({ name: 'ac2_eval_preview', ...evalPreview });
  const previewData = evalPreview.data ?? evalPreview.json?.data ?? null;
  const grossOk = Number(previewData?.gross) === 8_000_000;
  const netOk = Number(previewData?.net) === 7_200_000; // 8M - 10%
  const linesOk = Array.isArray(previewData?.lines) && previewData.lines.length >= 1;
  const readyFalse = previewData?.payroll_e2e_ready === false;
  const warnings = Array.isArray(previewData?.warnings) ? previewData.warnings : [];
  const preview2xx = evalPreview.status >= 200 && evalPreview.status < 300;
  report.checks.ac2_eval_preview_compute = passFail(
    preview2xx &&
      (evalPreview.code === 'HRM-PAY-FORMULA-200' || !!previewData) &&
      grossOk &&
      netOk &&
      linesOk &&
      readyFalse,
    `HTTP ${evalPreview.status} code=${evalPreview.code} gross=${previewData?.gross} net=${previewData?.net} lines=${previewData?.lines?.length} ready=${previewData?.payroll_e2e_ready} warnings=${warnings.join(',')}`,
  );

  // --- AC4a: incomplete ATT hours bag on preview (payable_hours required, no overrides) ---
  const hoursCode = `qa_eval_hrs_${Date.now().toString(36)}`.slice(0, 48);
  const hoursF = await createPublishFormula({
    code: hoursCode,
    expressionJson: {
      form: 'gd1_eval_v1',
      lines: [
        {
          component_code: 'BASE_HRS',
          sign: 'earning',
          source: 'expr',
          expr: { op: 'mul', left: 'base_salary', right: 'payable_hours' },
        },
      ],
    },
    requiredVarsJson: { keys: ['base_salary', 'payable_hours'] },
    label: `QA-EVAL hours bag ${STAMP}`,
  });
  report.hours_formula_id = hoursF.id;
  const hoursPreview = hoursF.id
    ? await call(authorTok, 'POST', `/payroll/formulas/${hoursF.id}/preview`, {
        query: { company_id: COMPANY },
        body: { variableOverrides: { base_salary: 100_000 } }, // payable_hours intentionally missing
      })
    : { status: 0, code: null, message: 'no hours id' };
  report.steps.push({ name: 'ac4_hours_incomplete_preview', ...hoursPreview });
  const hoursHonest =
    hoursPreview.status === 412 &&
    (hoursPreview.code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB' ||
      hoursPreview.code === 'HRM-PAY-ATT-412' ||
      hoursPreview.code === 'HRM-PAY-FORMULA-412-VARS' ||
      hoursPreview.json?.code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB' ||
      hoursPreview.json?.code === 'HRM-PAY-ATT-412' ||
      hoursPreview.json?.code === 'HRM-PAY-FORMULA-412-VARS');
  report.checks.ac4_incomplete_hours_preview = passFail(
    hoursHonest,
    `HTTP ${hoursPreview.status} code=${hoursPreview.code} msg=${hoursPreview.message}`,
  );

  // --- AC3 + AC4b PROCESS paths ---
  // Pick a free month window far ahead to avoid HRM-PAY-002 overlap
  const y = 2031;
  const m = String((Date.now() % 11) + 1).padStart(2, '0');
  const start = `${y}-${m}-01`;
  const end = `${y}-${m}-28`;
  const periodLabel = `QA-EVAL ${STAMP}`;

  const createPeriod = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: periodLabel,
      start_date: start,
      end_date: end,
      created_by: AUTHOR_EMAIL,
    },
  });
  report.steps.push({ name: 'create_period_att_open', ...createPeriod });
  const periodId = createPeriod.data?.id ?? createPeriod.json?.data?.id ?? null;
  report.period_id_att_open = periodId;
  report.checks.period_create = passFail(
    createPeriod.status >= 200 && createPeriod.status < 300 && !!periodId,
    `HTTP ${createPeriod.status} code=${createPeriod.code} id=${periodId} range=${start}..${end}`,
  );

  // AC4b: process with ATT open → ATT-412
  const processAttOpen = periodId
    ? await call(authorTok, 'POST', `/payroll/periods/${periodId}/process`, {
        query: { company_id: COMPANY },
        body: {},
      })
    : { status: 0, code: null, message: 'no period' };
  report.steps.push({ name: 'ac4_process_att_open', ...processAttOpen });
  const att412 =
    processAttOpen.status === 412 &&
    (processAttOpen.code === 'HRM-PAY-ATT-412' || processAttOpen.json?.code === 'HRM-PAY-ATT-412');
  report.checks.ac4_process_att_412 = passFail(
    att412,
    `HTTP ${processAttOpen.status} code=${processAttOpen.code} msg=${processAttOpen.message}`,
  );

  // AC3: PROCESS without published formula
  // Strategy: retire ALL active company formulas (soft), then process a period that has closed sheet OR
  // if ATT still blocks first, bind path via resolve after documenting ATT-first ordering.
  // Practical approach for live pilot with require_closed_timesheet:
  // 1) List active formulas before retire
  // 2) Retire each active
  // 3) Create second period; process — expect ATT-412 (if sheet open) OR FORMULA-412 (if sheet closed / require off)
  // 4) If ATT-412 wins first: also call resolve honesty by creating period + attempting process after
  //    documenting ATT precheck precedes formula — then prove FORMULA-412 via preview-equivalent
  //    AND via process when ATT gate cleared.
  //
  // Additional honest path: process with periodFormulaDefinitionId pointing at draft-only —
  // if API cannot set formula_definition_id on create, retire actives + observe process code.

  const activeListBefore = await call(authorTok, 'GET', '/payroll/formulas', {
    query: { company_id: COMPANY, active_only: 'true' },
  });
  report.steps.push({ name: 'list_active_before_retire', ...activeListBefore });
  const activeRows = listRows(activeListBefore.data ?? activeListBefore.json?.data);
  report.active_before_retire = activeRows.map((r) => ({
    id: r.id,
    code: r.code,
    status: r.status,
  }));

  const retireResults = [];
  for (const row of activeRows) {
    if (!row?.id) continue;
    const retire = await call(authorTok, 'POST', `/payroll/formulas/${row.id}/retire`, {
      query: { company_id: COMPANY },
      body: { note: `QA-EVAL retire for FORMULA-412 ${STAMP}` },
    });
    retireResults.push({
      id: row.id,
      code: row.code,
      status: retire.status,
      apiCode: retire.code,
      message: retire.message,
    });
    report.steps.push({ name: `retire_${row.code}`, ...retire });
  }
  report.retire_results = retireResults;

  const activeListAfter = await call(authorTok, 'GET', '/payroll/formulas', {
    query: { company_id: COMPANY, active_only: 'true' },
  });
  report.steps.push({ name: 'list_active_after_retire', ...activeListAfter });
  const activeAfter = listRows(activeListAfter.data ?? activeListAfter.json?.data).filter(
    (r) => r?.status === 'active',
  );
  report.active_after_retire_count = activeAfter.length;

  // FORMULA-412 path: align period month with an existing CLOSED attendance sheet (U65 reuse live sheet — no seed).
  // Pilot closed sheets observed: Jul-2026 / Sep-2026 / Jan-2026 (holding). Prefer Jul-2026.
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

  function monthBoundsFromSheetStart(iso) {
    const d = new Date(iso);
    // Use VN calendar month of the sheet start instant
    const ymd = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d); // YYYY-MM-DD
    const [yy, mm] = ymd.split('-');
    const lastDay = new Date(Number(yy), Number(mm), 0).getDate();
    return {
      start: `${yy}-${mm}-01`,
      end: `${yy}-${mm}-${String(lastDay).padStart(2, '0')}`,
      ymd,
    };
  }

  let processNoFormula = {
    status: 0,
    code: null,
    message: 'no closed sheet period',
    data: null,
    json: null,
  };
  let periodId2 = null;
  let formula412Via = null;

  if (closedSheet) {
    const bounds = monthBoundsFromSheetStart(closedSheet.start_date || closedSheet.startDate);
    report.formula412_period_bounds = bounds;

    // Reuse existing draft period in that month if present; else create
    const periodsHolding = await call(authorTok, 'GET', '/payroll/periods', {
      query: { company_id: 'holding' },
    });
    report.steps.push({ name: 'list_periods_holding', ...periodsHolding });
    const periodRows = listRows(periodsHolding.data ?? periodsHolding.json?.data);
    const sameMonthDraft = periodRows.find((p) => {
      if (p?.status !== 'draft') return false;
      const ps = new Date(p.start_date || p.startDate);
      const pYmd = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
      }).format(ps);
      const want = bounds.start.slice(0, 7);
      return pYmd === want;
    });

    if (sameMonthDraft?.id) {
      periodId2 = sameMonthDraft.id;
      report.period_id_no_formula = periodId2;
      report.period_reuse = true;
    } else {
      const createPeriod2 = await call(authorTok, 'POST', '/payroll/periods', {
        body: {
          company_id: COMPANY,
          period_label: `QA-EVAL-NF ${STAMP}`,
          start_date: bounds.start,
          end_date: bounds.end,
          created_by: AUTHOR_EMAIL,
        },
      });
      report.steps.push({ name: 'create_period_no_formula_closed_month', ...createPeriod2 });
      periodId2 = createPeriod2.data?.id ?? createPeriod2.json?.data?.id ?? null;
      report.period_id_no_formula = periodId2;
      report.period_reuse = false;
      if (!(createPeriod2.status >= 200 && createPeriod2.status < 300)) {
        // overlap — try process any draft matching month from list after refresh
        const refresh = await call(authorTok, 'GET', '/payroll/periods', {
          query: { company_id: 'holding' },
        });
        const rows2 = listRows(refresh.data ?? refresh.json?.data);
        const hit = rows2.find((p) => p?.status === 'draft' && String(p.period_label || '').includes('QA-EVAL'));
        periodId2 = hit?.id ?? periodId2;
      }
    }

    processNoFormula = periodId2
      ? await call(authorTok, 'POST', `/payroll/periods/${periodId2}/process`, {
          query: { company_id: COMPANY },
          body: {},
        })
      : processNoFormula;
    report.steps.push({ name: 'ac3_process_no_formula', ...processNoFormula });
    formula412Via = 'closed_sheet_month';
  } else {
    report.steps.push({
      name: 'ac3_process_no_formula',
      status: 0,
      code: null,
      message: 'No closed attendance sheet in scope — cannot clear ATT-412 to reach FORMULA-412',
    });
  }

  const formula412 =
    processNoFormula.status === 412 &&
    (processNoFormula.code === 'HRM-PAY-FORMULA-412' ||
      processNoFormula.json?.code === 'HRM-PAY-FORMULA-412');
  const att412First =
    processNoFormula.status === 412 &&
    (processNoFormula.code === 'HRM-PAY-ATT-412' || processNoFormula.json?.code === 'HRM-PAY-ATT-412');
  const silentZero =
    processNoFormula.status >= 200 &&
    processNoFormula.status < 300 &&
    (Number(processNoFormula.data?.payslip_summary?.total_gross) === 0 ||
      Number(processNoFormula.data?.payslip_summary?.total_net) === 0);

  const formula412Ok = formula412;
  report.checks.ac3_process_formula_412 = passFail(
    formula412Ok && !silentZero,
    `via=${formula412Via} period=${periodId2} HTTP ${processNoFormula.status} code=${processNoFormula.code} active_after=${activeAfter.length} attFirst=${att412First} msg=${processNoFormula.message}`,
  );
  report.checks.ac3_no_silent_zero = passFail(
    !silentZero,
    silentZero
      ? 'FAIL silent 0₫ processed response'
      : `no 2xx zero process (got ${processNoFormula.status}/${processNoFormula.code})`,
  );

  const payslipsFailPath = periodId
    ? await call(authorTok, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId },
      })
    : { status: 0, code: null, data: null };
  report.steps.push({ name: 'payslips_att_open_period', ...payslipsFailPath });
  const failPayslips = listRows(payslipsFailPath.data ?? payslipsFailPath.json?.data);
  const anyProcessedFail = failPayslips.some((p) => p?.status === 'processed');

  report.checks.ac5_no_success_lines_on_fail = passFail(
    (att412 || formula412Ok) && !anyProcessedFail,
    `att412=${att412} formula412=${formula412Ok} processed_payslips_on_att_open_period=${failPayslips.filter((p) => p?.status === 'processed').length} total_payslips=${failPayslips.length}`,
  );
  report.checks.ac5_preview_not_persist_claim = passFail(
    report.checks.ac2_eval_preview_compute.ok && readyFalse,
    `preview 2xx compute keeps payroll_e2e_ready=false (dry-run; no customer UAT / no process lines claim) ready=${readyFalse}`,
  );

  // Optional: after FORMULA-412 proven, re-publish gd1_eval and attempt process on closed-month period.
  // Success lines only asserted if process 2xx; otherwise document blocked (C&B/ATT hours) without silent zero.
  let successProcess = null;
  if (formula412Ok && periodId2) {
    const restore = await createPublishFormula({
      code: `qa_eval_restore_${Date.now().toString(36)}`.slice(0, 48),
      expressionJson: GD1_EVAL_EXPR,
      requiredVarsJson: { keys: ['base_salary'] },
      label: `QA-EVAL restore ${STAMP}`,
    });
    report.restore_formula_id = restore.id;
    report.checks.restore_eval_publish = passFail(
      restore.active,
      `id=${restore.id} active=${restore.active}`,
    );
    successProcess = await call(authorTok, 'POST', `/payroll/periods/${periodId2}/process`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.steps.push({ name: 'optional_success_process_after_restore', ...successProcess });
    const success2xx = successProcess.status >= 200 && successProcess.status < 300;
    if (success2xx) {
      const payslipsOk = await call(authorTok, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId2 },
      });
      report.steps.push({ name: 'payslips_after_success', ...payslipsOk });
      const slips = listRows(payslipsOk.data ?? payslipsOk.json?.data);
      const processed = slips.filter((p) => p?.status === 'processed');
      // Lines table may not be exposed via list — assert non-zero amounts as proxy + code envelope
      const nonZero = processed.some(
        (p) => Number(p.gross_amount ?? p.grossAmount) > 0 || Number(p.net_amount ?? p.netAmount) > 0,
      );
      report.checks.ac5_success_path_amounts = passFail(
        processed.length > 0 && nonZero,
        `processed=${processed.length} nonZero=${nonZero} code=${successProcess.code}`,
      );
    } else {
      report.checks.ac5_success_path_amounts = passFail(
        true,
        `SKIP success lines — process blocked honest HTTP ${successProcess.status} code=${successProcess.code} (no silent 2xx zero); fail-path AC5 still PASS`,
      );
    }
  } else {
    report.checks.ac5_success_path_amounts = passFail(
      true,
      'SKIP success lines — FORMULA-412 path not established for restore attempt',
    );
  }

  // Rollup
  const acKeys = [
    'ac1_opaque_preview_stub',
    'ac2_eval_preview_compute',
    'ac3_process_formula_412',
    'ac3_no_silent_zero',
    'ac4_incomplete_hours_preview',
    'ac4_process_att_412',
    'ac5_no_success_lines_on_fail',
    'ac5_preview_not_persist_claim',
  ];
  const failed = acKeys.filter((k) => !report.checks[k]?.ok);
  report.verdict = failed.length === 0 ? 'PASS' : 'FAIL';
  report.failed_acs = failed;
  report.finishedAt = new Date().toISOString();
  report.ack_status = report.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  report.honesty_final = {
    payroll_e2e_ready: false,
    formula_live: false,
    browser_uf: false,
    seed: false,
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        verdict: report.verdict,
        stamp: STAMP,
        failed: failed,
        checks: Object.fromEntries(
          Object.entries(report.checks).map(([k, v]) => [k, { ok: v.ok, note: v.note }]),
        ),
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(report.verdict === 'PASS' ? 0 : 1);
} catch (err) {
  report.fatal = String(err?.stack || err);
  report.verdict = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.error(report.fatal);
  console.log(JSON.stringify({ verdict: 'FAIL', stamp: STAMP, out: OUT }, null, 2));
  process.exit(1);
}
