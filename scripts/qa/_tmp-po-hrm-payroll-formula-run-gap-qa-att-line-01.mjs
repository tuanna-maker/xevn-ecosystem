#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01 — L1 R-PAY-F-ATT-LINE
 * U65 zero-seed · payroll_e2e_ready=false · cấm claim formula LIVE / J-HRM-07 module UAT
 *
 * AC1 AGG / submit → lines; close → line_locked; reopen → archived
 * AC2 PREVIEW ABSENT/incomplete → 412-PREVIEW-STUB (no silent 0)
 * AC3 PROCESS open/missing → HRM-PAY-ATT-412
 * AC4 closed+locked binds payable_hours without ATT_TIMESHEET_LINE_ABSENT
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const AUTHOR_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PUBLISHER_EMAIL = process.env.QA_PUBLISHER_EMAIL || 'admin@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `PAYFEATT-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-01.FINAL.json');

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
    dataSummary: summarizeBody(json?.data ?? json, 800),
    data: json?.data ?? null,
    details: json?.details ?? json?.data?.details ?? null,
    warnings: json?.data?.warnings ?? json?.details?.warnings ?? json?.warnings ?? null,
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

function sheetId(row) {
  return row?.id || row?.sheet_id || row?.sheetId || null;
}

function sheetStatus(row) {
  return String(row?.status || '').toLowerCase();
}

function monthBounds(yyyyMm) {
  const [yy, mm] = yyyyMm.split('-').map(Number);
  const lastDay = new Date(yy, mm, 0).getDate();
  return {
    start: `${yyyyMm}-01`,
    end: `${yyyyMm}-${String(lastDay).padStart(2, '0')}`,
  };
}

function ymdFromIso(iso) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  } catch {
    return String(iso || '').slice(0, 10);
  }
}

function distMarkers() {
  const base = resolve(ROOT, 'apps/api/hrm-api/dist');
  const agg = resolve(base, 'attendance/att-timesheet-line-aggregate.js');
  const bag = resolve(base, 'payroll/pay-formula-variable-bag.js');
  const ctrl = resolve(base, 'attendance/attendance.controller.js');
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
  return {
    agg_present: existsSync(agg),
    bag_present: existsSync(bag),
    agg_has_lock: read(agg).includes('lockAttTimesheetLinesForSheet') || read(agg).includes('line_locked'),
    bag_has_load: read(bag).includes('loadAttHoursFromClosedLine'),
    ctrl_has_aggregate: read(ctrl).includes('aggregateAttendanceSheet'),
  };
}

async function ensureHoursFormula(authorTok, publisherTok, report) {
  const code = `qa_att_hrs_${Date.now().toString(36)}`.slice(0, 48);
  const create = await call(authorTok, 'POST', '/payroll/formulas', {
    body: {
      company_id: COMPANY,
      code,
      label: `QA-ATT-LINE hours ${STAMP}`,
      expressionJson: {
        form: 'gd1_eval_v1',
        lines: [
          {
            expr: { op: 'mul', left: 'base_salary', right: 'payable_hours' },
            sign: 'earning',
            source: 'expr',
            component_code: 'BASE_HRS',
          },
        ],
      },
      requiredVarsJson: { keys: ['base_salary', 'payable_hours'] },
    },
  });
  report.calls.push(create);
  const id = create.data?.id ?? create.json?.data?.id ?? null;
  if (!id) return { ok: false, id: null, create };

  const submit = await call(authorTok, 'POST', `/payroll/formulas/${id}/submit-publish`, {
    query: { company_id: COMPANY },
    body: {},
  });
  report.calls.push(submit);

  const selfDeny = await call(authorTok, 'POST', `/payroll/formulas/${id}/publish`, {
    query: { company_id: COMPANY },
    body: {},
  });
  report.calls.push(selfDeny);

  const publish = await call(publisherTok, 'POST', `/payroll/formulas/${id}/publish`, {
    query: { company_id: COMPANY },
    body: {},
  });
  report.calls.push(publish);

  const active =
    publish.status >= 200 &&
    publish.status < 300 &&
    (publish.data?.status === 'active' || publish.json?.data?.status === 'active');
  return {
    ok: active,
    id,
    code,
    create,
    submit,
    selfDeny,
    publish,
  };
}

async function signAll(token, id, report) {
  const personas = [
    { step_code: 'EMP', persona_role: 'employee' },
    { step_code: 'DM', persona_role: 'direct_manager' },
    { step_code: 'HR', persona_role: 'hr_admin' },
  ];
  const outs = [];
  for (const p of personas) {
    const r = await call(token, 'POST', `/attendance/attendance-sheets/${id}/signatures`, {
      query: { company_id: COMPANY },
      body: { ...p, outcome: 'approved', comment: `QA-ATT-LINE ${STAMP}` },
    });
    report.calls.push(r);
    outs.push(r);
  }
  return outs;
}

async function main() {
  const report = {
    work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-01',
    stamp: STAMP,
    portal_url: PORTAL,
    hrm_url: HRM,
    company_id: COMPANY,
    author: AUTHOR_EMAIL,
    publisher: PUBLISHER_EMAIL,
    honesty: {
      payroll_e2e_ready: false,
      formula_live: false,
      browser_uf: false,
      seed: false,
      j_hrm_07_module_uat: false,
    },
    dist_rebuild: true,
    dist_markers: distMarkers(),
    calls: [],
    checks: {},
    failed_acs: [],
    verdict: 'FAIL',
  };

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
  const publisherTok = publisherLogin.token;

  // Route probe — aggregate must not 404 (stale dist)
  const sheetsList = await call(authorTok, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY, page_size: 50 },
  });
  report.calls.push(sheetsList);
  const sheets = listRows(sheetsList.data);
  report.sheet_inventory = sheets.map((s) => ({
    id: sheetId(s),
    status: sheetStatus(s),
    company_id: s.company_id || s.companyId,
    start_date: s.start_date || s.startDate || s.period_start,
    end_date: s.end_date || s.endDate || s.period_end,
  }));

  const closedSheets = sheets.filter((s) => sheetStatus(s) === 'closed');
  const openish = sheets.filter((s) => ['draft', 'open', 'submitted'].includes(sheetStatus(s)));

  // Prefer open/draft/submitted; else reopen a NON-Jul closed sheet (preserve Jul CB-BAG PROCESS month)
  let workSheet = openish[0] || null;
  let createdSheet = null;
  let preReopen = null;
  if (!workSheet) {
    const candidate =
      closedSheets.find((s) => {
        const ymd = ymdFromIso(s.start_date || s.startDate || s.period_start);
        return !ymd.startsWith('2026-07');
      }) || closedSheets[0];
    if (candidate) {
      const cid = sheetId(candidate);
      preReopen = await call(authorTok, 'POST', `/attendance/attendance-sheets/${cid}/reopen`, {
        query: { company_id: COMPANY },
        body: { reopen_reason: `QA-ATT-LINE prep reopen ${STAMP}` },
      });
      report.calls.push(preReopen);
      if (preReopen.status >= 200 && preReopen.status < 300) {
        const getR = await call(authorTok, 'GET', `/attendance/attendance-sheets/${cid}`, {
          query: { company_id: COMPANY },
        });
        report.calls.push(getR);
        workSheet = getR.data || { ...candidate, status: 'submitted', id: cid };
      }
    }
  }
  if (!workSheet) {
    const bounds = monthBounds('2034-03');
    createdSheet = await call(authorTok, 'POST', '/attendance/attendance-sheets', {
      query: { company_id: COMPANY },
      body: {
        company_id: 'holding',
        name: `QA-ATT-LINE ${STAMP}`,
        start_date: bounds.start,
        end_date: bounds.end,
      },
    });
    report.calls.push(createdSheet);
    if (createdSheet.status >= 200 && createdSheet.status < 300 && sheetId(createdSheet.data)) {
      workSheet = createdSheet.data;
    }
  }

  const workId = sheetId(workSheet);
  report.work_sheet = {
    id: workId,
    status: sheetStatus(workSheet),
    created: !!createdSheet,
    pre_reopen_archived: preReopen?.data?.lines_archived ?? null,
  };

  // --- AC1a AGG ---
  let agg = null;
  if (workId) {
    agg = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/aggregate`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(agg);
  }
  const aggOk =
    !!agg &&
    agg.status !== 404 &&
    ((agg.status >= 200 && agg.status < 300 && typeof agg.data?.line_count === 'number') ||
      (agg.status === 409 && String(agg.code || '').includes('LOCKED')));
  const aggWarn = (agg?.data?.warnings || []).map(String);
  const aggDateInvalid = aggWarn.some((w) => w.includes('AGG_SHEET_DATE_INVALID'));
  report.checks.ac1_aggregate = passFail(
    aggOk && !aggDateInvalid,
    agg
      ? `HTTP ${agg.status} code=${agg.code} line_count=${agg.data?.line_count} warnings=${JSON.stringify(aggWarn)}${aggDateInvalid ? ' · P0 DATE_COERCE: pg Date String().slice(0,10) ≠ YYYY-MM-DD' : ''}`
      : 'no work sheet',
  );

  // --- AC1b submit invokes AGG ---
  let submit = null;
  if (workId && sheetStatus(workSheet) !== 'closed') {
    // refresh status
    const get1 = await call(authorTok, 'GET', `/attendance/attendance-sheets/${workId}`, {
      query: { company_id: COMPANY },
    });
    report.calls.push(get1);
    const st = sheetStatus(get1.data || workSheet);
    if (st === 'draft' || st === 'open' || st === 'submitted') {
      submit = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/submit`, {
        query: { company_id: COMPANY },
        body: {},
      });
      report.calls.push(submit);
    }
  }
  const submitOk =
    !!submit &&
    submit.status >= 200 &&
    submit.status < 300 &&
    typeof submit.data?.line_count === 'number' &&
    String(submit.data?.status || '').toLowerCase() === 'submitted';
  report.checks.ac1_submit_invokes_agg = passFail(
    submitOk,
    submit
      ? `HTTP ${submit.status} status=${submit.data?.status} line_count=${submit.data?.line_count}`
      : 'submit skipped/unavailable',
  );

  // --- AC1c sign + close → line_locked ---
  let close = null;
  let lineLockedCount = null;
  if (workId && submitOk) {
    await signAll(authorTok, workId, report);
    const sigs = await call(authorTok, 'GET', `/attendance/attendance-sheets/${workId}/signatures`, {
      query: { company_id: COMPANY },
    });
    report.calls.push(sigs);
    report.can_close = !!sigs.data?.can_close;
    close = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/close`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(close);
    lineLockedCount = close.data?.line_locked_count;
  }
  const closeOk =
    !!close &&
    close.status >= 200 &&
    close.status < 300 &&
    String(close.data?.status || '').toLowerCase() === 'closed' &&
    typeof lineLockedCount === 'number';
  report.checks.ac1_close_line_locked = passFail(
    closeOk,
    close
      ? `HTTP ${close.status} status=${close.data?.status} line_locked_count=${lineLockedCount}`
      : 'close skipped',
  );

  // AGG on closed must 409 LOCKED
  let aggClosed = null;
  if (workId && closeOk) {
    aggClosed = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/aggregate`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(aggClosed);
  } else if (closedSheets[0]) {
    const cid = sheetId(closedSheets[0]);
    aggClosed = await call(authorTok, 'POST', `/attendance/attendance-sheets/${cid}/aggregate`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(aggClosed);
  }
  report.checks.ac1_agg_closed_locked = passFail(
    !!aggClosed &&
      aggClosed.status === 409 &&
      String(aggClosed.code || '').includes('HRM-ATT-SHEET-LOCKED'),
    aggClosed
      ? `HTTP ${aggClosed.status} code=${aggClosed.code} msg=${aggClosed.message}`
      : 'no closed sheet for AGG lock probe',
  );

  // Hours formula for PREVIEW/PROCESS
  const formula = await ensureHoursFormula(authorTok, publisherTok, report);
  report.hours_formula = {
    ok: formula.ok,
    id: formula.id,
    code: formula.code,
    self_publish_code: formula.selfDeny?.code,
  };

  // Pick employee: prefer from eligibility of a period aligned to closed work sheet, else first emp
  const emps = await call(authorTok, 'GET', '/employees', {
    query: { company_id: COMPANY, page_size: 20 },
  });
  report.calls.push(emps);
  const empRows = listRows(emps.data);
  let employeeId = empRows[0]?.id || empRows[0]?.employee_id || null;

  // --- AC4 bind: closed+locked → preview without ATT_TIMESHEET_LINE_ABSENT ---
  let bindPreview = null;
  let bindSheetId = workId && closeOk ? workId : null;
  let bindPeriod = null;

  // If our work sheet closed with line_locked_count>=0, use its period; else try AGG+close path on a disposable reopen of non-Jul closed sheet
  if (bindSheetId && closeOk) {
    const getClosed = await call(authorTok, 'GET', `/attendance/attendance-sheets/${bindSheetId}`, {
      query: { company_id: COMPANY },
    });
    report.calls.push(getClosed);
    const ps = getClosed.data?.start_date || getClosed.data?.startDate || getClosed.data?.period_start;
    const pe = getClosed.data?.end_date || getClosed.data?.endDate || getClosed.data?.period_end;
    const startYmd = ymdFromIso(ps).slice(0, 10);
    const endYmd = ymdFromIso(pe).slice(0, 10);
    const mm = startYmd.slice(0, 7);
    const bounds = monthBounds(mm);
    bindPeriod = { start: bounds.start, end: bounds.end, sheet_start: startYmd, sheet_end: endYmd };
  }

  // If close yielded lines, try to get an employee that has a line via eligibility enroll list for that month
  if (formula.ok && bindSheetId && bindPeriod) {
    const eligPeriod = await call(authorTok, 'POST', '/payroll/periods', {
      body: {
        company_id: COMPANY,
        period_label: `QA-ATT-LINE bind ${STAMP}`,
        start_date: bindPeriod.start,
        end_date: bindPeriod.end,
      },
    });
    report.calls.push(eligPeriod);
    let periodId = eligPeriod.data?.id ?? eligPeriod.json?.data?.id ?? null;
    if (!periodId && (eligPeriod.status === 409 || eligPeriod.status === 400)) {
      const periods = await call(authorTok, 'GET', '/payroll/periods', {
        query: { company_id: COMPANY },
      });
      report.calls.push(periods);
      const hit = listRows(periods.data).find((p) => {
        const a = ymdFromIso(p.start_date || p.startDate || p.period_start).slice(0, 7);
        return a === bindPeriod.start.slice(0, 7);
      });
      periodId = hit?.id || null;
    }
    if (periodId) {
      const elig = await call(authorTok, 'GET', `/payroll/periods/${periodId}/eligibility`, {
        query: { company_id: COMPANY },
      });
      report.calls.push(elig);
      const eligEmps = listRows(elig.data?.employees || elig.data?.items || elig.data);
      if (eligEmps[0]?.employee_id || eligEmps[0]?.id) {
        employeeId = eligEmps[0].employee_id || eligEmps[0].id;
      }
      const payslips = await call(authorTok, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId, page_size: 5 },
      });
      report.calls.push(payslips);
      const psRows = listRows(payslips.data);
      if (psRows[0]?.employee_id) employeeId = psRows[0].employee_id;
    }

    bindPreview = await call(authorTok, 'POST', `/payroll/formulas/${formula.id}/preview`, {
      query: { company_id: COMPANY },
      body: {
        employeeId,
        // PreviewPayFormulaDto: periodId | employeeId | variableOverrides only (asOfDate=today server-side)
        variableOverrides: { base_salary: 100000 },
      },
    });
    report.calls.push(bindPreview);
  }

  const bindWarnings = [
    ...(bindPreview?.data?.warnings || []),
    ...(bindPreview?.details?.warnings || []),
    ...(bindPreview?.json?.details?.warnings || []),
  ].map(String);
  const bindAbsent = bindWarnings.some((w) => w.includes('ATT_TIMESHEET_LINE_ABSENT'));
  const bindIncomplete = bindWarnings.some((w) => w.includes('ATT_HOURS_VAR_BAG_INCOMPLETE'));
  const bindReady =
    !!bindPreview &&
    bindPreview.status >= 200 &&
    bindPreview.status < 300 &&
    !bindAbsent &&
    typeof bindPreview.data?.gross === 'number';
  // line_locked_count===0 still valid schema wire but bind may incomplete — distinguish
  const bindWireOk =
    closeOk &&
    typeof lineLockedCount === 'number' &&
    lineLockedCount > 0 &&
    !!bindPreview &&
    !bindAbsent &&
    (bindReady || (bindPreview.status === 412 && !bindAbsent && bindIncomplete === false));
  // Accept: 2xx compute without ABSENT, OR if hours bound but other stub — primary: no ABSENT when locked lines exist
  const ac4Ok =
    !!bindPreview &&
    closeOk &&
    lineLockedCount > 0 &&
    !bindAbsent &&
    (bindPreview.status < 400 ||
      (bindPreview.status === 412 &&
        String(bindPreview.code || '').includes('PREVIEW-STUB') &&
        !bindAbsent &&
        bindIncomplete));
  // Stricter preferred: 2xx without ABSENT
  const ac4Strict =
    !!bindPreview &&
    closeOk &&
    lineLockedCount > 0 &&
    bindPreview.status >= 200 &&
    bindPreview.status < 300 &&
    !bindAbsent &&
    !bindIncomplete;

  report.checks.ac4_closed_locked_bind = passFail(
    ac4Strict || (ac4Ok && !bindAbsent && lineLockedCount > 0 && bindPreview.status < 500),
    bindPreview
      ? `HTTP ${bindPreview.status} code=${bindPreview.code} line_locked_count=${lineLockedCount} absent=${bindAbsent} incomplete=${bindIncomplete} warnings=${JSON.stringify(bindWarnings)} gross=${bindPreview.data?.gross} ready=${bindPreview.data?.payroll_e2e_ready}`
      : `bind preview skipped closeOk=${closeOk} locked=${lineLockedCount}`,
  );
  if (ac4Strict) {
    report.checks.ac4_closed_locked_bind.note += ' · STRICT_BIND_2xx';
  }
  if (aggDateInvalid || lineLockedCount === 0) {
    report.checks.ac4_closed_locked_bind.ok = false;
    report.checks.ac4_closed_locked_bind.verdict = 'FAIL';
    report.checks.ac4_closed_locked_bind.note +=
      ' · BLOCKED: AGG did not materialize locked lines (AGG_SHEET_DATE_INVALID / line_locked_count=0)';
  }
  report.agg_date_invalid = aggDateInvalid;

  // --- AC1d reopen archives (AFTER bind evidence) ---
  let reopen = null;
  if (workId && closeOk) {
    reopen = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/reopen`, {
      query: { company_id: COMPANY },
      body: { reopen_reason: `QA-ATT-LINE reopen archive ${STAMP}` },
    });
    report.calls.push(reopen);
  }
  const reopenOk =
    !!reopen &&
    reopen.status >= 200 &&
    reopen.status < 300 &&
    typeof reopen.data?.lines_archived === 'number' &&
    (lineLockedCount === 0 || reopen.data.lines_archived >= 1 || reopen.data.lines_archived === lineLockedCount);
  // If locked count was 0, archived 0 is honest
  const reopenPass =
    !!reopen &&
    reopen.status >= 200 &&
    reopen.status < 300 &&
    typeof reopen.data?.lines_archived === 'number' &&
    (lineLockedCount === 0
      ? reopen.data.lines_archived === 0
      : reopen.data.lines_archived >= 1);
  report.checks.ac1_reopen_archives = passFail(
    reopenPass,
    reopen
      ? `HTTP ${reopen.status} status=${reopen.data?.status} lines_archived=${reopen.data?.lines_archived} prior_locked=${lineLockedCount}`
      : 'reopen skipped',
  );

  // --- AC2 PREVIEW incomplete/ABSENT → PREVIEW-STUB ---
  // After reopen, lines archived → no closed+locked → incomplete stub for hours formula
  const incompletePreview = formula.ok
    ? await call(authorTok, 'POST', `/payroll/formulas/${formula.id}/preview`, {
        query: { company_id: COMPANY },
        body: {
          employeeId: employeeId || undefined,
          variableOverrides: { base_salary: 100000 },
          // payable_hours intentionally from bag only — no override
        },
      })
    : null;
  if (incompletePreview) report.calls.push(incompletePreview);
  const incWarn = [
    ...(incompletePreview?.details?.warnings || []),
    ...(incompletePreview?.json?.details?.warnings || []),
    ...(incompletePreview?.data?.warnings || []),
  ].map(String);
  const stubCode = String(incompletePreview?.code || incompletePreview?.json?.code || '');
  const ac2Ok =
    !!incompletePreview &&
    incompletePreview.status === 412 &&
    stubCode.includes('PREVIEW-STUB') &&
    (incWarn.some((w) => w.includes('ATT_HOURS_VAR_BAG_INCOMPLETE') || w.includes('ATT_TIMESHEET_LINE_ABSENT') || w.includes('ATT_HOURS_BLOCKED')) ||
      String(incompletePreview.message || '').toLowerCase().includes('att'));
  // Ensure not silent 0 compute
  const silentZero =
    incompletePreview &&
    incompletePreview.status >= 200 &&
    incompletePreview.status < 300 &&
    incompletePreview.data?.gross === 0 &&
    incompletePreview.data?.net === 0;
  report.checks.ac2_preview_stub_incomplete = passFail(
    ac2Ok && !silentZero,
    incompletePreview
      ? `HTTP ${incompletePreview.status} code=${stubCode} silent0=${!!silentZero} warnings=${JSON.stringify(incWarn)} msg=${incompletePreview.message}`
      : 'preview skipped',
  );

  // --- AC3 PROCESS open/missing → ATT-412 ---
  const openBounds = monthBounds('2036-02');
  const openPeriod = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-ATT-LINE open ${STAMP}`,
      start_date: openBounds.start,
      end_date: openBounds.end,
    },
  });
  report.calls.push(openPeriod);
  let openPeriodId = openPeriod.data?.id ?? openPeriod.json?.data?.id ?? null;
  if (!openPeriodId && (openPeriod.status === 409 || openPeriod.status >= 400)) {
    const periods = await call(authorTok, 'GET', '/payroll/periods', {
      query: { company_id: COMPANY },
    });
    report.calls.push(periods);
    const hit = listRows(periods.data).find((p) => {
      const a = ymdFromIso(p.start_date || p.startDate || p.period_start).slice(0, 7);
      return a === '2036-02' || a === '2035-11';
    });
    openPeriodId = hit?.id || null;
  }
  let processOpen = null;
  if (openPeriodId) {
    // enroll one emp if needed
    if (employeeId) {
      const enroll = await call(authorTok, 'POST', `/payroll/periods/${openPeriodId}/enroll`, {
        query: { company_id: COMPANY },
        body: { employee_ids: [employeeId] },
      });
      report.calls.push(enroll);
    }
    processOpen = await call(authorTok, 'POST', `/payroll/periods/${openPeriodId}/process`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(processOpen);
  }
  const ac3Ok =
    !!processOpen &&
    processOpen.status === 412 &&
    String(processOpen.code || processOpen.json?.code || '').includes('HRM-PAY-ATT-412');
  report.checks.ac3_process_att_412 = passFail(
    ac3Ok,
    processOpen
      ? `HTTP ${processOpen.status} code=${processOpen.code} msg=${processOpen.message}`
      : 'process open skipped',
  );

  // Honesty: ready flag never true on preview responses
  const readyLeak =
    (bindPreview?.data?.payroll_e2e_ready === true) ||
    (incompletePreview?.details?.payroll_e2e_ready === true) ||
    (incompletePreview?.json?.details?.payroll_e2e_ready === true);
  report.checks.honesty_ready_false = passFail(
    !readyLeak,
    `ready_leak=${!!readyLeak} bind_ready=${bindPreview?.data?.payroll_e2e_ready}`,
  );

  // Aggregate AC1 rollup
  const ac1 =
    report.checks.ac1_aggregate.ok &&
    report.checks.ac1_submit_invokes_agg.ok &&
    report.checks.ac1_close_line_locked.ok &&
    report.checks.ac1_reopen_archives.ok &&
    report.checks.ac1_agg_closed_locked.ok;
  report.checks.ac1_agg_submit_close_reopen = passFail(
    ac1,
    `agg=${report.checks.ac1_aggregate.verdict} submit=${report.checks.ac1_submit_invokes_agg.verdict} close=${report.checks.ac1_close_line_locked.verdict} reopen=${report.checks.ac1_reopen_archives.verdict} lockedAgg=${report.checks.ac1_agg_closed_locked.verdict}`,
  );

  const required = [
    ['AC1', report.checks.ac1_agg_submit_close_reopen],
    ['AC2', report.checks.ac2_preview_stub_incomplete],
    ['AC3', report.checks.ac3_process_att_412],
    ['AC4', report.checks.ac4_closed_locked_bind],
    ['HONESTY', report.checks.honesty_ready_false],
  ];
  for (const [name, c] of required) {
    if (!c?.ok) report.failed_acs.push(name);
  }
  report.verdict = report.failed_acs.length === 0 ? 'PASS' : 'FAIL';
  report.honesty_final = {
    payroll_e2e_ready: false,
    formula_live: false,
    seed: false,
    j_hrm_07_module_uat: false,
  };
  report.bindWireOk = bindWireOk;
  report.line_locked_count = lineLockedCount;
  report.employeeId = employeeId;

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({
    stamp: STAMP,
    verdict: report.verdict,
    failed_acs: report.failed_acs,
    checks: Object.fromEntries(
      Object.entries(report.checks).map(([k, v]) => [k, { verdict: v.verdict, note: v.note }]),
    ),
    out: OUT,
  }, null, 2));
  process.exit(report.verdict === 'PASS' ? 0 : 2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
