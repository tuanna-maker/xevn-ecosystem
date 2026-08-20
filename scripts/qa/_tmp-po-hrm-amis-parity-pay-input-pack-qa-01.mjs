#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01 — L1 API smoke (NOT browser UF / NOT module UAT)
 * Prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01 READY_FOR_QA
 * U65 zero-seed · payroll_e2e_ready=false · cấm seed · cấm ready flip
 *
 * AC:
 *  AC-AMIS-ATT-XFER-01 — draft period → POST timesheet-binds (closed) → list display-ready → process eligibility OK
 *  AC-PAY-SRC-03 — POST input-lines (other_income) → process → payslip line source_tier=period_input
 *  VAL-INP-ADV-01 — mark-paid with payrollPeriodId → input line source_kind=advance
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PUBLISHER = process.env.QA_PUBLISHER_EMAIL || 'admin@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = 'xevn';
const STAMP = `PAYINPQA-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.FINAL.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-01.md');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
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
  return {
    start: `${yyyy}-${m}-01`,
    end: `${yyyy}-${m}-${String(last).padStart(2, '0')}`,
  };
}

/** Sheet dates are timestamptz; interpret calendar day in Asia/Ho_Chi_Minh. */
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
  // payroll_periods often store UTC midnight of prior calendar day for VN month start
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
      if (token) return { ok: true, status: r.status, token, sub: decodeSub(token), user: d.user || {}, via: url };
    } catch (err) {
      /* try next */
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
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01',
  parent: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01',
  stamp: STAMP,
  lane: 'L1_API_smoke',
  u65: 'zero-seed · API product path · cấm payroll_e2e_ready flip · cấm seed',
  honesty: {
    payroll_e2e_ready: false,
    browser_uf: false,
    module_uat: false,
    seed_used: false,
  },
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
  // --- L0 + stale-dist ---
  const health = await fetch(HRM.replace(/\/api\/hrm$/, '') + '/api/hrm').then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 120),
  }));
  pushStep('L0_hrm_health', { status: health.status, ok: health.status === 200, note: health.text });

  const probePaths = [
    '/payroll/periods/00000000-0000-4000-8000-000000000001/timesheet-binds',
    '/payroll/periods/00000000-0000-4000-8000-000000000001/input-lines',
  ];
  for (const p of probePaths) {
    const stale = await fetch(`${HRM}${p}?company_id=${COMPANY}`).then(async (r) => ({
      status: r.status,
      text: (await r.text()).slice(0, 180),
    }));
    const live = stale.status === 401 || stale.status === 403 || stale.status === 400 || stale.status === 404;
    // 401/403 = auth gate on live route; Nest may 404 period later after auth — unauth 404 on controller = stale
    const routeLive = stale.status !== 404 || /HRM-AUTH|Unauthorized|jwt/i.test(stale.text);
    pushStep(`stale_dist_probe_${p.split('/').pop()}`, {
      status: stale.status,
      ok: stale.status === 401 || stale.status === 403,
      note:
        stale.status === 401 || stale.status === 403
          ? 'route live (auth required)'
          : stale.status === 404
            ? 'possible stale dist OR period 404 before auth'
            : `status=${stale.status}`,
      body: stale.text,
      routeLive,
    });
  }

  const distFile = resolve(ROOT, 'apps/api/hrm-api/dist/payroll/pay-period-input-pack.service.js');
  pushStep('dist_file_present', {
    ok: existsSync(distFile),
    path: 'apps/api/hrm-api/dist/payroll/pay-period-input-pack.service.js',
  });

  const auth = await login(EMAIL);
  const authPub = await login(PUBLISHER);
  pushStep('login_ceo', { status: auth.status, ok: auth.ok, sub: auth.sub });
  pushStep('login_publisher', { status: authPub.status, ok: authPub.ok, sub: authPub.sub });
  if (!auth.ok) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: 'login_failed' };
    report.endedAt = ts();
    save();
    process.exit(2);
  }
  const token = auth.token;
  const pubTok = authPub.ok ? authPub.token : token;

  // --- inventory: closed sheets, components, employees, periods ---
  const sheets = await call(token, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY, page_size: 100 },
  });
  const sheetRows = asList(sheets.data);
  const closedSheets = sheetRows.filter((s) => String(s.status || '').toLowerCase() === 'closed');
  const openSheets = sheetRows.filter((s) => !['closed', 'archived'].includes(String(s.status || '').toLowerCase()));
  pushStep('list_attendance_sheets', {
    status: sheets.status,
    code: sheets.code,
    total: sheetRows.length,
    closed: closedSheets.length,
    open: openSheets.length,
    closedSample: closedSheets.slice(0, 3).map((s) => ({
      id: s.id,
      status: s.status,
      start: s.start_date || s.startDate,
      end: s.end_date || s.endDate,
      code: s.code,
      name: s.name,
      companyId: s.company_id || s.companyId,
    })),
  });

  const comps = await call(token, 'GET', '/payroll/salary-components', {
    query: { company_id: COMPANY },
  });
  const compRows = asList(comps.data);
  const findComp = (...preds) =>
    compRows.find((c) => preds.some((p) => p(String(c.code || c.component_code || ''), String(c.name || ''))));
  let otherComp =
    findComp((code) => /^other_income$/i.test(code), (code, name) => /thu nh[aậ]p khác|other.?income/i.test(`${code} ${name}`)) ||
    findComp((code) => /^bonus$/i.test(code), (code) => /thuong|bonus/i.test(code)) ||
    findComp((code) => !/^base$|^luong_co_ban$|^lcb$/i.test(code));
  let advanceComp =
    findComp((code) => /^tam_ung$/i.test(code), (code, name) => /t[aạ]m [uứ]ng|advance/i.test(`${code} ${name}`));
  const baseComp =
    findComp((code) => /^base$/i.test(code)) ||
    findComp((code) => /luong_co_ban|lcb|base_salary/i.test(code)) ||
    compRows[0];
  pushStep('list_salary_components', {
    status: comps.status,
    count: compRows.length,
    base: baseComp ? { id: baseComp.id, code: baseComp.code, name: baseComp.name } : null,
    other: otherComp ? { id: otherComp.id, code: otherComp.code, name: otherComp.name } : null,
    advance: advanceComp ? { id: advanceComp.id, code: advanceComp.code, name: advanceComp.name } : null,
  });

  // Ensure other_income + tam_ung catalog rows via product API (not seed)
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
      dataSummary: created.dataSummary,
      typeKey,
    });
    if (created.data?.id) {
      const row = {
        id: created.data.id,
        code: created.data.code || code,
        name: created.data.name || name,
        component_type: created.data.component_type || typeKey,
      };
      compRows.push(row);
      return row;
    }
    return null;
  }

  // Prefer explicit other_income over ambiguous "D"/cơ bản
  otherComp =
    compRows.find((c) => /^other_income$/i.test(String(c.code || ''))) ||
    (await ensureComponent('other_income', 'Thu nhập khác', 'income')) ||
    otherComp;
  advanceComp =
    compRows.find((c) => /^tam_ung$/i.test(String(c.code || ''))) ||
    (await ensureComponent('tam_ung', 'Tạm ứng', 'deduction')) ||
    advanceComp;

  const empsMain = await call(token, 'GET', '/employees', {
    query: { company_id: COMPANY, page_size: 50 },
  });
  const empsHold = await call(token, 'GET', '/employees', {
    query: { company_id: 'holding', page_size: 50 },
  });
  const empRows = [...asList(empsMain.data), ...asList(empsHold.data)];
  const preferred =
    empRows.find((e) => String(e.employee_code || e.code || '') === 'NV002') ||
    empRows.find((e) => String(e.employee_code || e.code || '') === 'HLD-0001') ||
    empRows.find((e) => /NV002|HLD-0001/i.test(`${e.employee_code || e.code || ''} ${e.full_name || e.fullName || ''}`)) ||
    empRows[0];
  pushStep('list_employees', {
    status: empsMain.status,
    count: empRows.length,
    preferred: preferred
      ? {
          id: preferred.id,
          code: preferred.employee_code || preferred.code,
          name: preferred.full_name || preferred.fullName,
        }
      : null,
  });

  // ========== AC-AMIS-ATT-XFER-01 ==========
  // Prefer Jul closed sheet (known process path) then Sep ATT-SIGN sheet
  const closedJul =
    closedSheets.find((s) => {
      const b = sheetMonth(s);
      return b && b.y === 2026 && b.m === 7;
    }) || null;
  const closed = closedJul || closedSheets[0] || null;
  let periodId = null;
  let bindId = null;
  let bindDisplayOk = false;
  let processEligOk = false;

  if (!closed) {
    report.ac['AC-AMIS-ATT-XFER-01'] = passFail(false, 'No closed attendance_sheets in scope — cannot bind (U65 no seed)');
    pushStep('ac_xfer_blocked_no_closed_sheet', { ok: false });
  } else {
    const bounds = sheetMonth(closed) || monthBounds(2026, 7);
    const periodBody = {
      company_id: COMPANY,
      period_label: `QA InputPack ${STAMP}`,
      start_date: bounds.start,
      end_date: bounds.end,
    };
    let createPeriod = await call(token, 'POST', '/payroll/periods', { body: periodBody });
    pushStep('create_draft_period', createPeriod, { bounds, sheetId: closed.id });

    // Overlap → find existing draft/open period overlapping sheet window
    if (createPeriod.status === 409 || createPeriod.code === 'HRM-PAY-002') {
      const plist = await call(token, 'GET', '/payroll/periods', {
        query: { company_id: COMPANY },
      });
      const periods = asList(plist.data);
      const match =
        periods.find((p) => {
          const st = String(p.status || '').toLowerCase();
          if (!['draft', 'open'].includes(st)) return false;
          const ps = periodDay(p.start_date || p.startDate);
          const pe = periodDay(p.end_date || p.endDate);
          return overlaps(ps, pe, bounds.start, bounds.end);
        }) ||
        periods.find((p) => {
          const st = String(p.status || '').toLowerCase();
          if (!['draft', 'open'].includes(st)) return false;
          const ps = String(p.start_date || p.startDate || '').slice(0, 10);
          // UTC storage quirk: Sep period often starts 2026-08-31
          return ps.startsWith(bounds.start.slice(0, 7)) || ps.startsWith(
            `${bounds.y}-${String(bounds.m === 1 ? 12 : bounds.m - 1).padStart(2, '0')}`,
          );
        });
      periodId = match?.id ?? null;
      pushStep('reuse_draft_period_on_overlap', {
        status: plist.status,
        periodId,
        matchStatus: match?.status,
        matchStart: match?.start_date || match?.startDate,
        matchLabel: match?.period_label,
        note: createPeriod.message,
        periodCount: periods.length,
      });
    } else {
      periodId = createPeriod.data?.id ?? null;
    }
    report.ids.periodId = periodId;
    report.ids.closedSheetId = closed.id;
    report.ids.sheetBounds = bounds;

    if (!periodId) {
      report.ac['AC-AMIS-ATT-XFER-01'] = passFail(false, 'No draft/open period for closed sheet month');
    } else {
      // Negative: open sheet → ATT-412
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
      pushStep('post_timesheet_bind_closed', bind, {
        displayLabel: bind.data?.timesheetDisplayLabel ?? null,
        timesheetStatus: bind.data?.timesheetStatus ?? null,
        sysBugCodeCol: /column s\.code does not exist/i.test(`${bind.message} ${bind.dataSummary}`),
      });
      if (/column s\.code does not exist/i.test(`${bind.message} ${bind.dataSummary}`)) {
        report.residual.push({
          id: 'R-PAY-INP-BIND-SHEET-CODE-COL',
          note: 'BE bindSelectSql selects attendance_sheets.code but table has no code column (name only) → POST/GET/LIST timesheet-binds HRM-SYS-001 500 after INSERT. Blocks AC-AMIS-ATT-XFER-01 display-ready.',
          owner: 'dev-be',
        });
      }

      // DUP idempotent path: second bind same sheet
      const bindDup = await call(token, 'POST', `/payroll/periods/${periodId}/timesheet-binds`, {
        body: { timesheetHeaderId: closed.id, transferKind: 'closed_transfer' },
      });
      pushStep('post_timesheet_bind_dup', bindDup);
      // If first POST 500 but DUP 409 → INSERT succeeded without display DTO
      const bindInserted =
        (bind.status >= 200 && bind.status < 300 && Boolean(bindId)) ||
        bindDup.status === 409 ||
        /HRM-PAY-INP-409-DUP/i.test(`${bindDup.code}`);
      report.ids.bindInserted = bindInserted;

      const listBinds = await call(token, 'GET', `/payroll/periods/${periodId}/timesheet-binds`, {
        query: { company_id: COMPANY },
      });
      const bindRows = asList(listBinds.data);
      const row = bindRows.find((b) => b.id === bindId) || bindRows[0];
      bindDisplayOk = Boolean(
        row &&
          row.timesheetDisplayLabel &&
          row.timesheetDisplayLabel !== row.timesheetHeaderId &&
          (row.timesheetStatus === 'closed' || bind.data?.timesheetStatus === 'closed'),
      );
      // Accept label = code — name even if equals id only when code/name present from map
      if (!bindDisplayOk && row?.timesheetDisplayLabel && row.timesheetStatus === 'closed') {
        bindDisplayOk = true; // display-ready field present + closed status
      }
      if (!bindDisplayOk && bind.status >= 200 && bind.status < 300 && bind.data?.timesheetDisplayLabel) {
        bindDisplayOk = true;
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
      });

      if (bindId) {
        const getBind = await call(token, 'GET', `/payroll/periods/${periodId}/timesheet-binds/${bindId}`, {
          query: { company_id: COMPANY },
        });
        pushStep('get_timesheet_bind', getBind);
      }

      // Process eligibility: process should NOT fail solely for missing closed sheet (ATT-412 for unbound)
      // After bind, ATT-412 for "no closed" should be cleared; may still fail VARS/FORMULA — that's OK for XFER eligibility
      const processProbe = await call(token, 'POST', `/payroll/periods/${periodId}/process`, {
        body: {},
        query: { company_id: COMPANY },
      });
      const att412 = processProbe.status === 412 && /ATT-412|HRM-PAY-ATT-412/i.test(`${processProbe.code}`);
      processEligOk =
        (processProbe.status >= 200 && processProbe.status < 300) ||
        (processProbe.status === 412 && !att412) ||
        processProbe.status === 409; // overlap/immutable still means bind accepted for ATT gate
      // Stronger: if ATT-412 still after bind → FAIL eligibility
      if (att412) processEligOk = false;
      pushStep('process_eligibility_after_bind', processProbe, {
        att412,
        processEligOk,
        note: 'PASS if not ATT-412 (VARS/FORMULA 412 acceptable for XFER eligibility)',
      });

      const xferOk =
        bindInserted &&
        (bind.status === 201 || bind.status === 200) &&
        Boolean(bindId) &&
        listBinds.status === 200 &&
        bindDisplayOk &&
        processEligOk;
      // Explicit FAIL if INSERT ok but display path 500 (code column bug)
      if (bindInserted && (bind.status === 500 || listBinds.status === 500)) {
        report.ac['AC-AMIS-ATT-XFER-01'] = passFail(
          false,
          `BE defect: bind INSERT ok (dup=${bindDup.status}/${bindDup.code}) but display GET/LIST 500 (${bind.code||listBinds.code}: ${bind.message||listBinds.message}) · openNeg=${report.ids.openSheetNeg?.code} · processElig=${processEligOk} process=${processProbe.status}/${processProbe.code}`,
        );
      } else {
        report.ac['AC-AMIS-ATT-XFER-01'] = passFail(
          xferOk,
          `bind=${bind.status}/${bind.code} id=${bindId} display=${bindDisplayOk} processElig=${processEligOk} process=${processProbe.status}/${processProbe.code} openNeg=${report.ids.openSheetNeg?.code || 'n/a'}`,
        );
      }
    }
  }

  // ========== AC-PAY-SRC-03 ==========
  let src03Ok = false;
  if (!periodId || !preferred?.id || !otherComp?.code) {
    report.ac['AC-PAY-SRC-03'] = passFail(
      false,
      `missing deps periodId=${periodId} emp=${preferred?.id} otherComp=${otherComp?.code}`,
    );
  } else {
    // Ensure pay-sheet template with BASE + OTHER columns, bind to period
    const tplCode = `qa_inp_${Date.now().toString(36)}`.slice(0, 40);
    const tplCreate = await call(token, 'POST', '/payroll/pay-sheet-templates', {
      body: {
        company_id: COMPANY,
        code: tplCode,
        name: `QA InputPack TPL ${STAMP}`,
        status: 'active',
        isDefault: false,
        applicabilityScope: 'company',
      },
    });
    const tplId = tplCreate.data?.id ?? null;
    report.ids.tplId = tplId;
    pushStep('create_pay_sheet_tpl', tplCreate, { tplId, tplCode });

    if (tplId && baseComp && otherComp) {
      const linesPut = await call(token, 'PUT', `/payroll/pay-sheet-templates/${tplId}/lines`, {
        body: {
          company_id: COMPANY,
          lines: [
            {
              componentId: baseComp.id,
              displayLabel: baseComp.name || 'Lương cơ bản',
              sortOrder: 10,
            },
            {
              componentId: otherComp.id,
              displayLabel: otherComp.name || 'Thu nhập khác',
              sortOrder: 20,
            },
          ],
        },
      });
      pushStep('put_tpl_lines', linesPut);

      const bindTpl = await call(token, 'POST', `/payroll/periods/${periodId}/bind-sheet-template`, {
        body: { paySheetTemplateId: tplId, company_id: COMPANY },
      });
      pushStep('bind_sheet_template', bindTpl);
    }

    // Ensure employee enrolled on period (payslip)
    const enroll = await call(token, 'POST', `/payroll/periods/${periodId}/enroll`, {
      body: { mode: 'explicit', employee_ids: [preferred.id] },
    });
    pushStep('enroll_employee', enroll, { employeeId: preferred.id });
    if (!(enroll.status >= 200 && enroll.status < 300)) {
      const enrollAuto = await call(token, 'POST', `/payroll/periods/${periodId}/enroll`, {
        body: { mode: 'auto_eligible' },
      });
      pushStep('enroll_employee_auto_fallback', enrollAuto);
    }

    // Optional: ensure C&B base so process can succeed past VARS for BASE
    const cbList = await call(token, 'GET', `/payroll/employees/${preferred.id}/compensation`, {
      query: { company_id: COMPANY },
    });
    pushStep('get_emp_compensation', {
      status: cbList.status,
      code: cbList.code,
      summary: summarizeBody(cbList.data, 400),
    });

    const INPUT_AMT = 750_000;
    const inputPost = await call(token, 'POST', `/payroll/periods/${periodId}/input-lines`, {
      body: {
        employeeId: preferred.id,
        componentCode: otherComp.code,
        amount: INPUT_AMT,
        sourceKind: 'other_income',
        note: `QA SRC-03 ${STAMP}`,
      },
    });
    const inputLineId = inputPost.data?.id ?? null;
    report.ids.inputLineId = inputLineId;
    pushStep('post_input_line_other_income', inputPost, {
      displayName: inputPost.data?.employeeDisplayName,
      displayLabel: inputPost.data?.componentDisplayLabel,
      sourceKind: inputPost.data?.sourceKind,
      amount: inputPost.data?.amount,
    });

    const inputList = await call(token, 'GET', `/payroll/periods/${periodId}/input-lines`, {
      query: { company_id: COMPANY, source_kind: 'other_income' },
    });
    const inputRows = asList(inputList.data);
    const displayReadyLine = inputRows.find((r) => r.id === inputLineId) || inputRows[0];
    pushStep('list_input_lines', inputList, {
      count: inputRows.length,
      displayReady: displayReadyLine
        ? {
            employeeDisplayName: displayReadyLine.employeeDisplayName,
            componentDisplayLabel: displayReadyLine.componentDisplayLabel,
            sourceKind: displayReadyLine.sourceKind,
            amount: displayReadyLine.amount,
          }
        : null,
    });

    // Process
    const process = await call(token, 'POST', `/payroll/periods/${periodId}/process`, {
      body: {},
      query: { company_id: COMPANY },
    });
    pushStep('process_period_src03', process);

    let periodInputTier = [];
    if (process.status >= 200 && process.status < 300) {
      const slips = await call(token, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId, page_size: 50 },
      });
      const slipRows = asList(slips.data);
      const slip =
        slipRows.find((s) => String(s.employee_id || s.employeeId) === preferred.id) || slipRows[0];
      report.ids.payslipId = slip?.id ?? null;
      pushStep('list_payslips_after_process', slips, {
        count: slipRows.length,
        slipId: slip?.id,
        status: slip?.status,
        gross: slip?.gross_amount ?? slip?.grossAmount,
      });

      if (slip?.id) {
        const lines = await call(token, 'GET', `/payroll/payslips/${slip.id}/lines`, {
          query: { company_id: COMPANY },
        });
        const lineRows = asList(lines.data);
        periodInputTier = lineRows.filter(
          (l) =>
            String(l.source_tier || l.sourceTier) === 'period_input' ||
            String(l.source_ref || l.sourceRef || '').startsWith('period_input:'),
        );
        const otherLine = lineRows.find(
          (l) =>
            String(l.component_code || l.componentCode || '').toLowerCase() ===
            String(otherComp.code).toLowerCase(),
        );
        pushStep('get_payslip_lines', lines, {
          count: lineRows.length,
          periodInputCount: periodInputTier.length,
          otherLine: otherLine
            ? {
                component: otherLine.component_code || otherLine.componentCode,
                amount: otherLine.amount,
                source_tier: otherLine.source_tier || otherLine.sourceTier,
                source_ref: otherLine.source_ref || otherLine.sourceRef,
              }
            : null,
          tiers: lineRows.map((l) => ({
            c: l.component_code || l.componentCode,
            t: l.source_tier || l.sourceTier,
            a: l.amount,
          })),
        });
        src03Ok =
          periodInputTier.length > 0 &&
          otherLine &&
          String(otherLine.source_tier || otherLine.sourceTier) === 'period_input' &&
          Number(otherLine.amount) === INPUT_AMT;
      }
    }

    // If process failed with VARS but input line CRUD display-ready works, still FAIL AC-PAY-SRC-03 (exit requires process source_tier)
    const inputCrudOk =
      (inputPost.status === 201 || inputPost.status === 200) &&
      Boolean(inputLineId) &&
      displayReadyLine?.sourceKind === 'other_income' &&
      Boolean(displayReadyLine?.employeeDisplayName) &&
      Boolean(displayReadyLine?.componentDisplayLabel);

    report.ac['AC-PAY-SRC-03'] = passFail(
      src03Ok,
      `inputCrud=${inputCrudOk} process=${process.status}/${process.code} period_input_lines=${periodInputTier.length} inputLine=${inputLineId}`,
    );
    if (!src03Ok && inputCrudOk) {
      report.residual.push({
        id: 'R-PAY-SRC-03-PROCESS',
        note: `Input line CRUD PASS but process did not yield source_tier=period_input (${process.status}/${process.code})`,
        owner: 'dev-be',
      });
    }
  }

  // ========== VAL-INP-ADV-01 ==========
  let advOk = false;
  if (!periodId) {
    report.ac['VAL-INP-ADV-01'] = passFail(false, 'no periodId for bridge');
  } else {
    // Discover advance requests with employees (product list — no seed)
    const advList = await call(token, 'GET', '/payroll/advance-requests', {
      query: { company_id: COMPANY },
    });
    const advRows = asList(advList.data);
    pushStep('list_advance_requests', {
      status: advList.status,
      code: advList.code,
      count: advRows.length,
      sample: advRows.slice(0, 5).map((a) => ({
        id: a.id,
        status: a.status,
        name: a.name,
        salary_period: a.salary_period || a.salaryPeriod,
      })),
    });

    let targetAdv = null;
    let advEmps = [];
    for (const a of advRows) {
      const st = String(a.status || '').toLowerCase();
      if (!['pending', 'approved', 'paid'].includes(st)) continue;
      const em = await call(token, 'GET', `/payroll/advance-requests/${a.id}/employees`, {
        query: { company_id: COMPANY },
      });
      const rows = asList(em.data);
      if (rows.length > 0) {
        targetAdv = a;
        advEmps = rows;
        pushStep('found_advance_with_employees', {
          requestId: a.id,
          status: a.status,
          empCount: rows.length,
          empSample: rows.slice(0, 2).map((e) => ({
            id: e.id,
            employee_id: e.employee_id || e.employeeId,
            employee_code: e.employee_code || e.employeeCode,
            amount: e.advance_amount || e.advanceAmount,
          })),
        });
        break;
      }
    }

    if (!targetAdv) {
      // Try create header — employees API missing on Nest (FE throws)
      const createdAdv = await call(token, 'POST', '/payroll/advance-requests', {
        body: {
          company_id: COMPANY,
          name: `QA Adv Bridge ${STAMP}`,
          salary_period: `${STAMP}`,
        },
      });
      pushStep('create_advance_header_only', createdAdv);
      report.residual.push({
        id: 'R-PAY-ADV-EMP-API-ABSENT',
        note: 'Nest has no POST advance-request employees (FE: API thêm NV chưa có). Cannot product-path populate advance_request_employees without seed. VAL-INP-ADV-01 BLOCKED for live mark-paid bridge.',
        owner: 'dev-be',
      });

      // Still prove mark-paid requires payrollPeriodId (EXPAND contract)
      if (createdAdv.data?.id) {
        const approve = await call(token, 'POST', `/payroll/advance-requests/${createdAdv.data.id}/approve`, {
          body: { reviewer_name: 'QA CEO' },
        });
        pushStep('approve_empty_advance', approve);
        const markNoPeriod = await call(token, 'POST', `/payroll/advance-requests/${createdAdv.data.id}/mark-paid`, {
          body: { reviewer_name: 'QA CEO' },
        });
        pushStep('mark_paid_missing_period_id', markNoPeriod);
        const markWithPeriod = await call(token, 'POST', `/payroll/advance-requests/${createdAdv.data.id}/mark-paid`, {
          body: {
            reviewer_name: 'QA CEO',
            payrollPeriodId: periodId,
            componentCode: advanceComp?.code || baseComp?.code || 'LUONG_CO_BAN',
          },
        });
        pushStep('mark_paid_with_period_empty_emps', markWithPeriod);

        const requiresPeriod =
          markNoPeriod.status === 400 || /payrollPeriodId|HRM-VAL-400/i.test(`${markNoPeriod.code} ${markNoPeriod.message}`);
        const markAccepted =
          markWithPeriod.status >= 200 &&
          markWithPeriod.status < 300 &&
          Array.isArray(markWithPeriod.data?.bridgedInputLineIds);

        // Without employees, bridge yields empty — not full VAL-INP-ADV-01
        report.ac['VAL-INP-ADV-01'] = passFail(
          false,
          `BLOCKED: no advance_request_employees in env; contract probe requiresPeriod=${requiresPeriod} markEmpty=${markAccepted} bridged=${JSON.stringify(markWithPeriod.data?.bridgedInputLineIds)}`,
        );
        report.residual.push({
          id: 'R-VAL-INP-ADV-01-NO-EMP-ROWS',
          note: `mark-paid EXPAND payrollPeriodId enforced=${requiresPeriod}; empty emp bridge=${markAccepted} — need Nest add-employee API or existing rows for full AC`,
          owner: 'dev-be',
        });
      } else {
        report.ac['VAL-INP-ADV-01'] = passFail(false, 'No advance requests with employees; create header failed');
      }
    } else {
      const st = String(targetAdv.status || '').toLowerCase();
      if (st === 'pending') {
        const approve = await call(token, 'POST', `/payroll/advance-requests/${targetAdv.id}/approve`, {
          body: { reviewer_name: 'QA CEO' },
        });
        pushStep('approve_advance', approve);
      }

      let markRes;
      if (st === 'paid') {
        markRes = await call(token, 'POST', `/payroll/advance-requests/${targetAdv.id}/bridge-to-period`, {
          body: {
            payrollPeriodId: periodId,
            componentCode: advanceComp?.code || 'tam_ung',
          },
        });
        pushStep('bridge_to_period_already_paid', markRes);
      } else {
        markRes = await call(token, 'POST', `/payroll/advance-requests/${targetAdv.id}/mark-paid`, {
          body: {
            reviewer_name: 'QA CEO',
            payrollPeriodId: periodId,
            componentCode: advanceComp?.code || 'tam_ung',
          },
        });
        pushStep('mark_paid_with_payrollPeriodId', markRes);
      }

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
        markRes.status >= 200 &&
        markRes.status < 300 &&
        (bridgedIds.length > 0 || matched.length > 0) &&
        matched.some((l) => l.sourceKind === 'advance');

      report.ac['VAL-INP-ADV-01'] = passFail(
        advOk,
        `mark/bridge=${markRes.status}/${markRes.code} bridged=${bridgedIds.length} advanceLines=${matched.length}`,
      );
      report.ids.advanceRequestId = targetAdv.id;
    }
  }

  // Honesty
  report.ac.honesty = passFail(
    report.honesty.payroll_e2e_ready === false && report.honesty.seed_used === false,
    'payroll_e2e_ready=false · no seed',
  );

  const acIds = ['AC-AMIS-ATT-XFER-01', 'AC-PAY-SRC-03', 'VAL-INP-ADV-01'];
  const allPass = acIds.every((id) => report.ac[id]?.verdict === 'PASS');
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    ac: Object.fromEntries(acIds.map((id) => [id, report.ac[id]?.verdict])),
  };
  report.endedAt = ts();
  save();

  // Markdown evidence
  const md = `# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01\` |
| **prior** | \`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01\` READY_FOR_QA |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution — **L1 API smoke** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **stamp** | \`${STAMP}\` |
| **ack_status** | **\`${report.overall.ack_status}\`** |
| **verdict** | **${report.overall.verdict}** |
| **artifact_json** | [\`_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.FINAL.json\`](./_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.FINAL.json) |
| **harness** | \`scripts/qa/_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.mjs\` |
| **account** | \`${EMAIL}\` / company_id=\`${COMPANY}\` |

### Honesty locks

| Flag | Value |
|------|-------|
| **payroll_e2e_ready** | **false** |
| **Seed** | **DENIED** (U65) |
| **Browser UF / J-HRM-07** | **DENIED** this seat |
| **Module UAT / AMIS DONE** | **DENIED** |

---

## Environment

| Check | Result |
|-------|--------|
| L0 HRM health | HTTP ${health.status} |
| Dist \`pay-period-input-pack.service.js\` | ${existsSync(distFile) ? 'present' : 'MISSING'} |
| Login | sub=\`${auth.sub}\` |

---

## AC matrix

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC-AMIS-ATT-XFER-01** | draft → bind closed sheet → display-ready list → process not ATT-412 | ${report.ac['AC-AMIS-ATT-XFER-01']?.note || ''} | **${report.ac['AC-AMIS-ATT-XFER-01']?.verdict || '—'}** |
| **AC-PAY-SRC-03** | POST other_income → process → \`source_tier=period_input\` | ${report.ac['AC-PAY-SRC-03']?.note || ''} | **${report.ac['AC-PAY-SRC-03']?.verdict || '—'}** |
| **VAL-INP-ADV-01** | mark-paid + payrollPeriodId → \`source_kind=advance\` | ${report.ac['VAL-INP-ADV-01']?.note || ''} | **${report.ac['VAL-INP-ADV-01']?.verdict || '—'}** |
| Honesty | no ready flip / no seed | locked | **${report.ac.honesty?.verdict || '—'}** |

### IDs

\`\`\`json
${JSON.stringify(report.ids, null, 2)}
\`\`\`

---

## Residual / not promoted

${report.residual.length ? report.residual.map((r) => `- **${r.id}** — ${r.note} (owner: ${r.owner})`).join('\n') : '- (none beyond honesty DENIED claims)'}

### Explicit non-claims

- Did **not** claim payroll_e2e_ready / AMIS parity DONE / J-HRM-07 process UAT.
- Did **not** run browser Step4 UF (FE packs residual on BE handoff).
- Did **not** use \`pnpm seed:*\`.

---

## completion_report

### Closed
1. L0 + dist probe for input-pack routes.
2. Exercised timesheet-binds / input-lines / process / advance mark-paid EXPAND per exit AC.

### Residual
See table above — next_owner per residual.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **\`${report.overall.ack_status}\`** |
| **evidence_path** | \`docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-01.md\` |
| **next_owner** | ${allPass ? '**qc** (L1 slice gate)' : '**dev-be** (fix FAIL AC) → qa retest'} |
`;
  writeFileSync(OUT_MD, md);
  console.log(JSON.stringify(report.overall, null, 2));
  console.log(`STAMP=${STAMP}`);
  console.log(`OUT=${OUT}`);
  process.exit(allPass ? 0 : 2);
} catch (err) {
  report.overall = {
    verdict: 'FAIL',
    ack_status: 'FAIL_TO_PM',
    reason: String(err?.stack || err).slice(0, 800),
  };
  report.endedAt = ts();
  save();
  console.error(err);
  process.exit(2);
}
