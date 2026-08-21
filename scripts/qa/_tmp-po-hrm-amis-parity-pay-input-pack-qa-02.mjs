#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02 — L1 retest after BE-02
 * Prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02 READY_FOR_QA
 * U65 zero-seed · payroll_e2e_ready=false · cấm seed · cấm ready flip
 *
 * Exit ACs:
 *  1) AC-AMIS-ATT-XFER-01 — closed bind → LIST/GET 200 display-ready (name label, status=closed) — no 500 s.code
 *  2) After bind — eligibility items[] not empty; enroll HLD-0001 succeeds OR honest ineligible reasons
 *  3) VAL-INP-ADV-01 — POST …/employees → approve → mark-paid+payrollPeriodId → source_kind=advance
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = 'xevn';
const STAMP = `PAYINPQA2-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const ts = () => new Date().toISOString();
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
function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}
function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data && typeof data.data === 'object' && Array.isArray(data.data.data)) return data.data.data;
  return [];
}
function monthBounds(yyyy, mm) {
  const last = new Date(yyyy, mm, 0).getDate();
  const m = String(mm).padStart(2, '0');
  return { start: `${yyyy}-${m}-01`, end: `${yyyy}-${m}-${String(last).padStart(2, '0')}` };
}
function ymdInVn(iso) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}
function sheetMonth(sheet) {
  const raw = sheet?.start_date || sheet?.startDate || sheet?.period_start || sheet?.date_from;
  if (!raw) return null;
  const ymd = ymdInVn(raw);
  const [yy, mm] = ymd.split('-').map(Number);
  if (!yy || !mm) return null;
  return { y: yy, m: mm, ...monthBounds(yy, mm), ymd };
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return String(aStart).slice(0, 10) <= String(bEnd).slice(0, 10) && String(aEnd).slice(0, 10) >= String(bStart).slice(0, 10);
}
function periodDay(iso) {
  if (!iso) return '';
  return ymdInVn(iso);
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
      if (token) return { ok: true, status: r.status, token, sub: decodeSub(token), via: url };
    } catch {
      /* next */
    }
  }
  return { ok: false, status: 0, token: null, sub: null };
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
    'x-tenant-id': TENANT,
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
    json,
  };
}

const report = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02',
  prior: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02',
  stamp: STAMP,
  lane: 'L1_API_smoke',
  u65: 'zero-seed · API product path · cấm payroll_e2e_ready flip · cấm seed',
  honesty: { payroll_e2e_ready: false, browser_uf: false, module_uat: false, seed_used: false },
  account: EMAIL,
  company_id: COMPANY,
  startedAt: ts(),
  steps: [],
  ac: {},
  residual: [],
  ids: {},
  overall: null,
  endedAt: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, at: ts(), ...result, ...extra });
  writeFileSync(OUT, JSON.stringify(report, null, 2));
}
function save() {
  writeFileSync(OUT, JSON.stringify(report, null, 2));
}

try {
  // --- L0 + live dist ---
  const health = await fetch(HRM.replace(/\/api\/hrm$/, '') + '/api/hrm').then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 120),
  }));
  pushStep('L0_hrm_health', { status: health.status, ok: health.status === 200, note: health.text });

  const distBind = resolve(ROOT, 'apps/api/hrm-api/dist/payroll/pay-period-input-pack.service.js');
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/payroll/payroll.controller.js');
  const distText = existsSync(distBind) ? readFileSync(distBind, 'utf8') : '';
  const ctrlText = existsSync(distCtrl) ? readFileSync(distCtrl, 'utf8') : '';
  const hasNullCode = /NULL::text AS timesheet_code/.test(distText);
  const hasNoSCode = !/\bs\.code\b/.test(distText) || hasNullCode;
  const hasAdvEmpPost = /createAdvanceRequestEmployee/.test(ctrlText);
  pushStep('dist_be02_markers', {
    ok: existsSync(distBind) && hasNullCode && hasAdvEmpPost,
    hasNullCode,
    hasNoSCodeSelect: hasNoSCode,
    hasAdvEmpPost,
    expandElig: /expandPayrollAttendanceSheetCompanyIds/.test(
      existsSync(resolve(ROOT, 'apps/api/hrm-api/dist/payroll/payroll.service.js'))
        ? readFileSync(resolve(ROOT, 'apps/api/hrm-api/dist/payroll/payroll.service.js'), 'utf8')
        : '',
    ),
  });

  for (const p of [
    '/payroll/periods/00000000-0000-4000-8000-000000000001/timesheet-binds',
    '/payroll/advance-requests/00000000-0000-4000-8000-000000000001/employees',
  ]) {
    const stale = await fetch(`${HRM}${p}?company_id=${COMPANY}`, { method: p.includes('employees') ? 'POST' : 'GET' }).then(
      async (r) => ({ status: r.status, text: (await r.text()).slice(0, 180) }),
    );
    pushStep(`stale_dist_probe_${p.split('/').slice(-2).join('_')}`, {
      status: stale.status,
      ok: stale.status === 401 || stale.status === 403,
      note: stale.status === 401 || stale.status === 403 ? 'route live (auth required)' : `status=${stale.status}`,
      body: stale.text,
    });
  }

  const auth = await login(EMAIL);
  pushStep('login_ceo', { status: auth.status, ok: auth.ok, sub: auth.sub });
  if (!auth.ok) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: 'login_failed' };
    report.endedAt = ts();
    save();
    process.exit(2);
  }
  const token = auth.token;

  // --- inventory ---
  const sheets = await call(token, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY, page_size: 100 },
  });
  const sheetRows = asList(sheets.data);
  const closedSheets = sheetRows.filter((s) => String(s.status || '').toLowerCase() === 'closed');
  const openSheets = sheetRows.filter((s) => !['closed', 'archived'].includes(String(s.status || '').toLowerCase()));
  pushStep('list_attendance_sheets', {
    status: sheets.status,
    total: sheetRows.length,
    closed: closedSheets.length,
    open: openSheets.length,
    closedSample: closedSheets.slice(0, 3).map((s) => ({
      id: s.id,
      status: s.status,
      name: s.name,
      start: s.start_date || s.startDate,
      companyId: s.company_id || s.companyId,
    })),
  });

  const comps = await call(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } });
  const compRows = asList(comps.data);
  async function ensureComponent(code, name, nature = 'income') {
    const existing = compRows.find((c) => String(c.code || '').toLowerCase() === code.toLowerCase());
    if (existing) return existing;
    const typeKey =
      nature === 'deduction'
        ? compRows.find((c) => /thue|deduct/i.test(String(c.component_type || '')))?.component_type || 'thue'
        : compRows.find((c) => /luong/i.test(String(c.component_type || '')))?.component_type || 'luong';
    const created = await call(token, 'POST', '/payroll/salary-components', {
      body: {
        company_id: COMPANY,
        code,
        name,
        component_type: typeKey,
        nature: nature === 'deduction' ? 'deduction' : 'income',
        value_type: 'currency',
        is_active: true,
      },
    });
    pushStep(`ensure_component_${code}`, {
      status: created.status,
      code: created.code,
      id: created.data?.id ?? null,
      note: created.message,
    });
    if (created.data?.id) {
      const row = { id: created.data.id, code: created.data.code || code, name: created.data.name || name };
      compRows.push(row);
      return row;
    }
    return null;
  }
  const advanceComp =
    compRows.find((c) => /^tam_ung$/i.test(String(c.code || ''))) ||
    (await ensureComponent('tam_ung', 'Tạm ứng', 'deduction'));
  pushStep('advance_component', {
    ok: Boolean(advanceComp?.id || advanceComp?.code),
    id: advanceComp?.id,
    code: advanceComp?.code,
  });

  const empsMain = await call(token, 'GET', '/employees', { query: { company_id: COMPANY, page_size: 50 } });
  const empsHold = await call(token, 'GET', '/employees', { query: { company_id: 'holding', page_size: 50 } });
  const empRows = [...asList(empsMain.data), ...asList(empsHold.data)];
  const preferred =
    empRows.find((e) => String(e.employee_code || e.code || '') === 'HLD-0001') ||
    empRows.find((e) => String(e.employee_code || e.code || '') === 'NV002') ||
    empRows[0];
  pushStep('list_employees', {
    status: empsMain.status,
    holdStatus: empsHold.status,
    count: empRows.length,
    preferred: preferred
      ? {
          id: preferred.id,
          code: preferred.employee_code || preferred.code,
          name: preferred.full_name || preferred.fullName,
          companyId: preferred.company_id || preferred.companyId,
        }
      : null,
  });

  // ========== AC-AMIS-ATT-XFER-01 ==========
  // Prefer closed sheet that has (or can create) a draft/open overlapping period.
  // Do NOT fuzzy-match prior calendar month (QA-02 R1 false FAIL: Jul sheet → Aug period).
  const plistAll = await call(token, 'GET', '/payroll/periods', { query: { company_id: COMPANY } });
  const allPeriods = asList(plistAll.data);
  pushStep('list_periods_inventory', {
    status: plistAll.status,
    count: allPeriods.length,
    draftOpen: allPeriods.filter((p) => ['draft', 'open'].includes(String(p.status || '').toLowerCase())).length,
  });

  function findDraftOpenOverlapping(bounds) {
    return allPeriods.find((p) => {
      const st = String(p.status || '').toLowerCase();
      if (!['draft', 'open'].includes(st)) return false;
      const ps = periodDay(p.start_date || p.startDate);
      const pe = periodDay(p.end_date || p.endDate);
      return overlaps(ps, pe, bounds.start, bounds.end);
    });
  }

  // Order: Sep closed (known draft) → other closed with draft → Jul last (often processed-only)
  const closedOrdered = [...closedSheets].sort((a, b) => {
    const ba = sheetMonth(a);
    const bb = sheetMonth(b);
    const score = (bounds, sheet) => {
      if (!bounds) return 0;
      const d = findDraftOpenOverlapping(bounds);
      if (d) return 100;
      if (bounds.y === 2026 && bounds.m === 9) return 90;
      if (bounds.y === 2026 && bounds.m === 7) return 10;
      return 50;
    };
    return score(bb, b) - score(ba, a);
  });

  let closed = null;
  let periodId = null;
  let bounds = null;
  for (const candidate of closedOrdered) {
    const b = sheetMonth(candidate);
    if (!b) continue;
    const existing = findDraftOpenOverlapping(b);
    if (existing) {
      closed = candidate;
      bounds = b;
      periodId = existing.id;
      pushStep('select_closed_sheet_with_draft', {
        ok: true,
        sheetId: candidate.id,
        sheetName: candidate.name,
        periodId,
        periodLabel: existing.period_label || existing.periodLabel,
        bounds: b,
      });
      break;
    }
  }
  if (!closed && closedOrdered[0]) {
    closed = closedOrdered[0];
    bounds = sheetMonth(closed) || monthBounds(2026, 9);
  }

  let bindId = null;
  let bindDisplayOk = false;
  let listGetOk = false;
  let codeColBug = false;

  if (!closed) {
    report.ac['AC-AMIS-ATT-XFER-01'] = passFail(false, 'No closed attendance_sheets in scope — cannot bind (U65 no seed)');
    pushStep('ac_xfer_blocked_no_closed_sheet', { ok: false });
  } else {
    if (!periodId) {
      const periodBody = {
        company_id: COMPANY,
        period_label: `QA InputPack2 ${STAMP}`,
        start_date: bounds.start,
        end_date: bounds.end,
      };
      let createPeriod = await call(token, 'POST', '/payroll/periods', { body: periodBody });
      pushStep('create_draft_period', createPeriod, { bounds, sheetId: closed.id });

      if (createPeriod.status === 409 || createPeriod.code === 'HRM-PAY-002') {
        const match = findDraftOpenOverlapping(bounds);
        periodId = match?.id ?? null;
        pushStep('reuse_draft_period_on_overlap', {
          status: plistAll.status,
          periodId,
          matchStatus: match?.status,
          matchLabel: match?.period_label || match?.periodLabel,
          matchVnStart: match ? periodDay(match.start_date || match.startDate) : null,
          matchVnEnd: match ? periodDay(match.end_date || match.endDate) : null,
          note: createPeriod.message,
          strictOverlapOnly: true,
        });
      } else {
        periodId = createPeriod.data?.id ?? null;
      }
    }
    report.ids.periodId = periodId;
    report.ids.closedSheetId = closed.id;
    report.ids.sheetName = closed.name;
    report.ids.sheetBounds = bounds;

    if (!periodId) {
      report.ac['AC-AMIS-ATT-XFER-01'] = passFail(false, 'No draft/open period overlapping closed sheet window (strict)');
    } else {
      if (openSheets[0]) {
        const badBind = await call(token, 'POST', `/payroll/periods/${periodId}/timesheet-binds`, {
          body: {
            timesheetHeaderId: openSheets[0].id,
            transferKind: 'closed_transfer',
            note: `QA open-sheet neg ${STAMP}`,
          },
        });
        pushStep('bind_open_sheet_neg', badBind);
        report.ids.openSheetNeg = {
          status: badBind.status,
          code: badBind.code,
          ok: badBind.status === 412 || /ATT-412|HRM-PAY-ATT-412/i.test(`${badBind.code} ${badBind.message}`),
        };
      }

      const bind = await call(token, 'POST', `/payroll/periods/${periodId}/timesheet-binds`, {
        body: {
          timesheetHeaderId: closed.id,
          transferKind: 'closed_transfer',
          note: `QA closed transfer ${STAMP}`,
        },
      });
      bindId = bind.data?.id ?? null;
      report.ids.bindId = bindId;
      codeColBug = /column s\.code does not exist/i.test(`${bind.message} ${bind.dataSummary}`);
      pushStep('post_timesheet_bind_closed', bind, {
        displayLabel: bind.data?.timesheetDisplayLabel ?? null,
        timesheetStatus: bind.data?.timesheetStatus ?? null,
        sysBugCodeCol: codeColBug,
      });

      const bindDup = await call(token, 'POST', `/payroll/periods/${periodId}/timesheet-binds`, {
        body: { timesheetHeaderId: closed.id, transferKind: 'closed_transfer' },
      });
      pushStep('post_timesheet_bind_dup', bindDup);
      const bindInserted =
        (bind.status >= 200 && bind.status < 300 && Boolean(bindId)) ||
        bindDup.status === 409 ||
        /HRM-PAY-INP-409-DUP/i.test(`${bindDup.code}`);
      report.ids.bindInserted = bindInserted;
      if (!bindId && bindDup.data?.id) bindId = bindDup.data.id;
      // On DUP, list will still return existing bind
      if (!bindId && bindInserted) {
        /* resolve from list below */
      }

      const listBinds = await call(token, 'GET', `/payroll/periods/${periodId}/timesheet-binds`, {
        query: { company_id: COMPANY },
      });
      const bindRows = asList(listBinds.data);
      const row = (bindId && bindRows.find((b) => b.id === bindId)) || bindRows[0];
      if (!bindId && row?.id) {
        bindId = row.id;
        report.ids.bindId = bindId;
      }
      codeColBug =
        codeColBug || /column s\.code does not exist/i.test(`${listBinds.message} ${listBinds.dataSummary}`);
      bindDisplayOk = Boolean(
        row &&
          listBinds.status === 200 &&
          row.timesheetDisplayLabel &&
          String(row.timesheetStatus || '').toLowerCase() === 'closed',
      );
      // Prefer name-based label (not raw UUID)
      if (bindDisplayOk && row.timesheetDisplayLabel === row.timesheetHeaderId) {
        bindDisplayOk = false;
      }
      pushStep('list_timesheet_binds', listBinds, {
        count: bindRows.length,
        row: row
          ? {
              id: row.id,
              timesheetDisplayLabel: row.timesheetDisplayLabel,
              timesheetStatus: row.timesheetStatus,
              timesheetHeaderId: row.timesheetHeaderId,
            }
          : null,
        bindDisplayOk,
        codeColBug,
      });

      let getBind = null;
      if (bindId) {
        getBind = await call(token, 'GET', `/payroll/periods/${periodId}/timesheet-binds/${bindId}`, {
          query: { company_id: COMPANY },
        });
        codeColBug =
          codeColBug || /column s\.code does not exist/i.test(`${getBind.message} ${getBind.dataSummary}`);
        const getOk =
          getBind.status === 200 &&
          Boolean(getBind.data?.timesheetDisplayLabel) &&
          String(getBind.data?.timesheetStatus || '').toLowerCase() === 'closed';
        pushStep('get_timesheet_bind', getBind, { getOk, codeColBug });
        listGetOk = listBinds.status === 200 && getOk && !codeColBug;
      } else {
        listGetOk = listBinds.status === 200 && bindDisplayOk && !codeColBug;
      }

      const xferOk = bindInserted && listGetOk && bindDisplayOk && !codeColBug;
      report.ac['AC-AMIS-ATT-XFER-01'] = passFail(
        xferOk,
        `bindInserted=${bindInserted} list=${listBinds.status} get=${getBind?.status ?? 'n/a'} display=${bindDisplayOk} label=${row?.timesheetDisplayLabel || bind.data?.timesheetDisplayLabel} status=${row?.timesheetStatus || bind.data?.timesheetStatus} codeColBug=${codeColBug} openNeg=${report.ids.openSheetNeg?.code || 'n/a'}`,
      );
      if (codeColBug) {
        report.residual.push({
          id: 'R-PAY-INP-BIND-SHEET-CODE-COL',
          note: 'Still selecting attendance_sheets.code → 500 on LIST/GET',
          owner: 'dev-be',
        });
      }
    }
  }

  // ========== AC2 eligibility + enroll HLD-0001 ==========
  let eligOk = false;
  let enrollOk = false;
  if (!periodId) {
    report.ac['AC-PAY-ELIG-ENROLL'] = passFail(false, 'no periodId after bind');
  } else {
    const elig = await call(token, 'GET', `/payroll/periods/${periodId}/eligibility`, {
      query: { company_id: COMPANY },
    });
    const eligItems = asList(elig.data?.items ?? elig.data);
    const eligibleCount =
      elig.data?.eligible_count ??
      elig.data?.eligibleCount ??
      eligItems.filter((i) => i.eligible === true).length;
    const hldRow = eligItems.find((i) => {
      const code = String(i.employee_code || i.employeeCode || i.code || '');
      const id = String(i.employee_id || i.employeeId || i.id || '');
      return code === 'HLD-0001' || id === preferred?.id;
    });
    const noClosedOnly =
      eligItems.length > 0 &&
      eligItems.every((i) => {
        const reasons = i.ineligible_reasons || i.ineligibleReasons || i.reasons || [];
        return i.eligible === false && reasons.includes('NO_CLOSED_SHEET');
      });
    // After successful bind: items not empty AND not still all NO_CLOSED_SHEET
    eligOk = elig.status === 200 && eligItems.length > 0 && !noClosedOnly && eligibleCount > 0;
    pushStep('get_eligibility_after_bind', elig, {
      itemCount: eligItems.length,
      eligibleCount,
      noClosedOnly,
      hld: hldRow
        ? {
            id: hldRow.employee_id || hldRow.employeeId,
            code: hldRow.employee_code || hldRow.employeeCode,
            eligible: hldRow.eligible,
            reasons: hldRow.ineligible_reasons || hldRow.ineligibleReasons || hldRow.reasons,
          }
        : null,
      sample: eligItems.slice(0, 3).map((i) => ({
        id: i.employee_id || i.employeeId || i.id,
        code: i.employee_code || i.employeeCode,
        eligible: i.eligible,
        reasons: i.ineligible_reasons || i.ineligibleReasons || i.reasons,
      })),
    });

    const empId = preferred?.id;
    let enroll = null;
    if (empId) {
      enroll = await call(token, 'POST', `/payroll/periods/${periodId}/enroll`, {
        body: { mode: 'explicit', employee_ids: [empId] },
      });
      pushStep('enroll_explicit_hld', enroll, {
        employeeId: empId,
        employeeCode: preferred.employee_code || preferred.code,
      });
      const enrollSuccess = enroll.status >= 200 && enroll.status < 300;
      const honestIneligible =
        (enroll.status === 400 || enroll.status === 409 || enroll.status === 412) &&
        Boolean(enroll.code) &&
        !/ENROLL-EMPTY/i.test(`${enroll.code}`) &&
        Boolean(hldRow) &&
        hldRow.eligible === false &&
        Array.isArray(hldRow.reasons || hldRow.ineligible_reasons || hldRow.ineligibleReasons) &&
        (hldRow.reasons || hldRow.ineligible_reasons || hldRow.ineligibleReasons).length > 0;
      // EXIT: enroll succeeds OR honest per-employee ineligible (not silent ENROLL-EMPTY after bind)
      enrollOk = enrollSuccess || honestIneligible;
      if (/ENROLL-EMPTY/i.test(`${enroll.code}`) && eligibleCount === 0) {
        enrollOk = false;
      }
      if (eligItems.length === 0) {
        enrollOk = false;
      }
    } else {
      pushStep('enroll_blocked_no_emp', { ok: false });
      enrollOk = false;
    }

    const ac2 = eligOk && enrollOk;
    report.ac['AC-PAY-ELIG-ENROLL'] = passFail(
      ac2,
      `elig=${elig.status} items=${eligItems.length} eligibleCount=${eligibleCount} noClosedOnly=${noClosedOnly} hldEligible=${hldRow?.eligible} enroll=${enroll?.status}/${enroll?.code} enrollOk=${enrollOk}`,
    );
    if (!eligOk || !enrollOk) {
      report.residual.push({
        id: 'R-PAY-SRC-03-PROCESS',
        note: `eligOk=${eligOk} enrollOk=${enrollOk} items=${eligItems.length} eligibleCount=${eligibleCount} enroll=${enroll?.status}/${enroll?.code}`,
        owner: 'dev-be',
      });
    }
  }

  // ========== VAL-INP-ADV-01 ==========
  let advOk = false;
  if (!periodId || !preferred) {
    report.ac['VAL-INP-ADV-01'] = passFail(false, `missing periodId=${periodId} emp=${preferred?.id}`);
  } else {
    // Probe unauth POST employees already done; now product path
    const createdAdv = await call(token, 'POST', '/payroll/advance-requests', {
      body: {
        company_id: COMPANY,
        name: `QA Adv Bridge ${STAMP}`,
        salary_period: `${STAMP}`,
      },
    });
    pushStep('create_advance_header', createdAdv);
    const advId = createdAdv.data?.id ?? null;
    report.ids.advanceRequestId = advId;

    if (!advId) {
      report.ac['VAL-INP-ADV-01'] = passFail(false, `create advance header failed ${createdAdv.status}/${createdAdv.code}`);
    } else {
      const empCode = String(preferred.employee_code || preferred.code || 'HLD-0001');
      const empName = String(preferred.full_name || preferred.fullName || 'Nguyễn Văn An');
      const addEmp = await call(token, 'POST', `/payroll/advance-requests/${advId}/employees`, {
        body: {
          employee_id: preferred.id,
          employee_code: empCode,
          employee_name: empName,
          advance_amount: 1_500_000,
          department: null,
          position: null,
          note: `QA VAL-INP-ADV-01 ${STAMP}`,
        },
      });
      pushStep('post_advance_employee', addEmp, {
        empCode,
        empName,
        routeAbsent: addEmp.status === 404,
      });
      report.ids.advanceEmployeeId = addEmp.data?.id ?? null;

      if (!(addEmp.status >= 200 && addEmp.status < 300)) {
        report.ac['VAL-INP-ADV-01'] = passFail(
          false,
          `POST employees failed ${addEmp.status}/${addEmp.code}: ${addEmp.message}`,
        );
        if (addEmp.status === 404) {
          report.residual.push({
            id: 'R-PAY-ADV-EMP-API-ABSENT',
            note: 'POST advance-requests/:id/employees still 404 — stale dist?',
            owner: 'dev-be',
          });
        }
      } else {
        const approve = await call(token, 'POST', `/payroll/advance-requests/${advId}/approve`, {
          body: { reviewer_name: 'QA CEO' },
        });
        pushStep('approve_advance', approve);

        const markNoPeriod = await call(token, 'POST', `/payroll/advance-requests/${advId}/mark-paid`, {
          body: { reviewer_name: 'QA CEO' },
        });
        pushStep('mark_paid_missing_period_id', markNoPeriod);
        const requiresPeriod =
          markNoPeriod.status === 400 ||
          /payrollPeriodId|HRM-VAL/i.test(`${markNoPeriod.code} ${markNoPeriod.message}`);

        const markRes = await call(token, 'POST', `/payroll/advance-requests/${advId}/mark-paid`, {
          body: {
            reviewer_name: 'QA CEO',
            payrollPeriodId: periodId,
            componentCode: advanceComp?.code || 'tam_ung',
          },
        });
        pushStep('mark_paid_with_payrollPeriodId', markRes);
        const bridgedIds = markRes.data?.bridgedInputLineIds || [];

        const advLines = await call(token, 'GET', `/payroll/periods/${periodId}/input-lines`, {
          query: { company_id: COMPANY, source_kind: 'advance' },
        });
        const advLineRows = asList(advLines.data);
        const matched = advLineRows.filter(
          (l) =>
            l.sourceKind === 'advance' &&
            String(l.sourceRef || '').startsWith('advance_request_employee:'),
        );
        pushStep('list_input_lines_advance', advLines, {
          count: advLineRows.length,
          matched: matched.length,
          bridgedIds,
          sample: matched.slice(0, 2),
        });

        advOk =
          requiresPeriod &&
          markRes.status >= 200 &&
          markRes.status < 300 &&
          (bridgedIds.length > 0 || matched.length > 0) &&
          matched.some((l) => l.sourceKind === 'advance');

        report.ac['VAL-INP-ADV-01'] = passFail(
          advOk,
          `addEmp=${addEmp.status}/${addEmp.code} approve=${approve.status}/${approve.code} requiresPeriod=${requiresPeriod} mark=${markRes.status}/${markRes.code} bridged=${bridgedIds.length} advanceLines=${matched.length}`,
        );
        if (!advOk && bridgedIds.length === 0 && matched.length === 0) {
          report.residual.push({
            id: 'R-VAL-INP-ADV-01-NO-BRIDGE',
            note: `mark-paid accepted=${markRes.status} but no source_kind=advance input line`,
            owner: 'dev-be',
          });
        }
      }
    }
  }

  report.ac.honesty = passFail(
    report.honesty.payroll_e2e_ready === false && report.honesty.seed_used === false,
    'payroll_e2e_ready=false · no seed',
  );

  const acIds = ['AC-AMIS-ATT-XFER-01', 'AC-PAY-ELIG-ENROLL', 'VAL-INP-ADV-01'];
  const allPass = acIds.every((id) => report.ac[id]?.verdict === 'PASS');
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    ac: Object.fromEntries(acIds.map((id) => [id, report.ac[id]?.verdict])),
  };
  report.endedAt = ts();
  save();

  const md = `# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02\` |
| **prior** | \`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02\` READY_FOR_QA |
| **parent** | \`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01\` FAIL \`PAYINPQA-MSIRS9L7\` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution — **L1 API smoke** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **stamp** | \`${STAMP}\` |
| **ack_status** | **\`${report.overall.ack_status}\`** |
| **verdict** | **${report.overall.verdict}** |
| **artifact_json** | [\`_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json\`](./_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json) |
| **harness** | \`scripts/qa/_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.mjs\` |
| **account** | \`${EMAIL}\` / \`Xevn@2026\` · \`company_id=${COMPANY}\` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **\`payroll_e2e_ready\`** | **\`false\`** | L1 slice ≠ module UAT |
| **Seed** | **DENIED** | U65 zero-seed · no \`pnpm seed:*\` |
| **Browser Step4 UF / J-HRM-07** | **DENIED** | FE packs residual |
| **AMIS DONE / ready flip** | **DENIED** | |

---

## Environment

| Check | Result |
|-------|--------|
| L0 HRM health | **${health.status}** |
| Dist BE-02 markers | NULL timesheet_code=${hasNullCode} · POST employees=${hasAdvEmpPost} |
| Auth | Bearer · \`x-tenant-id=xevn\` · \`x-company-id=main\` · JWT sub=\`${auth.sub}\` |

### Fixture IDs

| Key | Value |
|-----|--------|
| periodId | \`${report.ids.periodId || '—'}\` |
| closedSheetId | \`${report.ids.closedSheetId || '—'}\` |
| sheetName | \`${report.ids.sheetName || '—'}\` |
| bindId | \`${report.ids.bindId || '—'}\` |
| advanceRequestId | \`${report.ids.advanceRequestId || '—'}\` |
| advanceEmployeeId | \`${report.ids.advanceEmployeeId || '—'}\` |
| preferredEmp | \`${preferred ? `${preferred.employee_code || preferred.code} / ${preferred.id}` : '—'}\` |

---

## AC matrix (L1)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC-AMIS-ATT-XFER-01** | closed bind → LIST/GET 200 display-ready (name label, status=closed) — no 500 s.code | ${report.ac['AC-AMIS-ATT-XFER-01']?.note || '—'} | **${report.ac['AC-AMIS-ATT-XFER-01']?.verdict || '—'}** |
| **AC-PAY-ELIG-ENROLL** | after bind: eligibility items[] not empty; enroll HLD-0001 succeeds OR honest ineligible | ${report.ac['AC-PAY-ELIG-ENROLL']?.note || '—'} | **${report.ac['AC-PAY-ELIG-ENROLL']?.verdict || '—'}** |
| **VAL-INP-ADV-01** | POST …/employees → approve → mark-paid+payrollPeriodId → source_kind=advance | ${report.ac['VAL-INP-ADV-01']?.note || '—'} | **${report.ac['VAL-INP-ADV-01']?.verdict || '—'}** |
| Honesty | no ready flip / no seed | locked | **${report.ac.honesty?.verdict || '—'}** |

---

## Defect triage

${
  report.residual.length
    ? report.residual.map((r) => `| **${r.id}** | ${r.note} | **${r.owner}** |`).join('\n')
    : '| — | No P0 residual opened this wave | — |'
}

| ID | Note | Owner |
|----|------|-------|
${
  report.residual.length
    ? report.residual.map((r) => `| **${r.id}** | ${r.note} | **${r.owner}** |`).join('\n')
    : '| — | closed prior R-PAY-INP-BIND-SHEET-CODE-COL / R-PAY-ADV-EMP-API-ABSENT if ACs PASS | — |'
}

---

## Residual / not promoted

- FE wire \`POST …/employees\` (remove throw) — **dev-fe** after L1 PASS  
- Browser Step4 UF packs — **dev-fe** + QA browser  
- Module UAT / \`payroll_e2e_ready\` — **DENIED**

### Explicit non-claims

- Did **not** claim AMIS parity DONE / payroll e2e ready / J-HRM-07 process UAT.
- Did **not** use seed or flip \`payroll_e2e_ready\`.
- Did **not** run browser UF (FE Step4 residual).

---

## completion_report

### Closed

1. L0 + live-dist BE-02 markers (NULL timesheet_code · POST advance employees).
2. L1 retest of three exit ACs with FINAL JSON.
3. Stamp \`${STAMP}\` · verdict **${report.overall.verdict}**.

### Residual

${report.residual.length ? report.residual.map((r) => `- ${r.id}: ${r.note}`).join('\n') : '- None P0 for this slice (FE wire / browser UF remain out-of-scope).'}

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **${allPass ? 'pm' : 'dev-be'}** |
| **evidence_path** | \`docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md\` |
| **ack_status** | **\`${report.overall.ack_status}\`** |
`;

  writeFileSync(OUT_MD, md);
  console.log(JSON.stringify({ stamp: STAMP, overall: report.overall, ac: report.ac, ids: report.ids, residual: report.residual }, null, 2));
  process.exit(allPass ? 0 : 2);
} catch (err) {
  report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: String(err?.stack || err) };
  report.endedAt = ts();
  save();
  console.error(err);
  process.exit(2);
}
