#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03 — AC4 STRICT after FE density path
 * Prior: FE-ATT-ENROLL-01 READY · QC-ATT-LINE-02 GWC AC4-BIND OPEN · QA-02 SKIP empty
 * U65 zero-seed · product-path punch/OT only · payroll_e2e_ready=false
 * Path A preferred: today punch → Aug sheet → AGG line_count>0 → sign → close → PREVIEW bind
 * Path B fallback: reopen Sep/Jan (NOT Jul) → OT approve → AGG → close → bind
 * Retain AC2 PREVIEW-STUB · AC3 ATT-412
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
const SHEET_COMPANY = 'holding';
const STAMP = `PAYFEATT-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json');

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

function todayYmd() {
  return ymdFromIso(new Date().toISOString());
}

function distMarkers() {
  const base = resolve(ROOT, 'apps/api/hrm-api/dist');
  const agg = resolve(base, 'attendance/att-timesheet-line-aggregate.js');
  const bag = resolve(base, 'payroll/pay-formula-variable-bag.js');
  const ctrl = resolve(base, 'attendance/attendance.controller.js');
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
  const aggSrc = read(agg);
  return {
    agg_present: existsSync(agg),
    bag_present: existsSync(bag),
    agg_has_toLeaveDayKey: aggSrc.includes('toLeaveDayKey'),
    agg_has_stale_string_slice: /String\(\s*header\.start_date\s*\)\.slice/.test(aggSrc),
    bag_has_load: read(bag).includes('loadAttHoursFromClosedLine'),
    ctrl_has_aggregate: read(ctrl).includes('aggregateAttendanceSheet'),
  };
}

function collectWarnings(resp) {
  return [
    ...(resp?.data?.warnings || []),
    ...(resp?.details?.warnings || []),
    ...(resp?.json?.details?.warnings || []),
    ...(Array.isArray(resp?.warnings) ? resp.warnings : []),
  ].map(String);
}

async function ensureHoursFormula(authorTok, publisherTok, report) {
  const code = `qa_att_hrs_${Date.now().toString(36)}`.slice(0, 48);
  const create = await call(authorTok, 'POST', '/payroll/formulas', {
    body: {
      company_id: COMPANY,
      code,
      label: `QA-ATT-LINE-03 hours ${STAMP}`,
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
  return { ok: active, id, code, create, submit, selfDeny, publish };
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
      body: { ...p, outcome: 'approved', comment: `QA-ATT-LINE-03 ${STAMP}` },
    });
    report.calls.push(r);
    outs.push(r);
  }
  return outs;
}

function isJulSheet(row) {
  const ymd = ymdFromIso(row.start_date || row.startDate || row.period_start);
  return ymd.startsWith('2026-07');
}

function coversYmd(row, ymd) {
  const s = ymdFromIso(row.start_date || row.startDate || row.period_start).slice(0, 10);
  const e = ymdFromIso(row.end_date || row.endDate || row.period_end).slice(0, 10);
  return s && e && s <= ymd && e >= ymd;
}

async function ensureOpenSheetForWindow(token, sheets, yyyyMm, report) {
  const bounds = monthBounds(yyyyMm);
  const inWindow = sheets.filter((s) => {
    if (isJulSheet(s)) return false;
    const sY = ymdFromIso(s.start_date || s.startDate || s.period_start).slice(0, 7);
    return sY === yyyyMm || coversYmd(s, bounds.start);
  });

  let work = inWindow.find((s) => ['draft', 'open', 'submitted'].includes(sheetStatus(s))) || null;
  if (work) {
    return { work, path: 'reuse_open', created: null, reopen: null };
  }

  const closed = inWindow.find((s) => sheetStatus(s) === 'closed');
  if (closed) {
    const cid = sheetId(closed);
    const reopen = await call(token, 'POST', `/attendance/attendance-sheets/${cid}/reopen`, {
      query: { company_id: COMPANY },
      body: { reopen_reason: `QA-ATT-LINE-03 reopen ${STAMP}` },
    });
    report.calls.push(reopen);
    if (reopen.status >= 200 && reopen.status < 300) {
      const getR = await call(token, 'GET', `/attendance/attendance-sheets/${cid}`, {
        query: { company_id: COMPANY },
      });
      report.calls.push(getR);
      return {
        work: getR.data || { ...closed, status: 'submitted', id: cid },
        path: 'reopen_closed',
        created: null,
        reopen,
      };
    }
  }

  const created = await call(token, 'POST', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY },
    body: {
      company_id: SHEET_COMPANY,
      name: `QA-ATT-LINE-03 ${yyyyMm} ${STAMP}`,
      start_date: bounds.start,
      end_date: bounds.end,
    },
  });
  report.calls.push(created);
  if (created.status >= 200 && created.status < 300 && sheetId(created.data)) {
    return { work: created.data, path: 'created', created, reopen: null };
  }
  return { work: null, path: 'failed', created, reopen: null };
}

async function productPunchToday(token, employeeId, today, report) {
  const checkIn = new Date(`${today}T08:00:00+07:00`).toISOString();
  const checkOut = new Date(`${today}T17:00:00+07:00`).toISOString();
  const rec = await call(token, 'POST', '/attendance/records', {
    query: { company_id: COMPANY },
    body: {
      company_id: SHEET_COMPANY,
      employee_id: employeeId,
      attendance_date: today,
      check_in_at: checkIn,
      check_out_at: checkOut,
      status: 'present',
      note: `QA-ATT-LINE-03 PathA punch ${STAMP}`,
      created_by: AUTHOR_EMAIL,
    },
  });
  report.calls.push(rec);
  return rec;
}

async function productOtInWindow(token, emp, otDate, report) {
  const create = await call(token, 'POST', '/attendance/overtime-requests', {
    query: { company_id: COMPANY },
    body: {
      company_id: SHEET_COMPANY,
      employee_id: emp.id,
      employee_code: emp.code || emp.employee_code || 'QA',
      employee_name: emp.full_name || emp.name || emp.display_name || 'QA Emp',
      overtime_date: otDate,
      start_time: '18:00',
      end_time: '20:00',
      total_hours: 2,
      overtime_type: 'weekday',
      reason: `QA-ATT-LINE-03 PathB OT ${STAMP}`,
      compensation_type: 'pay',
    },
  });
  report.calls.push(create);
  const otId = create.data?.id ?? create.json?.data?.id ?? null;
  let approve = null;
  if (otId && create.status >= 200 && create.status < 300) {
    approve = await call(token, 'POST', `/attendance/overtime-requests/${otId}/approve`, {
      query: { company_id: COMPANY },
      body: { comment: `QA-ATT-LINE-03 approve ${STAMP}` },
    });
    report.calls.push(approve);
  }
  return { create, approve, otId };
}

async function main() {
  const today = todayYmd();
  const todayMm = today.slice(0, 7);
  const report = {
    work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03',
    prior: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01',
    parent: 'PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01',
    stamp: STAMP,
    portal_url: PORTAL,
    hrm_url: HRM,
    company_id: COMPANY,
    today,
    author: AUTHOR_EMAIL,
    publisher: PUBLISHER_EMAIL,
    honesty: {
      payroll_e2e_ready: false,
      formula_live: false,
      browser_uf: false,
      seed: false,
      j_hrm_07_module_uat: false,
    },
    path_used: null,
    dist_markers: distMarkers(),
    calls: [],
    checks: {},
    failed_acs: [],
    verdict: 'FAIL',
  };

  if (!report.dist_markers.agg_has_toLeaveDayKey || report.dist_markers.agg_has_stale_string_slice) {
    report.checks.dist_toLeaveDayKey = passFail(false, JSON.stringify(report.dist_markers));
    report.failed_acs.push('DIST');
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify({ stamp: STAMP, verdict: 'FAIL', failed_acs: report.failed_acs, out: OUT }, null, 2));
    process.exit(2);
  }
  report.checks.dist_toLeaveDayKey = passFail(true, 'toLeaveDayKey present');

  const authorLogin = await login(AUTHOR_EMAIL);
  report.author_login = { ok: authorLogin.ok, status: authorLogin.status, sub: authorLogin.sub };
  if (!authorLogin.ok) throw new Error(`author login fail ${authorLogin.status}`);
  const publisherLogin = await login(PUBLISHER_EMAIL);
  report.publisher_login = {
    ok: publisherLogin.ok,
    status: publisherLogin.status,
    sub: publisherLogin.sub,
  };
  if (!publisherLogin.ok) throw new Error(`publisher login fail ${publisherLogin.status}`);
  if (publisherLogin.sub === authorLogin.sub) {
    throw new Error('publisher sub must differ from author');
  }
  const authorTok = authorLogin.token;
  const publisherTok = publisherLogin.token;

  const emps = await call(authorTok, 'GET', '/employees', {
    query: { company_id: COMPANY, page_size: 20 },
  });
  report.calls.push(emps);
  const empRows = listRows(emps.data).filter((e) => {
    const st = String(e.status || e.employment_status || 'active').toLowerCase();
    return st === 'active' || st === '' || st === 'employed';
  });
  const emp = empRows[0] || listRows(emps.data)[0];
  const employeeId = emp?.id || emp?.employee_id || null;
  report.employee = {
    id: employeeId,
    code: emp?.employee_code || emp?.code || null,
    name: emp?.full_name || emp?.name || null,
  };
  if (!employeeId) throw new Error('no employee for product punch');

  const sheetsList = await call(authorTok, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY, page_size: 50 },
  });
  report.calls.push(sheetsList);
  const sheets = listRows(sheetsList.data);
  report.sheet_inventory = sheets.map((s) => ({
    id: sheetId(s),
    status: sheetStatus(s),
    start_date: s.start_date || s.startDate || s.period_start,
    end_date: s.end_date || s.endDate || s.period_end,
    is_jul: isJulSheet(s),
  }));

  // --- Density Path A (today in window) or Path B (Sep/Jan OT) ---
  let densityPath = null;
  let workMeta = null;
  let punch = null;
  let ot = null;

  if (todayMm === '2026-08' || today.startsWith('2026-08')) {
    densityPath = 'A';
    punch = await productPunchToday(authorTok, employeeId, today, report);
    workMeta = await ensureOpenSheetForWindow(authorTok, sheets, '2026-08', report);
  } else {
    densityPath = 'B';
  }

  if (!workMeta?.work) {
    // Path B: Sep preferred, then Jan — never Jul
    densityPath = densityPath === 'A' && workMeta?.work ? 'A' : 'B';
    for (const mm of ['2026-09', '2026-01']) {
      workMeta = await ensureOpenSheetForWindow(authorTok, sheets, mm, report);
      if (workMeta.work) {
        const otDate = monthBounds(mm).start.slice(0, 8) + '15';
        ot = await productOtInWindow(
          authorTok,
          {
            id: employeeId,
            code: report.employee.code,
            full_name: report.employee.name,
          },
          otDate,
          report,
        );
        densityPath = 'B';
        break;
      }
    }
  } else if (densityPath === 'A') {
    // Path A already punched; if AGG still empty later we may supplement OT
  }

  // If Path A sheet failed to open/create, fall back Path B
  if (!workMeta?.work) {
    for (const mm of ['2026-09', '2026-01']) {
      workMeta = await ensureOpenSheetForWindow(authorTok, sheets, mm, report);
      if (workMeta.work) {
        const otDate = `${mm}-15`;
        ot = await productOtInWindow(
          authorTok,
          { id: employeeId, code: report.employee.code, full_name: report.employee.name },
          otDate,
          report,
        );
        densityPath = 'B';
        break;
      }
    }
  }

  report.path_used = densityPath;
  report.density = {
    punch_status: punch?.status ?? null,
    punch_code: punch?.code ?? null,
    ot_create_status: ot?.create?.status ?? null,
    ot_approve_status: ot?.approve?.status ?? null,
    ot_id: ot?.otId ?? null,
    sheet_path: workMeta?.path ?? null,
  };

  const workId = sheetId(workMeta?.work);
  report.work_sheet = {
    id: workId,
    status: sheetStatus(workMeta?.work),
    sheet_path: workMeta?.path,
  };

  if (!workId) {
    report.checks.ac4_density = passFail(false, 'no non-Jul work sheet');
    report.failed_acs.push('AC4-DENSITY');
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify({ stamp: STAMP, verdict: 'FAIL', failed_acs: report.failed_acs, out: OUT }, null, 2));
    process.exit(2);
  }

  // AGG after density
  let agg = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/aggregate`, {
    query: { company_id: COMPANY },
    body: {},
  });
  report.calls.push(agg);

  // If Path A punch OK but AGG empty, try supplement OT in Aug window then re-AGG
  let lineCount = typeof agg?.data?.line_count === 'number' ? agg.data.line_count : null;
  let aggWarn = collectWarnings(agg);
  if ((lineCount === 0 || aggWarn.includes('AGG_EMPTY_ENROLLMENT')) && densityPath === 'A') {
    const otDate = today;
    ot = await productOtInWindow(
      authorTok,
      { id: employeeId, code: report.employee.code, full_name: report.employee.name },
      otDate,
      report,
    );
    report.density.ot_supplement = {
      create: ot?.create?.status,
      approve: ot?.approve?.status,
    };
    agg = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/aggregate`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(agg);
    lineCount = typeof agg?.data?.line_count === 'number' ? agg.data.line_count : null;
    aggWarn = collectWarnings(agg);
  }

  const aggDateInvalid = aggWarn.some((w) => w.includes('AGG_SHEET_DATE_INVALID'));
  const aggEmptyEnrollment = aggWarn.some((w) => w.includes('AGG_EMPTY_ENROLLMENT'));
  const densityOk = !aggDateInvalid && typeof lineCount === 'number' && lineCount > 0;
  report.checks.ac4_density = passFail(
    densityOk,
    `path=${densityPath} HTTP ${agg.status} line_count=${lineCount} warnings=${JSON.stringify(aggWarn)} punch=${punch?.status} ot=${ot?.approve?.status ?? ot?.create?.status}`,
  );
  report.agg_line_count = lineCount;
  report.agg_empty_enrollment = aggEmptyEnrollment;
  report.agg_date_invalid = aggDateInvalid;

  // Submit → sign → close
  let submit = null;
  const get1 = await call(authorTok, 'GET', `/attendance/attendance-sheets/${workId}`, {
    query: { company_id: COMPANY },
  });
  report.calls.push(get1);
  const st = sheetStatus(get1.data || workMeta.work);
  if (['draft', 'open', 'submitted'].includes(st)) {
    submit = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/submit`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(submit);
  }
  const submitOk =
    !!submit &&
    submit.status >= 200 &&
    submit.status < 300 &&
    String(submit.data?.status || '').toLowerCase() === 'submitted';
  report.checks.ac1_submit = passFail(
    submitOk,
    submit ? `HTTP ${submit.status} line_count=${submit.data?.line_count} status=${submit.data?.status}` : 'skip',
  );

  let close = null;
  let lineLockedCount = null;
  if (submitOk) {
    await signAll(authorTok, workId, report);
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
    typeof lineLockedCount === 'number' &&
    lineLockedCount > 0;
  report.checks.ac1_close_locked = passFail(
    closeOk,
    close
      ? `HTTP ${close.status} status=${close.data?.status} line_locked_count=${lineLockedCount}`
      : 'close skipped',
  );

  // AGG closed → 409 LOCKED
  let aggClosed = null;
  if (closeOk) {
    aggClosed = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/aggregate`, {
      query: { company_id: COMPANY },
      body: {},
    });
    report.calls.push(aggClosed);
  }
  report.checks.ac1_agg_closed_locked = passFail(
    !!aggClosed &&
      aggClosed.status === 409 &&
      String(aggClosed.code || '').includes('HRM-ATT-SHEET-LOCKED'),
    aggClosed ? `HTTP ${aggClosed.status} code=${aggClosed.code}` : 'skipped',
  );

  const formula = await ensureHoursFormula(authorTok, publisherTok, report);
  report.hours_formula = {
    ok: formula.ok,
    id: formula.id,
    code: formula.code,
    self_publish_code: formula.selfDeny?.code,
  };

  // AC4 STRICT bind — PREVIEW while sheet still closed+locked (before reopen)
  let bindPreview = null;
  if (formula.ok && closeOk && employeeId) {
    bindPreview = await call(authorTok, 'POST', `/payroll/formulas/${formula.id}/preview`, {
      query: { company_id: COMPANY },
      body: {
        employeeId,
        variableOverrides: { base_salary: 100000 },
      },
    });
    report.calls.push(bindPreview);
  }

  const bindWarnings = collectWarnings(bindPreview);
  const bindAbsent = bindWarnings.some((w) => w.includes('ATT_TIMESHEET_LINE_ABSENT'));
  const bindIncomplete = bindWarnings.some((w) => w.includes('ATT_HOURS_VAR_BAG_INCOMPLETE'));
  const bindFromLine = bindWarnings.some((w) => w.includes('ATT_HOURS_FROM_CLOSED_LINE'));
  const bindLineMissing = bindWarnings.some((w) => w.includes('ATT_LINE_MISSING'));
  const bindReadyFlag = bindPreview?.data?.att_hours_ready ?? bindPreview?.data?.attHoursReady ?? null;
  const vars = bindPreview?.data?.vars || bindPreview?.data?.variable_bag || bindPreview?.json?.data?.vars || {};
  const payableHours =
    vars.payable_hours ??
    bindPreview?.data?.payable_hours ??
    bindPreview?.json?.data?.vars?.payable_hours ??
    null;
  const gross = bindPreview?.data?.gross;
  const readyLeak =
    bindPreview?.data?.payroll_e2e_ready === true ||
    bindPreview?.json?.data?.payroll_e2e_ready === true;

  // STRICT: closed+locked + 2xx + no ABSENT + hours from closed line (or finite payable_hours) + no incomplete
  const ac4Strict =
    densityOk &&
    closeOk &&
    lineLockedCount > 0 &&
    !!bindPreview &&
    bindPreview.status >= 200 &&
    bindPreview.status < 300 &&
    !bindAbsent &&
    !bindIncomplete &&
    !bindLineMissing &&
    (bindFromLine || (typeof payableHours === 'number' && Number.isFinite(payableHours))) &&
    !readyLeak;

  // Soft accept: 412 PREVIEW-STUB without ABSENT when lines locked is NOT STRICT PASS for this seat
  // Mission = STRICT prove bind — require ac4Strict
  report.checks.ac4_closed_locked_bind = passFail(
    ac4Strict,
    bindPreview
      ? `STRICT path=${densityPath} HTTP ${bindPreview.status} code=${bindPreview.code} locked=${lineLockedCount} absent=${bindAbsent} incomplete=${bindIncomplete} from_line=${bindFromLine} line_missing=${bindLineMissing} payable_hours=${payableHours} gross=${gross} ready_leak=${readyLeak} warnings=${JSON.stringify(bindWarnings)}`
      : `no bind preview densityOk=${densityOk} closeOk=${closeOk}`,
  );
  report.checks.ac4_closed_locked_bind.strict = true;
  report.checks.ac4_closed_locked_bind.skipped = false;
  report.bind = {
    status: bindPreview?.status ?? null,
    code: bindPreview?.code ?? null,
    absent: bindAbsent,
    incomplete: bindIncomplete,
    from_line: bindFromLine,
    payable_hours: payableHours,
    gross,
    warnings: bindWarnings,
  };

  // Hygiene reopen AFTER bind evidence (archive lines) — then AC2 incomplete
  let reopen = null;
  if (closeOk) {
    reopen = await call(authorTok, 'POST', `/attendance/attendance-sheets/${workId}/reopen`, {
      query: { company_id: COMPANY },
      body: { reopen_reason: `QA-ATT-LINE-03 hygiene reopen after bind ${STAMP}` },
    });
    report.calls.push(reopen);
  }
  report.checks.ac1_reopen_archives = passFail(
    !!reopen &&
      reopen.status >= 200 &&
      reopen.status < 300 &&
      typeof reopen.data?.lines_archived === 'number' &&
      reopen.data.lines_archived >= 1,
    reopen
      ? `HTTP ${reopen.status} lines_archived=${reopen.data?.lines_archived}`
      : 'reopen skipped',
  );

  // AC2 — after reopen, hours incomplete → PREVIEW-STUB (retain)
  const incompletePreview = formula.ok
    ? await call(authorTok, 'POST', `/payroll/formulas/${formula.id}/preview`, {
        query: { company_id: COMPANY },
        body: {
          employeeId,
          variableOverrides: { base_salary: 100000 },
        },
      })
    : null;
  if (incompletePreview) report.calls.push(incompletePreview);
  const incWarn = collectWarnings(incompletePreview);
  const stubCode = String(incompletePreview?.code || incompletePreview?.json?.code || '');
  const silent0 =
    incompletePreview &&
    incompletePreview.status >= 200 &&
    incompletePreview.status < 300 &&
    incompletePreview.data?.gross === 0 &&
    !incWarn.some((w) => w.includes('STUB') || w.includes('INCOMPLETE') || w.includes('ABSENT'));
  const ac2Ok =
    !!incompletePreview &&
    incompletePreview.status === 412 &&
    stubCode.includes('PREVIEW-STUB') &&
    !silent0 &&
    (incWarn.some((w) => w.includes('ATT_HOURS_VAR_BAG_INCOMPLETE') || w.includes('ATT_LINE') || w.includes('NO_CLOSED_SHEET') || w.includes('ATT_TIMESHEET_LINE_ABSENT') || w.includes('ATT_HOURS_BLOCKED')) ||
      stubCode.includes('PREVIEW-STUB'));
  report.checks.ac2_preview_stub_incomplete = passFail(
    ac2Ok,
    incompletePreview
      ? `HTTP ${incompletePreview.status} code=${stubCode} silent0=${!!silent0} warnings=${JSON.stringify(incWarn)}`
      : 'skipped',
  );

  // AC3 — PROCESS open ATT period → ATT-412 (retain)
  const openPeriod = await call(authorTok, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-ATT-LINE-03 open ${STAMP}`,
      start_date: '2036-02-01',
      end_date: '2036-02-28',
    },
  });
  report.calls.push(openPeriod);
  let openPeriodId = openPeriod.data?.id ?? openPeriod.json?.data?.id ?? null;
  if (!openPeriodId && (openPeriod.status === 409 || openPeriod.status === 400)) {
    const periods = await call(authorTok, 'GET', '/payroll/periods', {
      query: { company_id: COMPANY },
    });
    report.calls.push(periods);
    const hit = listRows(periods.data).find((p) => {
      const a = ymdFromIso(p.start_date || p.startDate).slice(0, 7);
      return a === '2036-02';
    });
    openPeriodId = hit?.id || null;
  }
  const processOpen = openPeriodId
    ? await call(authorTok, 'POST', `/payroll/periods/${openPeriodId}/process`, {
        query: { company_id: COMPANY },
        body: {},
      })
    : null;
  if (processOpen) report.calls.push(processOpen);
  const ac3Ok =
    !!processOpen &&
    processOpen.status === 412 &&
    String(processOpen.code || '').includes('ATT-412');
  report.checks.ac3_process_att_412 = passFail(
    ac3Ok,
    processOpen ? `HTTP ${processOpen.status} code=${processOpen.code} msg=${processOpen.message}` : 'no period',
  );

  // Re-close work sheet for hygiene (optional — reopen left submitted; try close again if needed)
  // Prefer leave non-Jul sheet submitted after reopen rather than inventing Jul touch.
  report.hygiene = {
    jul_touched: false,
    work_sheet_after: reopen?.data?.status ?? close?.data?.status ?? null,
    seed: false,
  };

  report.honesty_final = {
    payroll_e2e_ready: false,
    formula_live: false,
    j_hrm_07: false,
    seed: false,
    ready_leak: !!readyLeak,
  };

  const required = [
    ['DIST', report.checks.dist_toLeaveDayKey],
    ['AC4-DENSITY', report.checks.ac4_density],
    ['AC1-SUBMIT', report.checks.ac1_submit],
    ['AC1-CLOSE', report.checks.ac1_close_locked],
    ['AC1-LOCKED-AGG', report.checks.ac1_agg_closed_locked],
    ['AC4', report.checks.ac4_closed_locked_bind],
    ['AC2', report.checks.ac2_preview_stub_incomplete],
    ['AC3', report.checks.ac3_process_att_412],
  ];
  for (const [name, c] of required) {
    if (!c?.ok) report.failed_acs.push(name);
  }
  report.verdict = report.failed_acs.length === 0 ? 'PASS' : 'FAIL';

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        verdict: report.verdict,
        failed_acs: report.failed_acs,
        path_used: report.path_used,
        line_count: lineCount,
        line_locked_count: lineLockedCount,
        bind: report.bind,
        honesty: report.honesty_final,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(report.verdict === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
